import React, { useState } from "react";
import { List, Card, Icon } from "antd";
import EditMarker from "../HandleMarker";
import { useDispatch, useGlobalState } from "../../App";
// Http manager
import httpClient from "../../storage/globals/";
// Utilities
import isEmpty from "ramda/es/isEmpty";

/**
 * Render list of markers that we inserted into store via useReducer hook
 */
const Markers = () => {
	const dispatch = useDispatch();
	const MarkersState = useGlobalState("markers");
	const [selectedIItem, setItem] = useState({});
	/**
	 * Delete a map marker into the store via dispatching an action which its type is "delete".
	 * @param {Number} id
	 */
	const deleteMarkerById = id => {
		httpClient
			.endpoint("deleteMarker")
			.fire(id)
			.then(() => {
				dispatch({ type: "markers/delete", payload: { id } });
			});
	};
	const submitedEdiMarkerForm = markerDetail => {
		// set false to invisible modal
		setItem({});
		// edit marker details into the store
		httpClient
			.endpoint("updateMarker")
			.fire(markerDetail.id, markerDetail)
			.then(({ Result }) => {
				dispatch({
					type: "markers/edit",
					payload: Result,
				});
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
							actions={[
								<Icon
									type="delete"
									onClick={() => {
										deleteMarkerById(item.id);
									}}
								/>,
								<Icon
									type="edit"
									onClick={() => setItem(item)}
								/>,
							]}
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
