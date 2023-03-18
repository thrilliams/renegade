import {
	assertArray,
	assertBoolean,
	assertInteger,
	assertKeys,
	assertNotNull,
	assertNumber,
	assertObject,
	assertString,
	assertTuple
} from './assert';
import { at } from './at';
import { resolveDotNotation } from './resolveDotNotation';
import { resolveObject } from './resolveObject';
import { JsonSerializable } from './types/JsonSerializable';
import type { Operator } from './types/Operator';

export const resolveOperator = (
	operator: Operator,
	data: Record<string, JsonSerializable>,
	context: Record<string, JsonSerializable> = {}
): JsonSerializable => {
	// if v is primitive, return it
	if (typeof operator === 'boolean' || typeof operator === 'number' || operator === null)
		return operator;
	if (typeof operator === 'string') {
		if (operator.startsWith('$$')) return resolveDotNotation(context, operator.slice(2));
		if (operator.startsWith('$')) return resolveDotNotation(data, operator.slice(1));
		else return operator;
	}
	// if v is an array, iterate over it
	if (operator instanceof Array)
		return operator.map((value) => resolveOperator(value, data, context));
	// if v has a number of keys other than 1, iterate over it
	if (Object.keys(operator).length !== 1) return resolveObject(operator, data, context);

	// Arithmetic Expression Operators
	if ('$abs' in operator) {
		const value = resolveOperator(operator.$abs, data, context);
		assertNumber(value);
		return Math.abs(value);
	}

	if ('$add' in operator) {
		const value = resolveOperator(operator.$add, data, context);

		assertArray(value);
		return value.reduce((accumulator, current) => {
			assertNumber(current);
			return (accumulator as number) + current;
		}, 0) as number;
	}

	if ('$ceil' in operator) {
		const value = resolveOperator(operator.$ceil, data, context);
		assertNumber(value);
		return Math.ceil(value);
	}

	if ('$divide' in operator) {
		const value = resolveOperator(operator.$divide, data, context);

		assertTuple(value, 2);
		const [a, b] = value;

		assertNumber(a);
		assertNumber(b);
		return a / b;
	}

	if ('$exp' in operator) {
		const value = resolveOperator(operator.$exp, data, context);

		assertTuple(value, 2);
		const [a, b] = value;

		assertNumber(a);
		assertNumber(b);
		return Math.pow(a, b);
	}

	if ('$floor' in operator) {
		const value = resolveOperator(operator.$floor, data, context);
		assertNumber(value);
		return Math.floor(value);
	}

	if ('$ln' in operator) {
		const value = resolveOperator(operator.$ln, data, context);
		assertNumber(value);
		return Math.log(value);
	}

	if ('$log' in operator) {
		const value = resolveOperator(operator.$log, data, context);

		assertTuple(value, 2);
		const [number, base] = value;

		assertNumber(number);
		assertNumber(base);
		return Math.log(number) / Math.log(base);
	}

	if ('$log10' in operator) {
		const value = resolveOperator(operator.$log10, data, context);
		assertNumber(value);
		return Math.log10(value);
	}

	if ('$mod' in operator) {
		const value = resolveOperator(operator.$mod, data, context);

		assertTuple(value, 2);
		const [dividend, divisor] = value;

		assertNumber(dividend);
		assertNumber(divisor);
		return dividend % divisor;
	}

	if ('$multiply' in operator) {
		const value = resolveOperator(operator.$multiply, data, context);
		assertArray(value);

		return value.reduce((total: number, item: JsonSerializable) => {
			assertNumber(item);
			return total * item;
		}, 1);
	}

	if ('$pow' in operator) {
		const value = resolveOperator(operator.$pow, data, context);

		assertTuple(value, 2);
		const [number, exponent] = value;

		assertNumber(number);
		assertNumber(exponent);
		return Math.pow(number, exponent);
	}

	if ('$round' in operator) {
		const value = resolveOperator(operator.$round, data, context);

		assertTuple(value, 2);
		const [number, placeParam] = value;
		assertNumber(number);

		let place = 0;
		if (placeParam !== undefined) {
			assertInteger(placeParam);
			place = placeParam;
		}

		const multiplier = Math.pow(10, place);
		return Math.round(number * multiplier) / multiplier;
	}

	if ('$sqrt' in operator) {
		const value = resolveOperator(operator.$sqrt, data, context);
		assertNumber(value);
		return Math.sqrt(value);
	}

	if ('$subtract' in operator) {
		const value = resolveOperator(operator.$subtract, data, context);

		assertTuple(value, 2);
		const [first, second] = value;

		assertNumber(first);
		assertNumber(second);
		return first - second;
	}

	if ('$trunc' in operator) {
		const value = resolveOperator(operator.$trunc, data, context);

		assertTuple(value, 2);
		const [number, placeParam] = value;
		assertNumber(number);

		let place = 0;
		if (placeParam !== undefined) {
			assertInteger(placeParam);
			place = placeParam;
		}

		const multiplier = Math.pow(10, place);
		return Math.floor(number * multiplier) / multiplier;
	}

	// Array Expression Operators
	if ('$arrayElemAt' in operator) {
		const value = resolveOperator(operator.$arrayElemAt, data, context);

		assertTuple(value, 2);
		const [array, idx] = value;

		if (array === null) return null;
		assertArray(array);
		assertInteger(idx);
		return at(array, idx) || null;
	}

	if ('$arrayToObject' in operator) {
		const value = resolveOperator(operator.$arrayToObject, data, context);

		assertArray(value);
		const pairs = value[0] instanceof Array;

		const object: JsonSerializable = {};
		for (const entry of value) {
			if (pairs) {
				assertTuple(entry, 2);
				const [k, v] = entry;
				assertString(k);
				object[k] = v;
			} else {
				assertKeys(entry, ['k', 'v']);
				const { k, v } = entry;
				assertString(k);
				object[k] = v;
			}
		}

		return object;
	}

	if ('$concatArrays' in operator) {
		const value = resolveOperator(operator.$concatArrays, data, context);

		assertArray(value);
		const array: JsonSerializable = [];
		for (const entry of value) {
			assertArray(entry);
			array.push(...entry);
		}

		return array;
	}

	if ('$filter' in operator) {
		assertKeys(operator.$filter, ['input', 'cond'], ['as', 'limit']);
		const { input: inputOp, cond, as: asOp, limit: limitOp } = operator.$filter;

		const input = resolveOperator(inputOp, data, context);
		assertArray(input);

		let as = 'this';
		if (asOp !== undefined) {
			const asResolved = resolveOperator(asOp, data, context);
			assertString(asResolved);
			as = asResolved;
		}

		const items = input.filter((item) => {
			const determinant = resolveOperator(cond, data, { ...context, [as]: item });
			assertBoolean(determinant);
			return determinant;
		});

		if (limitOp !== undefined) {
			const limit = resolveOperator(limitOp, data, context);
			if (limit === null) return items;
			assertInteger(limit);
			if (limit < 1) throw `limit cannot be a number less than 1!`;
			return items.slice(0, limit);
		} else {
			return items;
		}
	}

	if ('$first' in operator) {
		const value = resolveOperator(operator.$first, data, context);
		assertArray(value);
		return at(value, 0) || null;
	}

	if ('$firstN' in operator) {
		const value = resolveOperator(operator.$firstN, data, context);

		assertKeys(value, ['input', 'n']);
		const { input, n } = value;

		assertArray(input);

		assertInteger(n);
		if (n < 1) throw 'n cannot be a number less than 1!';
		return input.slice(0, n);
	}

	if ('$in' in operator) {
		const value = resolveOperator(operator.$in, data, context);

		assertTuple(value, 2);
		const [item, array] = value;

		assertArray(array);
		return array.includes(item);
	}

	if ('$indexOfArray' in operator) {
		const value = resolveOperator(operator.$indexOfArray, data, context);

		assertTuple(value, 2, 4);
		const [arrayExpression, searchExpression, start, end] = value;

		assertArray(arrayExpression);
		if (start !== undefined) assertInteger(start);
		if (end !== undefined) assertInteger(end);

		return arrayExpression.slice(start, end).indexOf(searchExpression);
	}

	if ('$isArray' in operator) {
		const value = resolveOperator(operator.$isArray, data, context);
		return value instanceof Array;
	}

	if ('$last' in operator) {
		const value = resolveOperator(operator.$last, data, context);
		assertArray(value);
		return at(value, -1) || null;
	}

	if ('$lastN' in operator) {
		const value = resolveOperator(operator.$lastN, data, context);

		assertKeys(value, ['input', 'n']);
		const { input, n } = value;

		assertArray(input);

		assertInteger(n);
		if (n < 1) throw 'n cannot be a number less than 1!';
		return input.slice(-n);
	}

	if ('$map' in operator) {
		assertKeys(operator.$map, ['input', 'in'], ['as']);
		const { input: inputOp, in: inOp, as: asOp } = operator.$map;

		const input = resolveOperator(inputOp, data, context);
		assertArray(input);

		let as = 'this';
		if (asOp !== undefined) {
			const asResolved = resolveOperator(asOp, data, context);
			assertString(asResolved);
			as = asResolved;
		}

		return input.map((item) => resolveOperator(inOp, data, { ...context, [as]: item }));
	}

	if ('$maxN' in operator) {
		const value = resolveOperator(operator.$maxN, data, context);

		assertKeys(value, ['input', 'n']);
		const { input, n } = value;

		assertArray(input);
		const items = [...input].sort((a, b) => {
			assertNumber(a);
			assertNumber(b);
			return b - a;
		});

		assertInteger(n);
		if (n < 1) throw 'n cannot be a number less than 1!';
		return items.slice(0, n);
	}

	if ('$minN' in operator) {
		const value = resolveOperator(operator.$minN, data, context);

		assertKeys(value, ['input', 'n']);
		const { input, n } = value;

		assertArray(input);
		const items = [...input].sort((a, b) => {
			assertNumber(a);
			assertNumber(b);
			return a - b;
		});

		assertInteger(n);
		if (n < 1) throw 'n cannot be a number less than 1!';
		return items.slice(0, n);
	}

	if ('$objectToArray' in operator) {
		const value = resolveOperator(operator.$objectToArray, data, context);
		assertObject(value);
		return Object.entries(value).map(([k, v]) => ({ k, v }));
	}

	if ('$range' in operator) {
		const value = resolveOperator(operator.$range, data, context);

		assertTuple(value, 2, 3);
		const [start, end, stepParam] = value;
		assertInteger(start);
		assertInteger(end);

		let step = 1;
		if (stepParam !== undefined) {
			assertInteger(stepParam);
			if (stepParam === 0) throw `step must be a non-zero integer!`;
			step = stepParam;
		}

		if ((end - start) / step < 0) return [];

		const range: number[] = [];
		if (step > 0) {
			for (let i = start; i < end; i += step) {
				range.push(i);
			}
		} else {
			for (let i = start; i > end; i += step) {
				range.push(i);
			}
		}

		return range;
	}

	if ('$reduce' in operator) {
		assertKeys(operator.$reduce, ['input', 'initialValue', 'in']);
		const { input: inputOp, initialValue: initialOp, in: inOp } = operator.$reduce;

		const input = resolveOperator(inputOp, data, context);
		assertArray(input);

		const initialValue = resolveOperator(initialOp, data, context);
		return input.reduce(
			(value, thisParam) =>
				resolveOperator(inOp, data, { ...context, value, this: thisParam }),
			initialValue
		);
	}

	if ('$reverseArray' in operator) {
		const value = resolveOperator(operator.$reverseArray, data, context);
		assertArray(value);
		return [...value].reverse();
	}

	if ('$size' in operator) {
		const value = resolveOperator(operator.$size, data, context);
		assertArray(value);
		return value.length;
	}

	if ('$slice' in operator) {
		const value = resolveOperator(operator.$slice, data, context);

		assertTuple(value, 2, 3);
		const [array, positionOrN, n] = value;

		assertArray(array);

		assertInteger(positionOrN);
		if (n !== undefined) {
			assertInteger(n);
			if (n < 1) throw `n must be positive while position is defined!`;
			return array.slice(positionOrN, positionOrN + n);
		} else {
			return array.slice(positionOrN);
		}
	}

	if ('$sortArray' in operator) {
		const value = resolveOperator(operator.$sortArray, data, context);

		assertKeys(value, ['input', 'sortBy']);
		const { input, sortBy } = value;
		assertArray(input);

		if (typeof sortBy === 'number') {
			if (sortBy !== 1 && sortBy !== -1) throw `sort directions must be either 1 or -1!`;
			return [...input].sort((a, b) => {
				if (sortBy === 1) return a - b;
				else return b - a;
			});
		} else {
			assertObject(sortBy);
			const sorted = [...input].sort((a, b) => {
				let store = 0;
				for (let key in sortBy) {
					assertNumber(sortBy[key]);
					if (sortBy[key] !== 1 && sortBy[key] !== -1)
						throw `sort directions must be either 1 or -1!`;

					const aValue = resolveDotNotation(a, key);
					const bValue = resolveDotNotation(b, key);

					if (
						(typeof aValue === 'number' || typeof aValue === 'boolean') &&
						(typeof bValue === 'number' || typeof bValue === 'boolean')
					) {
						if (sortBy[key] === 1) {
							store += (aValue as number) - (bValue as number);
						} else {
							store += (bValue as number) - (aValue as number);
						}
					}

					if (typeof aValue === 'string' && typeof bValue === 'string') {
						if (sortBy[key] === 1) {
							store += aValue.localeCompare(bValue);
						} else {
							store += bValue.localeCompare(aValue);
						}
					}
				}
				return store;
			});
			return sorted;
		}
	}

	if ('$zip' in operator) {
		const value = resolveOperator(operator.$zip, data, context);

		assertKeys(value, ['inputs'], ['useLongestLength', 'defaults']);
		const { inputs, useLongestLength: useLongestLengthParam, defaults: defaultsParam } = value;

		assertArray(inputs);
		for (const array of inputs) {
			if (array === null) return null;
			assertArray(array);
		}

		let useLongestLength = false;
		if (useLongestLengthParam !== undefined) {
			assertBoolean(useLongestLengthParam);
			useLongestLength = useLongestLengthParam;
		}

		let defaults = new Array(inputs.length).fill(null);
		if (defaultsParam !== undefined) {
			assertTuple(defaultsParam, inputs.length);
			defaults = defaultsParam;
		}

		// take the shortest array length unless useLongest is true
		let length = (useLongestLength ? Math.max : Math.min)(...inputs.map((e) => e.length));

		const array = [];
		for (let i = 0; i < length; i++) {
			const entry = [];
			for (let j = 0; j < inputs.length; j++) {
				if (i < inputs[j].length) entry.push(inputs[j][i]);
				else entry.push(defaults[j]);
			}
			array.push(entry);
		}
		return array;
	}

	// Boolean Expression Operators
	if ('$and' in operator) {
		const value = resolveOperator(operator.$and, data, context);
		assertArray(value);
		return value.every((item) => {
			assertBoolean(item);
			return item;
		});
	}

	if ('$not' in operator) {
		const value = resolveOperator(operator.$not, data, context);
		assertTuple(value, 1);

		const [param] = value;
		assertBoolean(param);
		return !param;
	}

	if ('$or' in operator) {
		const value = resolveOperator(operator.$or, data, context);
		assertArray(value);
		return value.some((item) => {
			assertBoolean(item);
			return item;
		});
	}

	// Comparison Expression Operators
	if ('$cmp' in operator) {
		const value = resolveOperator(operator.$cmp, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		if (first === second || first === null || second === null) return 0;
		if (first > second) return 1;
		if (first < second) return -1;
	}

	if ('$eq' in operator) {
		const value = resolveOperator(operator.$eq, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		return first === second;
	}

	if ('$gt' in operator) {
		const value = resolveOperator(operator.$gt, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		assertNotNull(first);
		assertNotNull(second);
		return first > second;
	}

	if ('$gte' in operator) {
		const value = resolveOperator(operator.$gte, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		assertNotNull(first);
		assertNotNull(second);
		return first >= second;
	}

	if ('$lt' in operator) {
		const value = resolveOperator(operator.$lt, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		assertNotNull(first);
		assertNotNull(second);
		return first < second;
	}

	if ('$lte' in operator) {
		const value = resolveOperator(operator.$lte, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		assertNotNull(first);
		assertNotNull(second);
		return first <= second;
	}

	if ('$ne' in operator) {
		const value = resolveOperator(operator.$ne, data, context);
		assertTuple(value, 2);

		const [first, second] = value;
		return first !== second;
	}

	// Conditional Expression Operators
	if ('$cond' in operator) {
		if (typeof operator.$cond !== 'object') throw `$cond must be an array or an object!`;

		let ifOp, thenOp, elseOp;
		if (operator.$cond instanceof Array) {
			assertTuple(operator.$cond, 3);
			[ifOp, thenOp, elseOp] = operator.$cond;
		} else {
			assertKeys(operator.$cond, ['if', 'then', 'else']);
			ifOp = operator.$cond.if;
			thenOp = operator.$cond.then;
			elseOp = operator.$cond.else;
		}

		const ifParam = resolveOperator(ifOp, data, context);

		assertBoolean(ifParam);
		return ifParam
			? resolveOperator(thenOp, data, context)
			: resolveOperator(elseOp, data, context);
	}

	if ('$ifNull' in operator) {
		const value = resolveOperator(operator.$ifNull, data, context);
		assertArray(value);
		if (value.length < 2) throw `$ifNull requires at least parameters!`;
		for (let i = 0; i < value.length; i++) {
			if (i === value.length - 1 || value !== null) return value;
		}
	}

	if ('$switch' in operator) {
		// TODO: refactor to only evaluate branches when valid
		const value = resolveOperator(operator.$switch, data, context);
		assertKeys(value, ['branches'], ['default']);

		const { branches, default: defaultParam } = value;

		assertArray(branches);
		for (const branch of branches) {
			assertKeys(branch, ['case', 'then']);
			const { case: caseParam, then } = branch;
			assertBoolean(caseParam);
			if (caseParam) return then;
		}

		if (defaultParam === undefined)
			throw `$switch terminated without a valid branch and without a value for "default"!`;
		return defaultParam;
	}

	// Literal Expression Operator
	if ('$literal' in operator) {
		return operator.$literal;
	}

	// Miscellaneous Operators
	if ('$getField' in operator) {
		const value = resolveOperator(operator.$getField, data, context);
		assertKeys(value, ['field', 'input']);

		const { field, input } = value;
		assertString(field);
		if (typeof input !== 'object') throw `$getField input param must not be a primitive value!`;

		return resolveDotNotation(input, field);
	}

	if ('$rand' in operator) {
		const value = resolveOperator(operator.$rand, data, context);
		assertKeys(value, []);
		return Math.random();
	}

	// Object Expression Operators
	if ('$mergeObjects' in operator) {
		const value = resolveOperator(operator.$mergeObjects, data, context);
		assertArray(value);

		let obj: JsonSerializable = {};
		for (const item of value) {
			assertObject(item);
			obj = { ...obj, ...item };
		}
		return obj;
	}

	// Set Expression Operators
	if ('$allElementsTrue' in operator) {
		const value = resolveOperator(operator.$allElementsTrue, data, context);
		assertTuple(value, 1);

		const [expression] = value;
		assertArray(expression);

		const set = new Set(expression);
		for (const entry of set) {
			if (entry === false || entry === null || entry === 0) return false;
		}
		return true;
	}

	if ('$anyElementTrue' in operator) {
		const value = resolveOperator(operator.$anyElementTrue, data, context);
		assertTuple(value, 1);

		const [expression] = value;
		assertArray(expression);

		const set = new Set(expression);
		for (const entry of set) {
			if (entry !== false && entry !== null && entry !== 0) return true;
		}
		return false;
	}

	if ('$setDifference' in operator) {
		const value = resolveOperator(operator.$setDifference, data, context);
		assertTuple(value, 2);

		const [firstArray, secondArray] = value;
		assertArray(firstArray);
		assertArray(secondArray);

		const first = new Set(firstArray);
		const second = new Set(secondArray);

		return [...first].filter((item) => second.has(item));
	}

	if ('$setEquals' in operator) {
		const value = resolveOperator(operator.$setEquals, data, context);
		assertArray(value);

		const [firstArray, ...restArrays] = value;
		assertArray(firstArray);

		const first = new Set(firstArray);
		for (const array of restArrays) {
			assertArray(array);
			const set = new Set(array);
			if (first.size !== set.size) return false;
			if ([...first].some((item) => !set.has(item))) return false;
		}

		return true;
	}

	if ('$setIntersection' in operator) {
		const value = resolveOperator(operator.$setIntersection, data, context);
		assertArray(value);

		const [firstArray, ...restArrays] = value;
		assertArray(firstArray);

		const first = new Set(firstArray);
		for (const array of restArrays) {
			assertArray(array);
			const set = new Set(array);
			for (const item of first) {
				if (!set.has(item)) first.delete(item);
			}
		}

		return [...first];
	}

	if ('$setIsSubset' in operator) {
		const value = resolveOperator(operator.$setIsSubset, data, context);
		assertTuple(value, 2);

		const [firstArray, secondArray] = value;
		assertArray(firstArray);
		assertArray(secondArray);

		const first = new Set(firstArray);
		const second = new Set(secondArray);

		return [...first].every((item) => second.has(item));
	}

	if ('$setUnion' in operator) {
		const value = resolveOperator(operator.$setUnion, data, context);
		assertArray(value);

		const [firstArray, ...restArrays] = value;
		assertArray(firstArray);

		const first = new Set(firstArray);
		for (const array of restArrays) {
			assertArray(array);
			const set = new Set(array);
			for (const item of set) first.add(item);
		}

		return [...first];
	}

	// String Expression Operators
	if ('$concat' in operator) {
		const value = resolveOperator(operator.$concat, data, context);
		assertArray(value);

		let string = '';
		for (const item of value) {
			if (typeof item === 'object')
				throw `$concat param ${item} cannot be an object or array!`;
			string += item;
		}
		return string;
	}

	// Variable Expression Operators
	if ('$let' in operator) {
		assertKeys(operator.$let, ['vars', 'in']);
		const { vars: varsOp, in: inOp } = operator.$let;

		const vars = resolveOperator(varsOp, data, context);
		assertObject(vars);

		// this is dumb
		return resolveOperator(inOp, data, {
			...context,
			...(vars as Record<string, JsonSerializable>)
		});
	}

	// v has 1 key, but it isn't an operator; just return it
	return resolveObject(operator, data, context);
};
