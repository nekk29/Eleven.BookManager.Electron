import { Operand } from "./Operand";
import {
    Filter,
    EmptyFilter,
    AndFilter,
    OrFilter,
    EqualFilter,
    NotEqualFilter,
    LessThanFilter,
    LessThanOrEqualFilter,
    GreaterThanFilter,
    GreaterThanOrEqualFilter,
    IsFilter,
    IsNotFilter,
    ContainsFilter,
    NotContainsFilter,
    StartsWithFilter,
    EndsWithFilter,
    BetweenFilter,
    NotBetweenFilter,
    InFilter,
    InSubQueryFilter,
    NotInFilter,
    NotInSubQueryFilter
} from "./Filter";

export default class FilterBuilder {
    static Empty(): EmptyFilter { return new EmptyFilter(); }
    static And(filters: Filter[]): AndFilter { return new AndFilter(filters); }
    static Or(filters: Filter[]): OrFilter { return new OrFilter(filters); }
    static Equal(left: Operand, right: Operand): EqualFilter { return new EqualFilter(left, right); }
    static NotEqual(left: Operand, right: Operand): NotEqualFilter { return new NotEqualFilter(left, right); }
    static LessThan(left: Operand, right: Operand): LessThanFilter { return new LessThanFilter(left, right); }
    static LessThanOrEqual(left: Operand, right: Operand): LessThanOrEqualFilter { return new LessThanOrEqualFilter(left, right); }
    static GreaterThan(left: Operand, right: Operand): GreaterThanFilter { return new GreaterThanFilter(left, right); }
    static GreaterThanOrEqual(left: Operand, right: Operand): GreaterThanOrEqualFilter { return new GreaterThanOrEqualFilter(left, right); }
    static Is(left: Operand, right: Operand): IsFilter { return new IsFilter(left, right); }
    static IsNot(left: Operand, right: Operand): IsNotFilter { return new IsNotFilter(left, right); }
    static Contains(left: Operand, right: Operand): ContainsFilter { return new ContainsFilter(left, right); }
    static NotContains(left: Operand, right: Operand): NotContainsFilter { return new NotContainsFilter(left, right); }
    static StartsWith(left: Operand, right: Operand): StartsWithFilter { return new StartsWithFilter(left, right); }
    static EndsWith(left: Operand, right: Operand): EndsWithFilter { return new EndsWithFilter(left, right); }
    static Between(left: Operand, min: Operand, max: Operand): BetweenFilter { return new BetweenFilter(left, min, max); }
    static NotBetween(left: Operand, min: Operand, max: Operand): NotBetweenFilter { return new NotBetweenFilter(left, min, max); }
    static In(left: Operand, values: Operand[]): InFilter { return new InFilter(left, values); }
    static InSubQuery(left: Operand, right: Operand): InSubQueryFilter { return new InSubQueryFilter(left, right); }
    static NotIn(left: Operand, values: Operand[]): NotInFilter { return new NotInFilter(left, values); }
    static NotInSubQuery(left: Operand, right: Operand): NotInSubQueryFilter { return new NotInSubQueryFilter(left, right); }
}
