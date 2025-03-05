import * as fs from 'fs';
import { Association } from '../model/association-model'; 
import { JsonEntity, Attribute } from '../model/entity-model'; 
import { MendixEntityDTO } from '../model/mendix-entity-model';

const jsonFilePath = "./data/test.json";

// Verarbeitung des Jsons als Test mit test.json
export function readJsonFile(filePath: string) {
    try {

        
        const jsonData = fs.readFileSync(filePath, 'utf-8'); // JSON-Daten aus der Datei lesen

        const jsonParsed = JSON.parse(jsonData); // JSON-Daten einmalig parsen

        const associations: Association[] = createAssociationsFromJson(jsonParsed); // Associations erstellen
        const entities: JsonEntity[] = createEntitiesFromJson(jsonParsed); // Entities erstellen

        // Logging der erstellten Objekte und ihrer Längen
        console.log('Associations:');
        console.log(associations);
        console.log('Number of associations:', associations.length);

        console.log('Entities:');
        console.log(entities);
        console.log('Number of entities:', entities.length);

    } catch (error) {
        console.error('Error reading or processing JSON file:', error);
    }
}

// Verarbeitung von JSON aus HTTP Request
export function processJsonData(jsonData: any){
    try{
        const associations: Association[] = createAssociationsFromJson(jsonData);
        const entities: JsonEntity[] = createEntitiesFromJson(jsonData);

        return {associations, entities};

    } catch(error){
        console.error('Error processing JSON data:', error);
    }
}

export function createAssociationsFromJson(jsonParsed: any): Association[] {
    let associations: Association[] = [];
    try {
        if (Array.isArray(jsonParsed[0]?.associations)) {
            associations = jsonParsed[0].associations.map((assoc: any) => new Association(
                assoc.toEntity,
                assoc.toMultiplicity,
                assoc.fromEntity,
                assoc.fromMultiplicity,
                assoc.name
            ));
        }

    } catch (error) {
        console.error('Error parsing JSON for associations:', error);
    }

    return associations;
}

export function createEntitiesFromJson(jsonParsed: any): JsonEntity[] {
    let entities: JsonEntity[] = [];
    try {
        if (Array.isArray(jsonParsed[0]?.entities)) { 
            entities = jsonParsed[0].entities.map((ent: any) => {
                const attributes: Attribute[] = [];
                if (Array.isArray(ent.attributes)) {
                    console.log(attributes.length)
                    for (let attr of ent.attributes) {
                        attributes.push(new Attribute(
                            attr.name,
                            attr.length,
                            attr.description,
                            attr.type
                        ));
                    }
                }
                return new JsonEntity(
                    ent.name,
                    attributes,
                    ent.type,
                    ent.baseType
                );
            });
        }

    } catch (error) {
        console.error('Error parsing JSON for entities:', error);
    }

    return entities;
}

