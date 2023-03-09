import {
	assertArray,
	assertBoolean,
	assertInteger,
	assertKeys,
	assertNumber,
	assertObject,
	assertString,
	assertTuple
} from './assert';
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
		if (operator.startsWith('$$')) return context[operator.slice(2)];
		if (operator.startsWith('$')) return data[operator.slice(1)];
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
		return array.at(idx) || null;
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
		return value.at(0) || null;
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

	if ('$isArray' in operator) {
		const value = resolveOperator(operator.$isArray, data, context);
		return value instanceof Array;
	}

	if ('$last' in operator) {
		const value = resolveOperator(operator.$last, data, context);
		assertArray(value);
		return value.at(-1) || null;
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
							store += (bValue as number) - (aValue as number);
						} else {
							store += (aValue as number) - (bValue as number);
						}
					}

					if (typeof aValue === 'string' && typeof bValue === 'string') {
						if (sortBy[key] === 1) {
							store += bValue.localeCompare(aValue);
						} else {
							store += aValue.localeCompare(bValue);
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

	// v has 1 key, but it isn't an operator; just return it
	return resolveObject(operator, data, context);
};
