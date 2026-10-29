import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest, getOptionalField } from '../../GenericFunctions';
import { buildXml } from '../../../../helper/xml';

export async function executeGetDocument(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const docType = this.getNodeParameter('docType', i) as string;
	const docNumber = this.getNodeParameter('docNumber', i) as string;

	const xmlBody = buildXml({
		root: {
			'@type': 'list',
			'@name': 'Doc',
			'@retid': 'S',
			'@query': `DocFch|Document|TpDoc=${docType}|NrDoc=${docNumber}:${docNumber}`,
			defcol: {
				NrDoc: { '@form': '%DocFch.Doc.Numero' },
				Serie: { '@form': '%DocFch.Doc.Serie' },
				IDEx: { '@form': '%DocFch.Doc.ID' },
				DataDocum: { '@form': '%DocFch.Data.Docum' },
				NrTer: { '@form': '%DocFch.Ter.NrTerc' },
				NomeTer: { '@form': '%DocFch.Ter.Nome' },
				Lans: {
					'@type': 'list',
					'@name': 'Lan',
					'@retid': 'S',
					'@query': 'DocLan|Document|TpDoc={%DocFch.Doc.Serie}|NrDoc={%DocFch.Doc.Numero}',
					defcol: {
						Lancamento: { '@form': '%DocLan.Doc.NrLan' },
						Codigo: { '@form': '%DocLan.Cod.Codigo' },
						NomeArtigo: { '@form': '%DocLan.Div.Descric' },
						Qtd: { '@form': '%DocLan.Qtd.Real' },
						UnBru: { '@form': '%DocLan.Val.UnBru' },
					},
				},
			},
		},
	});
	return artsoftApiRequest.call(this, 'Queries/Query', xmlBody);
}

export async function executeCreateDocument(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const docID = this.getNodeParameter('docID', i) as string;
	const entityType = this.getNodeParameter('entityType', i) as string;
	const entityID = `${entityType}:${this.getNodeParameter('entityID', i) as string}`;
	const obs = getOptionalField(this, i, 'documentAdditionalFields', 'notes', '');
	const docItemsParam = this.getNodeParameter('docItems', i) as {
		item?: Array<{ codigo: string; qtd: number; valUnBru: number }>;
	};

	const items = (docItemsParam.item ?? []).map((line) => ({
		'Cod.Codigo': line.codigo,
		'Qtd.Real': line.qtd,
		'Val.UnBru': line.valUnBru,
	}));

	const documentBody: Record<string, unknown> = {
		'@docID': docID,
		'@entityID': entityID,
		'@retbidID': 'S',
		'@trans': 'S',
		'@RetID': 'S',
		'@status': 'S',
		'@validRecs': 'T',
		docitems: { rec: items },
	};
	if (obs) documentBody['docheader'] = { 'Doc.Obs': obs };

	const xmlBody = buildXml({ document: documentBody });
	return artsoftApiRequest.call(this, 'DocFch/DocInsert', xmlBody);
}

export async function executeSignDocument(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const docID = this.getNodeParameter('signDocID', i) as string;

	const xmlBody = buildXml({
		document: {
			'@docID': docID,
			'@status': 's',
			'@retid': 's',
		},
	});
	return artsoftApiRequest.call(this, 'DocFch/DocSignature', xmlBody);
}

export async function executeDeleteDocument(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const docID = this.getNodeParameter('deleteDocID', i) as string;
	const motDel = getOptionalField(this, i, 'documentDeleteFields', 'deletionReason', 0);

	const documentBody: Record<string, unknown> = {
		'@docID': docID,
		'@status': 'S',
	};
	if (motDel) documentBody['@MotDel'] = motDel;

	const xmlBody = buildXml({ document: documentBody });
	return artsoftApiRequest.call(this, 'DocFch/DocDelete', xmlBody);
}
