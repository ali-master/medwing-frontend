import React, { Fragment, useState } from "react";
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

function MapContainer() {
	const MarkersState = useGlobalState("markers");
	const dispatch = useDispatch();
	const [isVisibleModal, setVisibleModal] = useState(false);

	const submitedHandleMarkerForm = markerDetail => {
		// set false to invisible modal
		setVisibleModal(false);
		// add a new marker into the store
		dispatch({
			type: "markers/add",
			payload: {
				...markerDetail,
			},
		});
	};

	return (
		<Fragment>
			<Row css={{ marginTop: 100 }}>
				<Col span={16} offset={4}>
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
										<Button type="primary" onClick={() => setVisibleModal(true)}>
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
				<EditMarker isNew visible={isVisibleModal} onSubmit={submitedHandleMarkerForm} onCancel={() => setVisibleModal(false)} />
			</Maybe>
		</Fragment>
	);
}

export default MapContainer;
