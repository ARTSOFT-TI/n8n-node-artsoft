import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest } from '../../GenericFunctions';
import { buildXml } from '../../../../helper/xml';

export async function executeGetClient(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const id = this.getNodeParameter('clientNumero', i) as string;

	const xmlBody = buildXml({
		root: {
			'@type': 'list',
			'@query': `TerFch|Cliente|NrCli=${id}:${id}`,
			defcol: {
				Numero: { '@form': '%TerFch.Cli.Numero' },
				Obs: { '@form': '%TerFch.Ter.Obs' },
				Nome: { '@form': '%TerFch.Ter.Nome' },
			},
		},
	});
	return artsoftApiRequest.call(this, 'Queries/Query', xmlBody);
}

export async function executeUpdateClient(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const numberCli = this.getNodeParameter('numberCli', i) as string;
	const name = this.getNodeParameter('clientName', i) as string;
	const nif = this.getNodeParameter('clientNif', i) as string;
	const email = this.getNodeParameter('clientEmail', i) as string;
	const phone = this.getNodeParameter('clientPhone', i) as string;
	const obs = this.getNodeParameter('clientObs', i) as string;
	const address = this.getNodeParameter('clientAddress', i) as {
		street?: string;
		city?: string;
		zip?: string;
	};

	const baseAddr: Record<string, unknown> = {
		'Cli.Numero': numberCli,
	};
	if (name) baseAddr['Ter.Nome'] = name;
	if (nif) baseAddr['Ter.NrIdFisc'] = nif;
	if (email) baseAddr['Ter.EMail'] = email;
	if (phone) baseAddr['Ter.Telef'] = phone;
	if (obs) baseAddr['Ter.Obs'] = obs;
	if (address.street) baseAddr['Ter.Morada'] = address.street;
	if (address.city) baseAddr['Ter.Localid'] = address.city;
	if (address.zip) baseAddr['Ter.CPPais'] = address.zip;

	const xmlBody = buildXml({
		Entity: {
			'@RetID': 'S',
			'@status': 'S',
			'@trans': 'S',
			BaseAddr: baseAddr,
		},
	});
	return artsoftApiRequest.call(this, 'TerFch/Update', xmlBody);
}

export async function executeDeleteClient(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const id = this.getNodeParameter('clientNumero', i) as string;

	const xmlBody = buildXml({
		Entity: {
			'@EntityID': `C:${id}`,
		},
	});
	return artsoftApiRequest.call(this, 'TerFch/Delete', xmlBody);
}

export async function executeCreateClient(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const name = this.getNodeParameter('clientName', i) as string;
	const nif = this.getNodeParameter('clientNif', i) as string;
	const email = this.getNodeParameter('clientEmail', i) as string;
	const phone = this.getNodeParameter('clientPhone', i) as string;
	const obs = this.getNodeParameter('clientObs', i) as string;
	const address = this.getNodeParameter('clientAddress', i) as {
		street?: string;
		city?: string;
		zip?: string;
	};
	// const clientNr = this.getNodeParameter('clientNumero', i) as string;

	const baseAddr: Record<string, unknown> = {
		'Ter.Nome': name,
	};
	if (nif) baseAddr['Ter.NrIdFisc'] = nif;
	if (email) baseAddr['Ter.EMail'] = email;
	if (phone) baseAddr['Ter.Telef'] = phone;
	if (obs) baseAddr['Ter.Obs'] = obs;
	if (address.street) baseAddr['Ter.Morada'] = address.street;
	if (address.city) baseAddr['Ter.Localid'] = address.city;
	if (address.zip) baseAddr['Ter.CPPais'] = address.zip;
	// if (clientNr) baseAddr['Ter.Numero'] = clientNr;

	const createXml = buildXml({
		Entity: {
			'@RetID': 'S',
			'@status': 'S',
			'@trans': 'S',
			BaseAddr: baseAddr,
		},
	});

	return await artsoftApiRequest.call(this, 'TerFch/Update', createXml);

	// Response: <Entity rc="0" ID="26837"/> → { Entity: { '@_rc': '0', '@_ID': '26837' } }
	// const entityId = (createResult['Entity'] as Record<string, unknown>)?.['@_ID'] as string;

	// const queryXml = buildXml({
	// 	root: {
	// 		'@type': 'list',
	// 		'@query': `TerFch|AutoInc=${entityId}:${entityId}`,
	// 		defcol: {
	// 			Numero: { '@form': '%TerFch.Cli.Numero' },
	// 		},
	// 	},
	// });

	// return artsoftApiRequest.call(this, 'Queries/Query', queryXml);
}
