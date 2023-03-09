import { resolveOperator } from './resolveOperator';
import { JsonSerializable } from './types/JsonSerializable';
import { Operator } from './types/Operator';

export const resolveObject = (
	operator: Record<string, JsonSerializable>,
	data: Record<string, JsonSerializable>,
	context: Record<string, JsonSerializable>
) => {
	const obj: JsonSerializable = {};
	for (const key in operator) {
		obj[key] = resolveOperator(operator[key as keyof Operator], data, context);
	}
	return obj;
};
