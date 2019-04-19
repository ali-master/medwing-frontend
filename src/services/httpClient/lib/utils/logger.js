import isEmpty from "lodash/isEmpty";

export default error => {
	const { response, config } = error;

	const url = config.url.toString();

	console.group(`HTTP Request to: ${url}`);
	console.info("URL:", url);
	config.data && console.info("data:", config.data);
	console.info("method:", config.method);
	if (!isEmpty(response)) {
		console.info("status:", response.status);
		console.info("received:", response.data);
	} else {
		console.info(
			"network status:",
			"Your computer lost its internet connection",
		);
	}
	console.groupEnd(`HTTP Request to: ${url}`);
};
