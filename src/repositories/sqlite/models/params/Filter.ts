import { Operand } from "./Operand";

export interface Filter {
    render: () => string;
}

export class EmptyFilter implements Filter {
    render(): string { return ``; }
}

export class AndFilter implements Filter {
    filters: Filter[];
    constructor(filters: Filter[]) { this.filters = filters; }
    render(): string {
        const expression = this.filters.map(f => f.render()).join(' AND ');
        return expression ? `(${expression})` : '';
    }
}

export class OrFilter implements Filter {
    filters: Filter[];
    constructor(filters: Filter[]) { this.filters = filters; }
    render(): string {
        const expression = this.filters.map(f => f.render()).join(' OR ');
        return expression ? `(${expression})` : '';
    }
}

export class EqualFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} = ${this.right.render()}`; }
}

export class NotEqualFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} != ${this.right.render()}`; }
}

export class LessThanFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} < ${this.right.render()}`; }
}

export class LessThanOrEqualFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} <= ${this.right.render()}`; }
}

export class GreaterThanFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} > ${this.right.render()}`; }
}

export class GreaterThanOrEqualFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} >= ${this.right.render()}`; }
}

export class IsFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} IS ${this.right.render()}`; }
}

export class IsNotFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} IS NOT ${this.right.render()}`; }
}

export class ContainsFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} LIKE '%${this.right.render(false)}%'`; }
}

export class NotContainsFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} NOT LIKE '%${this.right.render(false)}%'`; }
}

export class StartsWithFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} LIKE '${this.right.render(false)}%'`; }
}

export class EndsWithFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} LIKE '%${this.right.render(false)}'`; }
}

export class BetweenFilter implements Filter {
    left: Operand; min: Operand; max: Operand;
    constructor(left: Operand, min: Operand, max: Operand) { this.left = left; this.min = min; this.max = max; }
    render(): string { return `${this.left.render()} BETWEEN ${this.min.render()} AND ${this.max.render()}`; }
}

export class NotBetweenFilter implements Filter {
    left: Operand; min: Operand; max: Operand;
    constructor(left: Operand, min: Operand, max: Operand) { this.left = left; this.min = min; this.max = max; }
    render(): string { return `${this.left.render()} BETWEEN ${this.min.render()} AND ${this.max.render()}`; }
}

export class InFilter implements Filter {
    left: Operand; values: Operand[];
    constructor(left: Operand, values: Operand[]) { this.left = left; this.values = values; }
    render(): string { return `${this.left.render()} IN (${this.values.map(v => v.render()).join(', ')})`; }
}

export class InSubQueryFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} IN (${this.right.render()})`; }
}

export class NotInFilter implements Filter {
    left: Operand; values: Operand[];
    constructor(left: Operand, values: Operand[]) { this.left = left; this.values = values; }
    render(): string { return `${this.left.render()} NOT IN (${this.values.map(v => v.render()).join(', ')})`; }
}

export class NotInSubQueryFilter implements Filter {
    left: Operand; right: Operand;
    constructor(left: Operand, right: Operand) { this.left = left; this.right = right; }
    render(): string { return `${this.left.render()} NOT IN (${this.right.render()})`; }
}
