export default <T>(item: T, condition: boolean) => (condition ? [item] : []);
