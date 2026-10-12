import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest } from '../../GenericFunctions';
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
	const opcional = this.getNodeParameter('productOptional', i) as string;
	const nome = this.getNodeParameter('productName', i) as string;
	const obs = this.getNodeParameter('productObs', i) as string;

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
	const opcional = this.getNodeParameter('productOptional', i) as string;
	const nome = this.getNodeParameter('productName', i) as string;
	const obs = this.getNodeParameter('productObs', i) as string;

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
