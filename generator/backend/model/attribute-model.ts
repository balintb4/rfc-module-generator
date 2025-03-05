export class Attribute {
    name: string;
    length: number;
    description: string;
    type: string;

    constructor(name: string, length: number, description: string, type: string) {
        this.name = name;
        this.length = length;
        this.description = description;
        this.type = type;
    }
}