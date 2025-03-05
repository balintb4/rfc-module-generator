import { Association } from "./association-model";
import { JsonEntity } from "./entity-model";

export class MendixEntityDTO {
    associations: Association[];
    entities: JsonEntity[];
    name: string;
    type: string;

    constructor(
        name: string,
        type: string,
        entities: JsonEntity[] = [],
        associations: Association[] = []
    ) {
        this.name = name;
        this.type = type;
        this.entities = entities;
        this.associations = associations;
    }
}
