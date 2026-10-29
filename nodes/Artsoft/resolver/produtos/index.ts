import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest, getOptionalField } from '../../GenericFunctions';
import { buildXml } from '../../../../helper/xml';

export async function executeGetProduct(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const codigo = this.getNodeParameter('productCode', i) as string;

	const xmlBody = buildXml({
		root: {
			'@type': 'list',
			'@query': `StkFch|Principal|Codigo=${codigo}:${codigo}`,
			defcol: {
				Codigo: { '@form': '%StkFch.Cod.Codigo' },
				Opcional: { '@form': '%StkFch.Cod.Opcional' },
				Nome: { '@form': '%StkFch.Nome.0' },
				Obs: { '@form': '%StkFch.Div.Obs' },
			},
		},
	});
	return artsoftApiRequest.call(this, 'Queries/Query', xmlBody);
}

export async function executeCreateProduct(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const codigo = this.getNodeParameter('productCode', i) as string;
	const opcional = getOptionalField(this, i, 'productAdditionalFields', 'optionalCode', '');
	const nome = this.getNodeParameter('productName', i) as string;
	const obs = getOptionalField(this, i, 'productAdditionalFields', 'notes', '');

	const mainRec: Record<string, unknown> = {
		'Cod.Codigo': codigo,
		'Nome.0': nome,
	};
	if (opcional) mainRec['Cod.Opcional'] = opcional;
	if (obs) mainRec['Div.Obs'] = obs;

	const xmlBody = buildXml({
		SKU: {
			'@trans': 'S',
			'@status': 'S',
			'@retID': 'S',
			MainRec: mainRec,
		},
	});
	return artsoftApiRequest.call(this, 'StkFch/Update', xmlBody);
}

export async function executeUpdateProduct(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	// const id = this.getNodeParameter('productId', i) as string;
	const codigo = this.getNodeParameter('productCode', i) as string;
	const opcional = getOptionalField(this, i, 'productUpdateFields', 'optionalCode', '');
	const nome = getOptionalField(this, i, 'productUpdateFields', 'name', '');
	const obs = getOptionalField(this, i, 'productUpdateFields', 'notes', '');

	const mainRec: Record<string, unknown> = {};
	if (codigo) mainRec['Cod.Codigo'] = codigo;
	if (opcional) mainRec['Cod.Opcional'] = opcional;
	if (nome) mainRec['Nome.0'] = nome;
	if (obs) mainRec['Div.Obs'] = obs;

	const xmlBody = buildXml({
		SKU: {
			'@id': '',
			'@trans': 'S',
			'@status': 'S',
			'@retID': 'S',
			MainRec: mainRec,
		},
	});
	return artsoftApiRequest.call(this, 'StkFch/Update', xmlBody);
}

export async function executeDeleteProduct(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const id = this.getNodeParameter('productId', i) as string;

	const xmlBody = buildXml({
		SKU: {
			'@id': id,
		},
	});
	return artsoftApiRequest.call(this, 'StkFch/Delete', xmlBody);
}
