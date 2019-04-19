import React, { useState } from "react";
import { List, Card, Icon } from "antd";
import EditMarker from "../HandleMarker";
import isEmpty from "ramda/es/isEmpty";
import { useDispatch, useGlobalState } from "../../App";

/**
 * Render list of markers that we inserted into store via useReducer hook
 */
const Markers = () => {
	const MarkersState = useGlobalState("markers");
	const dispatch = useDispatch();
	const [selectedIItem, setItem] = useState({});
	/**
	 * Delete a map marker into the store via dispatching an action which its type is "delete".
	 * @param {Number} id
	 */
	const deleteMarker = id => dispatch({ type: "delete", payload: { id } });
	const submitedEdiMarkerForm = markerDetail => {
		// set false to invisible modal
		setItem({});
		// edit marker details into the store
		dispatch({
			type: "markers/edit",
			payload: {
				...markerDetail,
			},
		});
	};

	return (
		<div>
			<List
				grid={{
					gutter: 16,
					md: 2,
					lg: 2,
				}}
				dataSource={MarkersState}
				renderItem={item => (
					<List.Item>
						<Card
							title={item.title}
							type="inner"
							actions={[<Icon type="delete" onClick={() => deleteMarker(item.id)} />, <Icon type="edit" onClick={() => setItem(item)} />]}
						>
							Description: {item.description}
							<br />
							Latitude: {item.lat}
							<br />
							Longitude: {item.lng}
						</Card>
					</List.Item>
				)}
			/>
			<EditMarker
				isNew={false}
				visible={!isEmpty(selectedIItem)}
				initialData={selectedIItem}
				onSubmit={submitedEdiMarkerForm}
				onCancel={() => setItem({})}
			/>
		</div>
	);
};

export default Markers;
