import React, { Fragment, useState, memo } from "react";
// Styles
import styled from "@emotion/styled";
import { Row, Col, Button, Divider } from "antd";
// Components
import EditMarker from "../HandleMarker";
import MapCreator from "../MapCreator/";
import Markers from "../Markers/";
import Maybe from "../Maybe/";
// Utilities
import { useDispatch, useGlobalState } from "../../App";
// Http manager
import httpClient from "../../storage/globals/";

const MapInformationWrapper = styled.div`
	padding-left: 20px;
`;
const MapWrapper = styled.div`
	border: 3px solid #ddd;
	border-radius: 5px;
	overflow: hidden;
	height: 100%;
	position: relative;
`;
let Inserted = false;
function MapContainer() {
	const MarkersState = useGlobalState("markers");
	const dispatch = useDispatch();
	const [isVisibleModal, setVisibleModal] = useState(false);

	if (!Inserted) {
		Inserted = true;
		httpClient
			.endpoint("getMarkers")
			.fire()
			.then(({ Result }) => {
				// Insert all saved markers
				dispatch({
					type: "markers/insertMany",
					payload: Result,
				});
			});
	}

	const submitedHandleMarkerForm = markerDetail => {
		httpClient
			.endpoint("addMarker")
			.fire(markerDetail)
			.then(({ Result }) => {
				// set false to invisible modal
				setVisibleModal(false);
				// add a new marker into the store
				dispatch({
					type: "markers/insert",
					payload: Result,
				});
			});
	};

	return (
		<Fragment>
			<Row css={{ marginTop: 100 }}>
				<Col span={22} offset={1}>
					<Row>
						<Col css={{ height: 600 }} span={14}>
							<MapWrapper className="clearfix">
								<MapCreator markers={MarkersState} />
							</MapWrapper>
						</Col>
						<Col span={10}>
							<MapInformationWrapper>
								<Row>
									<Col span={24}>
										<Button
											type="primary"
											onClick={() =>
												setVisibleModal(true)
											}
										>
											Add new marker
										</Button>
										<Divider />
									</Col>
									<Col span={24}>
										<Markers />
									</Col>
								</Row>
							</MapInformationWrapper>
						</Col>
					</Row>
				</Col>
			</Row>
			<Maybe condition={isVisibleModal}>
				<EditMarker
					isNew
					visible={isVisibleModal}
					onSubmit={submitedHandleMarkerForm}
					onCancel={() => setVisibleModal(false)}
				/>
			</Maybe>
		</Fragment>
	);
}

export default memo(MapContainer);
