import { domainmodels, IModel, JavaScriptSerializer, pages, projects, Version, constants, datatypes } from "mendixmodelsdk";
import { MendixPlatformClient, OnlineWorkingCopy, setPlatformConfig } from "mendixplatformsdk";
import { createAssociationsFromJson, createEntitiesFromJson } from "../utils/json-helper";
import * as fs from 'fs';
import { JsonEntity } from "../model/entity-model";
import { Association } from "../model/association-model";
import { ProcessedData } from "../model/processedData-model";
import { version } from "os";


import { createInVersionCheck, IVersionRange, IWorkingCopy } from "mendixmodelsdk/src/sdk/internal";
import { getCounter, incrementCounter } from "../public/counter"
import { Constants } from "../model/mxconstants-model";
import { ConfigTokenAndName } from "../public/config";


const token = '7LNgfs81pkLp6zUGE3sVAapprdmHKPYG2HeTCkaZgk6c2dFRhXJp1qkfk5mUy7BqWMxt2T9UnZvz8o9Bf7PSXeLWCWJUUKwUhXGM';
const nameAddition = "mxrfc_";
const moduleName: string = "SAP_RFC_Connector"
if (!token) {
    throw new Error("MENDIX_TOKEN not set");
}

/*setPlatformConfig({
    mendixToken: "7Tq2T31XzhDmNFsFDPugw2R61LxxoAfmvSztvA71kE6wHN7DXkvxZYgDs3Q9MrgBNZrEYt64s3jVfWtYDmzCtog3q5vRi8cdBqM1"
})**/

setPlatformConfig({
    mendixToken: token || undefined
})

async function makeNewModuleAndCommitWithDomainModel(model: IModel, compiteModuleName: string, entities: JsonEntity[], associations: Association[], workingCopy: OnlineWorkingCopy) {

    // creating new module
    const modelProject = model.allProjects()[0];
    const module = projects.Module.createIn(modelProject);
    module.name = compiteModuleName;
    await model.flushChanges();

    const domainModel = domainmodels.DomainModel.createIn(module);
    await model.flushChanges();

    model.allModules()
        .filter(module => module.name === compiteModuleName)
        .forEach(module =>
            console.log({
                name: module.name,
                appStoreVersion: module.appStoreVersion,
                appStoreGuid: module.appStoreGuid,
                appStoreVersionGuid: module.appStoreVersionGuid
            })
        );
    // Find the module by name
    const moduleName = compiteModuleName;
    const targetModule = model.allModules().find(mod => mod.name === moduleName);



    if (!targetModule) {
        console.error(`Module ${moduleName} not found`);
        return;
    }

    const domainModelInterface = model.allDomainModels().filter(dm => dm.containerAsModule.name === moduleName)[0];
    const currentDomainModel = await domainModelInterface.load();


    await createDomainModel(currentDomainModel, entities, associations, workingCopy);
}


export async function createDomainModelFromSelectedEntitysAndAttributes(selectedData: ProcessedData, isNewAppNeeded: boolean, constants: Constants | null) {

    const entities = checkForKeyWordsInEntityNameAndChange(selectedData.entities);
    const associations = checkForKeyWordsInAsscociationsNameAndChange(selectedData.associations);

    const client = new MendixPlatformClient();

    const responseName: JsonEntity = entities.filter(e => e.name.includes('_Response'))[0];
    const cleanResponseName: string = responseName.name.replace(/_Response$/, '');
    const compliteModuleName: string = 'RFC_' + cleanResponseName


    const app = await client.getApp("11bfb13c-2f88-4671-bbc2-8709d1d19cd3");

    const workingCopy = await app.createTemporaryWorkingCopy("main",);

    const versionRange: IVersionRange = {
        start: "10.00.0",
        end: "10.12.99"
    };

    const model = await workingCopy.openModel();

    createInVersionCheck(model, "domainmodels.DomainModel", versionRange);

    await makeNewModuleAndCommitWithDomainModel(model, compliteModuleName, entities, associations, workingCopy)

    // Find the module by name
    const moduleName = compliteModuleName;
    const targetModule = model.allModules().find(mod => mod.name === moduleName);

    if (!targetModule) {
        console.error(`Module ${moduleName} not found`);
        return;
    }

    const id = targetModule.id;

    // Create uniqe Name for Module
    const compliteMpkName: string = `RFC_${cleanResponseName}_${getCounter()}.mpk`;
    model.exportModuleMpk(id, `${compliteMpkName}`).then(mpkData => {
        incrementCounter();
    }).catch(error => {
        console.error('Failed to export module:', error);
    });

    model.closeConnection();


}


