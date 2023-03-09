export function assertBoolean(v: any): asserts v is boolean {
	if (typeof v !== 'boolean') throw `value ${v} must be of type boolean!`;
}

export function assertNumber(v: any): asserts v is number {
	if (typeof v !== 'number') throw `value ${v} must be of type number!`;
}

export function assertInteger(v: any): asserts v is number {
	assertNumber(v);
	if (v % 1 !== 0) throw `value ${v} must be an integer!`;
}

export function assertString(v: any): asserts v is string {
	if (typeof v !== 'string') throw `value ${v} must be of type string!`;
}

export function assertNull(v: any): asserts v is null {
	if (v !== null) throw `value ${v} must be null!`;
}

export function assertNotNull<T>(v: T): asserts v is NonNullable<T> {
	if (v === null) throw `value ${v} must not be null!`;
}

export function assertObject(v: any): asserts v is Record<string, any> {
	if (typeof v !== 'object' || v instanceof Array) throw `value ${v} must be an object!`;
}

export function assertKeys<T extends string, O extends string>(
	v: any,
	keys: T[],
	optional: O[] = []
): asserts v is Record<T, any> & Record<O, any> {
	assertObject(v);
	const numKeys = Object.keys(v).length;
	// quick check for key amounts
	if (numKeys < keys.length) throw `value ${v} must have keys ${keys}!`;
	if (numKeys > keys.length + optional.length)
		throw `value ${v} may not have keys other than ${keys} and ${optional}!`;
	for (const key of keys) {
		// ensure mandatory keys
		if (!(key in v)) throw `value ${v} must have keys ${keys}!`;
	}
	for (const key in v) {
		// ensure no additional non-optional keys
		if (!keys.includes(key as T) && !optional.includes(key as O))
			throw `value ${v} may not have keys other than ${keys} and ${optional}!`;
	}
}

export function assertArray(v: any): asserts v is any[] {
	if (!(v instanceof Array)) throw `value ${v} must be an array!`;
}

export function assertTuple(v: any, minLength: number, maxLength: number): asserts v is any[];
export function assertTuple(v: any, length: number): asserts v is any[];

export function assertTuple(
	v: any,
	minOrExactLength: number,
	maxLength?: number
): asserts v is any[] {
	assertArray(v);
	if (
		maxLength !== undefined
			? v.length < minOrExactLength || v.length > maxLength
			: v.length !== minOrExactLength
	)
		throw `value ${v} must be an array of length ${minOrExactLength}!`;
}
