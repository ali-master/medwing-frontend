/* Many things are objects in javascript. To know if a value is really an object that can have properties and be looped through, its constructor can be compared to Object. */
// Returns if a value is an object
export function isObject(value) {
	return value && typeof value === "object" && value.constructor === Object;
}
