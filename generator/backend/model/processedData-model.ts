import { Association } from "./association-model";
import { JsonEntity } from "./entity-model";

export interface ProcessedData {
    associations: Association[];
    entities: JsonEntity[];
}