import { createHmac, randomUUID } from 'crypto';
import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { parseXml } from '../helper/xml';

const DEVICE_TYPE = 'WEB';
const DEFAULT_DEVICE_NAME = 'n8n';
const DEVICE_APP_NAME = 'n8n';
const DEVICE_APP_ID_FLAG_DETAIL = '0';

function buildBaseUrl(credentials: ICredentialDataDecryptedObject): string {
	return `${String(credentials.protocol)}://${String(credentials.hostIp)}:${String(credentials.port)}`;
}

function skipTls(credentials: ICredentialDataDecryptedObject): boolean {
	return credentials.protocol === 'https' && credentials.rejectUnauthorized === false;
}

/** Signed headers for GET /login (HMAC-SHA256 over "\n<timestamp>\nGET\n/login"). */
function buildLoginHeaders(apiKey: string, apiSecret: string): Record<string, string> {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const hmac = createHmac('sha256', Buffer.from(apiSecret, 'hex'))
		.update(`\n${timestamp}\nGET\n/login`)
		.digest('hex');
	return {
		'X-API-KEY': apiKey,
		'X-API-TIMESTAMP': timestamp,
		'X-API-HMAC': `HS256:${hmac}`,
		'X-API-APP': DEVICE_APP_NAME,
	};
}

function getDeviceName(credentials: ICredentialDataDecryptedObject): string {
	return String(credentials.deviceName ?? '').trim() || DEFAULT_DEVICE_NAME;
}

/**
 * Registers this credential as a device in ARTSOFT (POST /ArtConn/AppRegister).
 * ARTSOFT returns the ApiKey/Secret only once, so the result must be persisted by n8n
 * (hidden credential fields) and registration must never be repeated for the same device.
 * n8n persists it only when a workflow runs, not when a credential is tested, so the credential
 * test (see credentialTest.ts) never registers.
 */
async function registerDevice(
	helpers: IHttpRequestHelper,
	credentials: ICredentialDataDecryptedObject,
): Promise<{ deviceId: string; apiKey: string; apiSecret: string }> {
	const deviceId = randomUUID();
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>' +
		`<root><device devID="${deviceId}" Tp="${DEVICE_TYPE}" AppName="${DEVICE_APP_NAME}" ` +
		`AppIDFlagDetail="${DEVICE_APP_ID_FLAG_DETAIL}" Name="${escapeAttribute(
			getDeviceName(credentials),
		)}" Contact="${escapeAttribute(String(credentials.contact))}"/></root>`;

	const rawXml = (await helpers.helpers.httpRequest({
		method: 'POST',
		url: `${buildBaseUrl(credentials)}/ArtConn/AppRegister`,
		headers: { 'Content-Type': 'text/xml' },
		body,
		json: false,
		skipSslCertificateValidation: skipTls(credentials),
	} as IHttpRequestOptions)) as string;

	const root = (parseXml(rawXml)['root'] as Record<string, unknown> | undefined) ?? {};
	const apiKey = String(root['@_ApiKey'] ?? '');
	const apiSecret = String(root['@_Secret'] ?? '');

	if (!apiKey || !apiSecret) {
		throw new ApplicationError(
			'ARTSOFT did not return an API key for this device. If it was already registered, delete the device in ARTSOFT (back office or MobileManager) and try again.',
		);
	}

	return { deviceId, apiKey, apiSecret };
}

/** Logs in (GET /login, HMAC-SHA256 signed) and returns the session access token. */
async function login(
	helpers: IHttpRequestHelper,
	credentials: ICredentialDataDecryptedObject,
	apiKey: string,
	apiSecret: string,
): Promise<string> {
	let response: { headers: Record<string, string | undefined> };
	try {
		response = (await helpers.helpers.httpRequest({
			method: 'GET',
			url: `${buildBaseUrl(credentials)}/login`,
			headers: buildLoginHeaders(apiKey, apiSecret),
			json: false,
			returnFullResponse: true,
			skipSslCertificateValidation: skipTls(credentials),
		} as IHttpRequestOptions)) as { headers: Record<string, string | undefined> };
	} catch (error) {
		throw new ApplicationError(
			`Could not log in to ARTSOFT (${error instanceof Error ? error.message : String(error)}). If this device is new, approve it in ARTSOFT and try again.`,
		);
	}

	const token = response.headers['x-access-token'];
	if (!token) {
		throw new ApplicationError(
			'ARTSOFT login did not return an access token. If this device is new, approve it in ARTSOFT and try again.',
		);
	}
	return token;
}

function escapeAttribute(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export class ArtsoftApi implements ICredentialType {
	name = 'artsoftApi';

	displayName = 'ARTSOFT API';

	icon: Icon = {
		light: 'file:../nodes/Artsoft/artsoft.svg',
		dark: 'file:../nodes/Artsoft/artsoft.svg',
	};

	documentationUrl = 'https://github.com/ARTSOFT-TI/n8n-node-artsoft#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Host IP',
			name: 'hostIp',
			type: 'string',
			default: '',
			placeholder: 'e.g. 192.168.1.50',
			required: true,
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 8080,
			required: true,
		},
		{
			displayName: 'Protocol',
			name: 'protocol',
			type: 'options',
			options: [
				{ name: 'HTTP', value: 'http' },
				{ name: 'HTTPS', value: 'https' },
			],
			default: 'http',
		},
		{
			displayName: 'Reject Invalid Certificates',
			name: 'rejectUnauthorized',
			type: 'boolean',
			default: true,
			description:
				'Whether to reject self-signed or invalid TLS certificates. Disable only in development environments.',
			displayOptions: {
				show: { protocol: ['https'] },
			},
		},
		{
			displayName: 'Contact',
			name: 'contact',
			type: 'string',
			default: '',
			placeholder: 'e.g. name@company.com',
			required: true,
			description: 'Contact associated with the device registration in ARTSOFT',
		},
		{
			displayName: 'Device Name',
			name: 'deviceName',
			type: 'string',
			default: DEFAULT_DEVICE_NAME,
			placeholder: 'e.g. n8n Production',
			description:
				'Name of the device registered in ARTSOFT. Together with host, port and contact it identifies the device, so use a different name for each credential.',
		},
		{
			displayName: 'Device ID',
			name: 'deviceId',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'hidden',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'hidden',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			typeOptions: { expirable: true, password: true },
			default: '',
		},
	];

	/**
	 * Runs when the access token is empty or rejected (401). Registers the device on first use
	 * (only if there is no API key yet) and then logs in. n8n persists the returned fields.
	 */
	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<IDataObject> {
		let deviceId = String(credentials.deviceId ?? '');
		let apiKey = String(credentials.apiKey ?? '');
		let apiSecret = String(credentials.apiSecret ?? '');
		const registered: IDataObject = {};

		if (!apiKey || !apiSecret) {
			({ deviceId, apiKey, apiSecret } = await registerDevice(this, credentials));
			Object.assign(registered, { deviceId, apiKey, apiSecret });
		}

		try {
			const accessToken = await login(this, credentials, apiKey, apiSecret);
			return { ...registered, accessToken };
		} catch (error) {
			// Device registered but not yet approved: keep the keys, otherwise the secret
			// (returned only once) would be lost.
			if (Object.keys(registered).length > 0) {
				return { ...registered, accessToken: '' };
			}
			throw error;
		}
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};
}
