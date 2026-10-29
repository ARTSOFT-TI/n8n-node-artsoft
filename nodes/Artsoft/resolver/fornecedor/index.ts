import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest, getOptionalField } from '../../GenericFunctions';
import { buildXml } from '../../../../helper/xml';

export async function executeGetSupplier(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const id = this.getNodeParameter('supplierId', i) as string;

	const xmlBody = buildXml({
		root: {
			'@type': 'list',
			'@query': `TerFch|Forneced|NrFor=${id}:${id}`,
			defcol: {
				Numero: { '@form': '%TerFch.For.Numero' },
				Obs: { '@form': '%TerFch.Ter.Obs' },
				Nome: { '@form': '%TerFch.Ter.Nome' },
			},
		},
	});
	return artsoftApiRequest.call(this, 'Queries/Query', xmlBody);
}

export async function executeCreateSupplier(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const name = this.getNodeParameter('supplierName', i) as string;
	const nif = getOptionalField(this, i, 'supplierAdditionalFields', 'nif', '');
	const email = getOptionalField(this, i, 'supplierAdditionalFields', 'email', '');
	const phone = getOptionalField(this, i, 'supplierAdditionalFields', 'phone', '');
	const obs = getOptionalField(this, i, 'supplierAdditionalFields', 'notes', '');
	const address = this.getNodeParameter('supplierAddress', i) as {
		street?: string;
		city?: string;
		zip?: string;
	};

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

	const xmlBody = buildXml({
		Entity: {
			'@RetID': 'S',
			'@status': 'S',
			'@trans': 'S',
			'@createFor': '2',
			BaseAddr: baseAddr,
		},
	});
	return artsoftApiRequest.call(this, 'TerFch/Update', xmlBody);
}

export async function executeUpdateSupplier(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const numberFor = this.getNodeParameter('numberFor', i) as string;
	const name = getOptionalField(this, i, 'supplierUpdateFields', 'name', '');
	const nif = getOptionalField(this, i, 'supplierUpdateFields', 'nif', '');
	const email = getOptionalField(this, i, 'supplierUpdateFields', 'email', '');
	const phone = getOptionalField(this, i, 'supplierUpdateFields', 'phone', '');
	const obs = getOptionalField(this, i, 'supplierUpdateFields', 'notes', '');
	const address = this.getNodeParameter('supplierAddress', i) as {
		street?: string;
		city?: string;
		zip?: string;
	};

	const baseAddr: Record<string, unknown> = {
		'For.Numero': numberFor,
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

export async function executeDeleteSupplier(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const id = this.getNodeParameter('supplierId', i) as string;

	const xmlBody = buildXml({
		Entity: {
			'@EntityID': `F:${id}`,
		},
	});
	return artsoftApiRequest.call(this, 'TerFch/Delete', xmlBody);
}
