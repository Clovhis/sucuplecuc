/** Cache only a validated, immutable snapshot within one production build.
 * Callers receive their own array; a fresh module/build or date key validates
 * again. Development/client callers omit the key and retain live validation.
 */
export function createValidatedBuildCatalog<T>(load: () => T[], validate: (items: T[]) => void) {
	let snapshot: { key: string; items: T[] } | undefined;
	function freeze(value: unknown): void {
		if (!value || typeof value !== 'object' || Object.isFrozen(value)) return;
		for (const child of Object.values(value)) freeze(child);
		Object.freeze(value);
	}
	return (key?: string): T[] => {
		if (key !== undefined && snapshot?.key === key) return [...snapshot.items];
		const items = load();
		validate(items); // A failed validation never installs a cache entry.
		if (key !== undefined) {
			freeze(items);
			snapshot = { key, items };
		}
		return [...items];
	};
}
