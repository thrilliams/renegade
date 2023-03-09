import { JsonSerializable } from './types/JsonSerializable';

export const resolveDotNotation = (object: Record<string, JsonSerializable>, path: string) => {
	const parts = path.split('.');

	let node: JsonSerializable = object;
	while (parts.length > 0 && typeof node === 'object' && node !== null) {
		const next = parts.shift()!;
		if (node instanceof Array) {
			node = node[parseInt(next)];
		} else {
			node = node[next];
		}
	}

	if (parts.length > 0) throw `path "${path}" too long!`;

	return node;
};
