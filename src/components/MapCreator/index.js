import React, { useState } from "react";
import propTypes from "prop-types";
import * as R from "ramda";
// Map lib
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";

const mapStyles = {
	width: "100%",
	height: "100%",
};
const MapCreator = ({ google, markers }) => {
	const [selectedMarker, setSelectedMarker] = useState({ marker: {}, selectedPlace: {}, raw: {} });
	const clearSelectedMarker = () => {
		setSelectedMarker({ marker: {}, selectedPlace: {}, raw: {} });
	};

	return (
		<Map
			centerAroundCurrentLocation
			google={google}
			zoom={14}
			style={mapStyles}
			onMapClicked={() => !R.isEmpty(selectedMarker.marker) && clearSelectedMarker()}
		>
			{R.addIndex(R.map)(({ lat, lng, title }, index) => {
				const current = R.lensIndex(index);
				return (
					<Marker
						onClick={(props, marker) => setSelectedMarker({ marker, selectedPlace: props, raw: R.view(current, markers) })}
						position={{ lat, lng }}
						title={title}
						key={index}
					/>
				);
			})(markers)}
			<InfoWindow marker={selectedMarker.marker} visible={!R.isEmpty(selectedMarker.marker)} onInfoWindowClose={clearSelectedMarker}>
				<div>
					<h3>{selectedMarker.raw.title}</h3>
					<p>{selectedMarker.raw.description}</p>
				</div>
			</InfoWindow>
		</Map>
	);
};

MapCreator.propTypes = {
	lat: propTypes.number,
	lng: propTypes.number,
	markers: propTypes.array,
};

MapCreator.defaultProps = {
	lat: 38.575078,
	lng: -8.945406,
	markers: [],
};

export default GoogleApiWrapper({
	libraries: ["places", "visualization"],
	apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
})(MapCreator);
