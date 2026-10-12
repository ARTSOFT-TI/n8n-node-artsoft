import type {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
} from 'n8n-workflow';

/**
 * Credential test. It makes no request on purpose: ARTSOFT returns the device keys (ApiKey and
 * Secret) only once, and n8n does not reliably persist what the credential's preAuthentication
 * returns while a credential is being tested. Registering here would create a device whose keys
 * are lost. The device is registered when a workflow runs for the first time.
 */
export async function artsoftApiTest(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	const data = credential.data ?? {};

	const missing = [
		['Host IP', data.hostIp],
		['Port', data.port],
		['Contact', data.contact],
	]
		.filter(([, value]) => String(value ?? '').trim() === '')
		.map(([label]) => label);

	if (missing.length > 0) {
		return { status: 'Error', message: `Required settings are missing: ${missing.join(', ')}` };
	}

	return {
		status: 'OK',
		message:
			'Settings saved. The device is registered in ARTSOFT when a workflow runs for the first time, and then it must be approved in ARTSOFT.',
	};
}
