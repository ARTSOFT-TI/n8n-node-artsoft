import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { parseXml } from '../../helper/xml';

/**
 * Send an XML body to an ARTSOFT service and return the parsed response object.
 * Authentication (device registration, login and token refresh) is handled by the
 * `artsoftApi` credential.
 */
export async function artsoftApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint: string,
	xmlBody: string,
): Promise<Record<string, unknown>> {
	const credentials = await this.getCredentials('artsoftApi');
	const baseUrl = `${String(credentials.protocol)}://${String(credentials.hostIp)}:${String(credentials.port)}`;

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/${endpoint}`,
		headers: { 'Content-Type': 'text/xml' },
		body: xmlBody,
		json: false,
		skipSslCertificateValidation:
			credentials.protocol === 'https' && credentials.rejectUnauthorized === false,
	};

	try {
		const rawXml = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'artsoftApi',
			options,
		)) as string;
		return parseXml(rawXml);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new NodeApiError(
			this.getNode(),
			{ message },
			{
				message: `ARTSOFT request to ${endpoint} failed`,
				description: message,
			},
		);
	}
}

/** Reads an optional field from an Additional Fields / Filters collection. */
export function getOptionalField<T>(
	context: IExecuteFunctions,
	i: number,
	collection: string,
	name: string,
	fallback: T,
): T {
	const group = context.getNodeParameter(collection, i, {}) as IDataObject;
	return (group[name] as T) ?? fallback;
}

export function returnAllProperties(resource: string, operations: string[]): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			displayOptions: { show: { resource: [resource], operation: operations } },
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: { minValue: 1 },
			displayOptions: {
				show: { resource: [resource], operation: operations, returnAll: [false] },
			},
			description: 'Max number of results to return',
		},
	];
}
