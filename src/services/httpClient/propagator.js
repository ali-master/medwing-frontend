import get from "lodash/get";
import last from "lodash/last";
import omit from "lodash/omit";
import clone from "lodash/clone";
import assign from "lodash/assign";
import isEmpty from "lodash/isEmpty";
import isArray from "lodash/isArray";

import axios from "axios";
import logger from "./lib/utils/logger";

/**
 * A wrapper on our request and make it easier than before for handling succeed and caught requests and log and hooks monitoring and having several repositories with
 * -a lot of requests and shared request
 * @class
 * @namespace HttpPropagator
 * @inspired Repository pattern
 */
class HttpPropagator {
	constructor({
		name = "HTTP-Endpoints",
		baseURL,
		query = {},
		hooks = {},
		headers = {},
		endpoints = {},
		log = "console",
		requestOptions = {},
	}) {
		this.log = log;
		this.name = name;
		this.baseURL = baseURL;
		this.baseHeaders = headers;
		this.globalQueries = query;
		this.requestOptions = requestOptions;
		this.hooks = assign(
			{
				willFire() {}, // before send request
				didResponse() {}, // after receiving successful response
				didCatch() {}, // after receiving an error of request
			},
			hooks,
		);
		// making an instace of axios http controller to use under wrapper
		this.instance = axios.create({
			baseURL: this.baseURL,
		});

		// Private properties
		this._endpoints = endpoints;
		this._currentRestURL = null;
		this._currentQueries = this.globalQueries;
		// endpoint's headers and function calls
		this._currentEndpoint = null;
		this._currentEndpointHeaders = this.baseHeaders;
	}
	/**
	 * Select endpoint
	 * @public
	 * @param {String} path the path to select endpoint in endpoints object with getting function in the lodash
	 * @returns {HttpPropagator<Object>|Error}
	 */
	endpoint(path) {
		if (path) {
			this._currentEndpoint = get(this._endpoints, path);

			if (this._currentEndpoint) {
				this._currentEndpoint = this._currentEndpoint(this);

				return this;
			}
		}

		throw new Error(`Propagator: endpoint ${path} is not defined`);
	}

	/**
	 * An array of headers that we wanna remove from base headers in HTTP provider to prevent sending in next requests.
	 * @public
	 * @param {Array} headers List of headers
	 * @returns {HttpPropagator<Object>}
	 */
	omitHeader(headers) {
		headers = isArray(headers) ? headers : [headers]; // convert headers to array when it doesn't an array

		this.baseHeaders = omit(this.baseHeaders, headers);

		return this;
	}

	/**
	 * List of headers that we wanna use in current endpoint call
	 * @public
	 * @param {Object} headers
	 * @returns {HttpPropagator<Object>}
	 */
	headers(headers, isGobal = false) {
		if (!isGobal) {
			this._currentEndpointHeaders = assign(this.baseHeaders, headers);
		} else {
			this.baseHeaders = assign(this.baseHeaders, headers);
		}

		return this;
	}

	/**
	 * List of queries that we wanna use in current endpoint URL call
	 * @public
	 * @param {Object} queries
	 * @returns {HttpPropagator<Object>}
	 * @example
	 * this.queries({page_size: 10, per_page: 25}) // result will be: http://baseURL/api/users?page_size: 10&per_page=25
	 */
	queries(queries) {
		this._currentQueries = queries;

		return this;
	}

	/**
	 * Add custom URL after base URL in current endpoint URL call
	 * @public
	 * @param {String} restURL
	 * @returns {HttpPropagator<Object>}
	 * @example
	 * this.suffix("/api/users") // result will be http://baseURL/api/users
	 */
	suffix(restURL) {
		this._currentRestURL = restURL;

		return this;
	}

	/**
	 * Run current endpoint function and assign custom data in itself.
	 * @param  {Array} argv list of arguments that the user assigned
	 */
	fire(...argv) {
		return this._currentEndpoint(...argv);
	}

