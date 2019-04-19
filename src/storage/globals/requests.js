/**
 * Yields all markers list
 */
export const getMarkers = provider => () => {
	return provider.suffix("markers").find();
};

/**
 * Add a new marker into database
 */
export const addMarker = provider => marker => {
	return provider.suffix("marker").create({
		data: marker,
	});
};

/**
 * Update a marker by id
 */
export const updateMarker = provider => (id, marker) => {
	return provider.suffix(`marker/${id}`).update({
		data: marker,
	});
};

/**
 * Delete a marker by id
 */
export const deleteMarker = provider => id => {
	return provider.suffix(`marker/${id}`).delete();
};