async function createDomainModel(domainModel: domainmodels.DomainModel, entities: JsonEntity[], associations: Association[], workingCopy: OnlineWorkingCopy) {

    const model = domainModel.model;
    //creating entity
    const entityMap: { [key: string]: domainmodels.Entity } = {};

    let xOffset = 100;
    let yOffset = 100;


    for (const entity of entities) {
        const mendixEntity = domainmodels.Entity.createIn(domainModel);
        mendixEntity.name = entity.name;
        mendixEntity.location = { x: xOffset, y: yOffset };

        const generalization = domainmodels.Generalization.createIn(mendixEntity);



        const inheritance = await setGeneralization(workingCopy, entity.baseType);

        if (inheritance === null) {
            throw new Error(`Entity '${entity.baseType}' not found`);
        }

        generalization.generalization = inheritance;


        // increase the offset of the entity to not be in the same place in mendix UI
        xOffset += 150;
        yOffset += 100;

        // adding attributes
        for (const attr of entity.attributes) {
            const attribute = domainmodels.Attribute.createIn(mendixEntity);
            // console.log(attr);
            attribute.name = checkForKeyWordsInAttributeName(attr.name);

            switch (attr.type.toLowerCase()) {
                case "string":
                    const stringAttributeType = domainmodels.StringAttributeType.create(model);
                    stringAttributeType.length = attr.length;
                    attribute.type = stringAttributeType;
                    break;
                case "datetime":
                    attribute.type = domainmodels.DateTimeAttributeType.create(model);
                    break;
                case "int":
                    attribute.type = domainmodels.IntegerAttributeType.create(model);
                    break;
                case "decimal":
                    attribute.type = domainmodels.DecimalAttributeType.create(model);

                    break;
                default:
                    throw new Error(`Unsupported attribute type: ${attr.type}`);
            }
        }

        entityMap[entity.name] = mendixEntity;

    }

    await model.flushChanges();

    for (const assoc of associations) {
        const association = domainmodels.Association.createIn(domainModel);
        association.name = assoc.name;
        if (assoc.fromMultiplicity == "1" && assoc.toMultiplicity == "*") {


            association.child = domainModel.entities.filter(entity => entity.name === assoc.fromEntity)[0];
            association.parent = domainModel.entities.filter(entity => entity.name === assoc.toEntity)[0];

            association.childConnection = { "x": 100, "y": 30 };
            association.parentConnection = { "x": 0, "y": 30 };
        }
        else if (assoc.fromMultiplicity == "1" && assoc.toMultiplicity == "1") {
            association.child = domainModel.entities.filter(entity => entity.name === assoc.fromEntity)[0];
            association.parent = domainModel.entities.filter(entity => entity.name === assoc.toEntity)[0];

            association.childConnection = { "x": 100, "y": 30 };
            association.parentConnection = { "x": 0, "y": 30 };
            association.type = domainmodels.AssociationType.Reference;
            association.owner = domainmodels.AssociationOwner.Both;
        }
        else if (assoc.fromMultiplicity == "*" && assoc.toMultiplicity == "1") {
            association.parent = domainModel.entities.filter(entity => entity.name === assoc.fromEntity)[0];
            association.child = domainModel.entities.filter(entity => entity.name === assoc.toEntity)[0];

            association.childConnection = { "x": 100, "y": 30 };
            association.parentConnection = { "x": 0, "y": 30 };
        }


    }
    await model.flushChanges();

    console.info(`Finished generating the module with the name: ${moduleName}.mpk`)

}

function checkForKeyWordsInEntityNameAndChange(entities: JsonEntity[]): JsonEntity[] {

    entities.forEach(entity => {
        let newName = entity.name;
        switch (entity.name.toLowerCase()) {
            case 'return':
            case 'id':
                newName = nameAddition + entity.name;
                break;
            default:
                break;
        }
        entity.name = newName;
    });
    return entities;
}

function isEntityNameKeyWord(entityName: string): boolean {

    switch (entityName.toLowerCase()) {
        case 'return':
        case 'id':
            return true;
        default:
            return false;
    }
}

function checkForKeyWordsInAsscociationsNameAndChange(association: Association[]): Association[] {

    association.forEach(a => {
        if (isEntityNameKeyWord(a.fromEntity)) {
            a.fromEntity = nameAddition + a.fromEntity;
        }
        else if (isEntityNameKeyWord(a.toEntity)) {
            a.toEntity = nameAddition + a.toEntity;
        }
    })
    return association;
}

function checkForKeyWordsInAttributeName(name: string): string {
    let newName;
    switch (name.toLocaleLowerCase()) {
        case 'type':
        case 'id':
            newName = nameAddition + name
            return newName;

        default:
            return name;
    }
}

async function setGeneralization(workingCopy: any, qualifiedName: string): Promise<domainmodels.Entity> {

    const inheritance = (await workingCopy.openModel()).findEntityByQualifiedName(qualifiedName);

    return inheritance;
}

// Utility function to send progress updates to the server
async function sendProgressToServer(progress: number) {
    await fetch('/api/generator/progress-update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
    });
}