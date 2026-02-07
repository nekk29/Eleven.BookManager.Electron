/* eslint-disable @typescript-eslint/no-explicit-any */
export class Operand {
    private type?: 'column' | 'expression' | 'value';
    private value: any;

    constructor(type: 'column' | 'expression' | 'value', value: any) {
        this.type = type;
        this.value = value;
    }

    render(addQuotes: boolean = true) {
        if (this.type === 'column' || this.type === 'expression')
            return `${this.value}`;

        if (this.value instanceof Date)
            return `${this.value.toISOString()}`;

        const typeOf = typeof this.value;

        switch (typeOf) {
            case "string":
                return addQuotes ? `'${this.value}'` : this.value;
            case "number":
                return `${this.value}`;
            case "bigint":
                return `${this.value}`;
            case "boolean":
                return `${this.value === false ? '0' : '1'}`;
        }

        throw Error(`Type ${typeOf} is not supported as filter operand.`)
    }
}

export default class Operands {
    static fromValue(value: any): Operand { return new Operand('value', value) }
    static fromColumn(column: any): Operand { return new Operand('column', column) }
    static fromExpression(expression: any): Operand { return new Operand('expression', expression) }
}
