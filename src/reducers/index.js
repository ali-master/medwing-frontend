import * as R from "ramda";

const initialMarkersState = {
	position: { lat: null, lng: null },
	markers: [{ id: 1, title: "Leipzig", description: "Leipzig", lat: 38.575078, lng: -8.945406 }],
};
const globalReducer = (state, action) => {
	const { id, title, description, lat, lng } = action.payload;
	const updateState = R.merge(state);
	switch (action.type) {
		case "markers/add":
			return updateState({ markers: R.insert(1, { id, title, description, lat: +lat, lng: +lng })(state.markers) });
		case "markers/delete":
			return updateState({ markers: R.filter(R.where({ id: R.complement(R.equals(id)) }))(state.markers) });
		case "markers/edit":
			return updateState({
				markers: R.update(R.findIndex(R.propEq("id", id))(state.markers), R.merge({ id })({ title, description, lat: +lat, lng: +lng }))(state.markers),
			});
		case "markers/reset":
			return updateState({ markers: [] });
		default:
			return state; // TODO: throw new Error("Unexpected action");
	}
};

export { globalReducer, initialMarkersState };
