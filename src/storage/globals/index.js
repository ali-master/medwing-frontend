import HttpPropagator from "@/services/httpClient";

// endpoints
import * as endpoints from "./requests";

const GlobalHTTPClientRequests = new HttpPropagator({
	name: "globals",
	endpoints,
	baseURL: process.env.API_PATH,
});

export default GlobalHTTPClientRequests;