	/**
	 * Make a http post method
	 * @public
	 * @param {Object} options
	 * @returns {Function}
	 */
	create(options = {}) {
		return this.fetch({
			method: "POST",
			...options,
		});
	}

	/**
	 * Make a http patch method
	 * @public
	 * @param {Object} options
	 * @returns {Function}
	 */
	update(options = {}) {
		return this.fetch({
			method: "PUT",
			...options,
		});
	}

	/**
	 * Make a http delete method
	 * @public
	 * @param {Object} options
	 * @returns {Function}
	 */
	delete(options) {
		return this.fetch({
			method: "DELETE",
			...options,
		});
	}

	/**
	 * Make a http get method
	 * @public
	 * @param {Object} options
	 * @returns {Function}
	 */
	find(options = {}) {
		return this.fetch({
			method: "GET",
			...options,
		});
	}

	/**
	 * Fetch current endpoint and assign headers and queries and options to itself and then run it.
	 * @param {Object} options The Axios request options
	 * @returns {Promise}
	 */
	fetch(options) {
		const requestOptions = this.requestOptions;
		const headers = clone(this._currentEndpointHeaders);
		const suffixURL = this._currentRestURL;

		// prepare new url from baseURL and suffix url
		let url = this._assignRestStringToURL(suffixURL);
		url = this._suffixQueries(url, this._currentQueries);

		// reset to default value
		this._currentRestURL = null;
		this._currentQueries = assign({}, this.globalQueries);
		this._currentEndpointHeaders = assign({}, this.baseHeaders);

		const apiInfo = {
			url: url.toString(),
			headers,
			...options,
			...requestOptions,
		};

		this.hooks.willFire(apiInfo);

		return this.instance(apiInfo)
			.then(response => {
				this.hooks.didResponse(response);

				return this._renderBody(response);
			})
			.catch(error => {
				this.hooks.didCatch(error);

				this._renderError(error);
			});
	}
	/**
	 * Log requesr error into console
	 * @param {Object} error request error
	 */
	_renderError(error) {
		const { response, request, config } = error;

		this.log === "console"
			? logger(error)
			: typeof this.log === "function" && this.log(error);

		if (error.json) {
			return error.json().then(errorObject => {
				throw errorObject;
			});
		} else {
			// eslint-disable-next-line no-throw-literal
			throw {
				response,
				request,
				config,
				info: {
					status: isEmpty(response) ? 0 : response.status,
					message: isEmpty(response)
						? "Your computer lost its internet connection"
						: response.data.message,
				},
			};
		}
	}

	_renderBody(response) {
		return response.data ? response.data : response;
	}
	/**
	 * Add list of queries into the URL
	 * @private
	 * @param {Object} url
	 * @param {Object} queries
	 * @returns {Object}
	 */
	_suffixQueries(url, queries) {
		queries = { ...queries, ...this.globalQueries }; // passing current queries with global queries such as a token or other things.
		for (let key in queries) {
			url.searchParams.set(key, queries[key]);
		}

		return url;
	}
	/**
	 * Assing rest string to the baseURL for each endpoint.
	 * @private
	 * @param {String} rest
	 * @param {Object} params we can assing a lot of params to the rest of url
	 * @example
	 * @var baseURL = "http://api.com"
	 * @var rest = "/api/users"
	 * @var params = [1, "test", null, "info", 2]
	 * @return {Object} An object of URL native function but if we use toString buit-in function then it will be: "http://api.com/api/users/1/test/info/2"
	 */
	_assignRestStringToURL(rest = "", params = []) {
		let path =
			last(this.baseURL.split("")) === "/"
				? `${this.baseURL}${rest}`
				: `${this.baseURL}/${rest}`;

		if (path.indexOf("//") > -1) path = path.replace(/\/\//g, "/");
		if (params.length !== 0) {
			params = params.filter(Boolean);

			path = `${path}/${params.join("/")}`;
		}

		path = new URL(path);

		return path;
	}
}

export default HttpPropagator;
