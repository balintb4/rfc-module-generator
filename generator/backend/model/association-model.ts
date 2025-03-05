export class Association {
    toEntity: string;
    toMultiplicity: string;
    fromEntity: string;
    fromMultiplicity: string;
    name: string;

    constructor(toEntity: string, toMultiplicity: string, fromEntity: string, fromMultiplicity: string, name: string) {
        this.toEntity = toEntity;
        this.toMultiplicity = toMultiplicity;
        this.fromEntity = fromEntity;
        this.fromMultiplicity = fromMultiplicity;
        this.name = name;
    }
}