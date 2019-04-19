import * as R from "ramda";

const initialMarkersState = {
	position: { lat: null, lng: null },
	markers: [],
};
const globalReducer = (state, action) => {
	const updateState = R.merge(state);
	switch (action.type) {
		case "markers/insert":
			return updateState({
				markers: R.insert(
					-1,
					R.evolve({
						lat: R.curry(value => +value),
						lng: R.curry(value => +value),
					})(action.payload),
				)(state.markers),
			});
		case "markers/insertMany":
			return updateState({
				markers: R.insertAll(-1, action.payload)(state.markers),
			});
		case "markers/delete":
			return updateState({
				markers: R.filter(item => item.id !== action.payload.id)(
					state.markers,
				),
			});
		case "markers/edit":
			return updateState({
				markers: R.update(
					R.findIndex(R.propEq("id", action.payload.id))(
						state.markers,
					),
					R.merge({ id: action.payload.id })(
						R.evolve({
							lat: R.curry(x => +x),
							lng: R.curry(x => +x),
						})(action.payload),
					),
				)(state.markers),
			});
		case "markers/reset":
			return updateState({ markers: [] });
		default:
			return state; // TODO: throw new Error("Unexpected action");
	}
};

export { globalReducer, initialMarkersState };
