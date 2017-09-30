/**
 * Created by Pedro on 3/29/2017.
 */

import {APIGatewayClient, Utils, uritemplate} from 'aws-api-client'


export default class TacoApiClient{
	constructor(config){
		this.utils = new Utils();
		if(config === undefined) {
			config = {
				accessKey: '',
				secretKey: '',
				sessionToken: '',
				region: '',
				apiKey: undefined,
				defaultContentType: 'application/json',
				defaultAcceptType: 'application/json'
			};
		}
		if(config.accessKey === undefined) {
			config.accessKey = '';
		}
		if(config.secretKey === undefined) {
			config.secretKey = '';
		}
		if(config.apiKey === undefined) {
			config.apiKey = '';
		}
		if(config.sessionToken === undefined) {
			config.sessionToken = '';
		}
		if(config.region === undefined) {
			config.region = 'us-east-1';
		}
		//If defaultContentType is not defined then default to application/json
		if(config.defaultContentType === undefined) {
			config.defaultContentType = 'application/json';
		}
		//If defaultAcceptType is not defined then default to application/json
		if(config.defaultAcceptType === undefined) {
			config.defaultAcceptType = 'application/json';
		}

		// extract endpoint and path from url
		this.invokeUrl = 'https://jawcw787ud.execute-api.us-east-2.amazonaws.com/dev';
		this.endpoint = /(^https?:\/\/[^\/]+)/g.exec(this.invokeUrl)[1];
		this.pathComponent = this.invokeUrl.substring(this.endpoint.length);

		this.sigV4ClientConfig = {
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			sessionToken: config.sessionToken,
			serviceName: 'execute-api',
			region: config.region,
			endpoint: this.endpoint,
			defaultContentType: config.defaultContentType,
			defaultAcceptType: config.defaultAcceptType
		};

		this.authType = 'NONE';
		if (this.sigV4ClientConfig.accessKey !== undefined && this.sigV4ClientConfig.accessKey !== '' && this.sigV4ClientConfig.secretKey !== undefined && this.sigV4ClientConfig.secretKey !== '') {
			this.authType = 'AWS_IAM';
		}

		this.simpleHttpClientConfig = {
			endpoint: this.endpoint,
			defaultContentType: config.defaultContentType,
			defaultAcceptType: config.defaultAcceptType
		};

		this.config = config;
		this.apiGatewayClient = new APIGatewayClient(this.simpleHttpClientConfig, this.sigV4ClientConfig);
	}

	helloGet(params, body, additionalParams) {
		if(additionalParams === undefined) { additionalParams = {}; }

		this.utils.assertParametersDefined(params, [], ['body']);

		var helloGetRequest = {
			verb: 'get'.toUpperCase(),
			path: this.pathComponent + uritemplate('/helloIAM').expand(this.utils.parseParametersToObject(params, [])),
			headers: this.utils.parseParametersToObject(params, []),
			queryParams: this.utils.parseParametersToObject(params, []),
			body: body
		};


		return this.apiGatewayClient.makeRequest(helloGetRequest, this.authType, additionalParams, this.config.apiKey);
	};


	tacoPost(params, body, additionalParams) {
		if(additionalParams === undefined) { additionalParams = {}; }

		this.utils.assertParametersDefined(params, [], ['body']);

		var tacoPostRequest = {
			verb: 'post'.toUpperCase(),
			path: this.pathComponent + uritemplate('/taco').expand(this.utils.parseParametersToObject(params, [])),
			headers: this.utils.parseParametersToObject(params, []),
			queryParams: this.utils.parseParametersToObject(params, []),
			body: body
		};


		return this.apiGatewayClient.makeRequest(tacoPostRequest, this.authType, additionalParams, config.apiKey);
	};

}