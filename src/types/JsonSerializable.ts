// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
export type JsonSerializable =
	| boolean
	| number
	| string
	| null
	| JsonSerializable[]
	| { [key in string]: JsonSerializable };
