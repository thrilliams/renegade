// polyfill to support older browsers
export const at = <T>(array: T[], index: number): T | undefined => {
	if (index < -array.length || index >= array.length) return undefined;
	if (index < 0) return array[index + array.length];
	return array[index];
};
