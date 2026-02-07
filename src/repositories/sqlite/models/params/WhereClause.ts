import { SQLInputValue } from "node:sqlite";

export default interface WhereClause {
    expression: string;
    params: SQLInputValue[];
}
