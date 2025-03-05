import { Attribute } from "./attribute-model";

export class JsonEntity {
    name: string;
    attributes: Attribute[];
    type: string;
    baseType: string;

    constructor(name: string, attributes: Attribute[], type: string, baseType: string) {
        this.name = name;
        this.attributes = attributes;
        this.type = type;
        this.baseType = baseType;
    }
}

export { Attribute };
