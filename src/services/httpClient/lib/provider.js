import { Children, Component } from "react";
import { polyfill } from "react-lifecycles-compat";
import PropTypes from "prop-types";
import keys from "lodash/keys";

const specialReactKeys = { children: true, key: true, ref: true };

class Provider extends Component {
	static contextTypes = {
		httpRequests: PropTypes.object,
	};

	static childContextTypes = {
		httpRequests: PropTypes.object.isRequired,
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		if (!nextProps) return null;
		if (!prevState) return nextProps;

		// Maybe this warning is too aggressive?
		if (keys(nextProps).filter(validRequestName).length !== keys(prevState).filter(validRequestName).length)
			console.warn(
				"HTTP Provider: The set of provided requests has changed. Please avoid changing requests as the change might not propagate to all children",
			);
		if (!nextProps.suppressChangedRequestWarning)
			for (let key in nextProps)
				if (validRequestName(key) && prevState[key] !== nextProps[key])
					console.warn(
						"HTTP Provider: Provided request '" +
							key +
							"' has changed. Please avoid replacing requests as the change might not propagate to all children",
					);

		return nextProps;
	}

	state = {};

	constructor(props, context) {
		super(props, context);

		copyRequests(props, this.state);
	}

	getChildContext() {
		const requests = {};
		// inherit requests
		copyRequests(this.context.httpRequests, requests);
		// add own requests
		copyRequests(this.props, requests);

		return {
			httpRequests: requests,
		};
	}

	render() {
		return Children.only(this.props.children);
	}
}

function copyRequests(from, to) {
	if (!from) return;
	for (let key in from) if (validRequestName(key)) to[key] = from[key];
}

function validRequestName(key) {
	return !specialReactKeys[key] && key !== "suppressChangedRequestWarning";
}

// TODO: kill in next major
polyfill(Provider);

export default Provider;
