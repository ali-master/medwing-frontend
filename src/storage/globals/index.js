import HttpPropagator from "../../services/httpClient/";
import useHttpHook from "../../services/httpClient/lib/useHttp";

// endpoints
import * as endpoints from "./requests";

const GlobalHTTPClientRequests = new HttpPropagator({
	name: "globals",
	endpoints,
	baseURL: process.env.REACT_APP_API_PATH,
});

const useHttp = useHttpHook(GlobalHTTPClientRequests);

export { useHttp };
export default GlobalHTTPClientRequests;
