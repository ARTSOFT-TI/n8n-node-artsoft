import type { IExecuteFunctions, IHttpRequestOptions, ILoadOptionsFunctions } from 'n8n-workflow';
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
