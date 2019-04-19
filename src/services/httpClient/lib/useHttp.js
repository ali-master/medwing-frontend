import * as R from "ramda";

function grabHttpRequestsByName(httpCaller, requestNames) {
	let hashRequests = {};
	requestNames.forEach(requestName => {
		const baseName =
			requestName.indexOf(":") >= 0
				? requestName.split(":")[0]
				: requestName;
		const aliasedName =
			requestName.indexOf(":") >= 0
				? requestName.split(":")[1]
				: baseName;
		const endpoint = httpCaller.endpoint(baseName);

		console.log("endpoint", baseName, endpoint);
		if (aliasedName in hashRequests) return;
		if (!endpoint) {
			console.error(
				`useHttp: Request '${baseName}${
					aliasedName !== baseName ? `(${aliasedName})` : ``
				}' is not available in the ${requestName} Provider! Make sure it is provided by some Provider`,
			);
			return;
		}

		hashRequests[aliasedName] = endpoint;
	});

	return hashRequests;
}

/**
 * React hook that yields requests to a function.
 */
export default function useHttp(httpCaller) {
	return requestNames => grabHttpRequestsByName(httpCaller, requestNames);
}
