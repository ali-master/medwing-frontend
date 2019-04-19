import React, { createContext, useContext, useReducer } from "react";
import { globalReducer, initialMarkersState } from "./reducers/";
// Components
import Maps from "./components/Maps/";
// Ant components
import { Layout } from "antd";
// Styles
import "./scss/App.scss";

// Contexts
const MapStateContext = createContext(initialMarkersState);
const MapDispatchContext = createContext(globalReducer);

const { Content, Footer } = Layout;

function Boot() {
	const [Markers, dispatch] = useReducer(globalReducer, initialMarkersState);

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Layout>
				<Content style={{ margin: "0 16px" }}>
					<div className="app-content">
						<MapDispatchContext.Provider value={dispatch}>
							<MapStateContext.Provider value={Markers}>
								<Maps />
							</MapStateContext.Provider>
						</MapDispatchContext.Provider>
					</div>
				</Content>
				<Footer style={{ textAlign: "center" }}>
					© 2019 MEDWING GmbH, Berlin. Alle Rechte vorbehalten.
				</Footer>
			</Layout>
		</Layout>
	);
}

export const useDispatch = () => useContext(MapDispatchContext);
export const useGlobalState = prop => {
	const state = useContext(MapStateContext);

	return state[prop];
};

export default Boot;
