import { Component, createElement } from "react";
import hoistStatics from "hoist-non-react-statics";
import PropTypes from "prop-types";
import { isStateless } from "./utils/utils";

const injectorContextTypes = {
	httpRequests: PropTypes.object,
};
Object.seal(injectorContextTypes);

const proxiedInjectorProps = {
	contextTypes: {
		get: function() {
			return injectorContextTypes;
		},
		set: function(_) {
			console.warn(
				"HTTP injector: you are trying to attach `contextTypes` on an component decorated with `inject` HOC. Please specify the contextTypes on the wrapped component instead. It is accessible through the `wrappedComponent`",
			);
		},
		configurable: true,
		enumerable: false,
	},
	isHttpInjector: {
		value: true,
		writable: true,
		configurable: true,
		enumerable: true,
	},
};

/**
 * Store Injection
 */
function createHttpPropagateInjector(grabRequestsFn, component, injectNames) {
	let displayName =
		"httpInject-" +
		(component.displayName || component.name || (component.constructor && component.constructor.name) || "Unknown");
	if (injectNames) displayName += "-with-" + injectNames;

	class Injector extends Component {
		static displayName = displayName;

		requestRef = instance => {
			this.wrappedInstance = instance;
		};

		render() {
			// Optimization: it might be more efficient to apply the mapper function *outside* the render method
			// (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
			// See this test: 'using a custom injector is not too reactive' in inject.js
			let newProps = {};
			for (let key in this.props)
				if (this.props.hasOwnProperty(key)) {
					newProps[key] = this.props[key];
				}
			var additionalProps = grabRequestsFn(this.context.httpRequests || {}, newProps, this.context) || {};
			for (let key in additionalProps) {
				newProps[key] = additionalProps[key];
			}

			if (!isStateless(component)) {
				newProps.ref = this.requestRef;
			}

			return createElement(component, newProps);
		}
	}

	// Static fields from component should be visible on the generated Injector
	hoistStatics(Injector, component);

	Injector.wrappedComponent = component;
	Object.defineProperties(Injector, proxiedInjectorProps);

	return Injector;
}

function grabHttpRequestsByName(requestNames) {
	return (baseRequests, nextProps) => {
		requestNames.forEach(requestName => {
			const [, base, name] = requestName.match(/([*@\w]+).(\w.*)+/i);
			const baseName = name.indexOf(":") >= 0 ? name.split(":")[0] : name;
			const aliasedName = name.indexOf(":") >= 0 ? name.split(":")[1] : name;
			const endpoint = baseRequests[base].endpoint(baseName);

			if (
				aliasedName in nextProps // prefer props over requests
			)
				return;
			if (!endpoint)
				throw new Error(
					`HTTP injector: Request '${baseName}${
						aliasedName !== baseName ? `(${aliasedName})` : ``
					}' is not available in the ${base} Provider! Make sure it is provided by some Provider`,
				);

			nextProps[aliasedName] = endpoint;
		});
		return nextProps;
	};
}

/**
 * higher order component that injects requests to a child.
 * takes either a varargs list of strings, which are requests read from the context,
 * or a function that manually maps the available requests from the context to props:
 */
export default function inject(...requestNames) {
	let grabRequestsFn;
	grabRequestsFn = grabHttpRequestsByName(requestNames);

	return componentClass => createHttpPropagateInjector(grabRequestsFn, componentClass, requestNames.join("-"));
}
