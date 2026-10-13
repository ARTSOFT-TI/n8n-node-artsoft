import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { ArtResolver } from './resolver';
import { customerOperations, customerProperties } from './resolver/customer/customer.properties';
import {
	supplierOperations,
	supplierProperties,
} from './resolver/fornecedor/fornecedor.properties';
import { productOperations, productProperties } from './resolver/produtos/produtos.properties';
import {
	documentOperations,
	documentProperties,
} from './resolver/documentos/documentos.properties';
import { workflowOperations, workflowProperties } from './resolver/workflow/workflow.properties';
import { eventOperations, eventProperties } from './resolver/event/event.properties';
import { artsoftApiRequest } from './GenericFunctions';
import { buildXml, fixEncoding } from '../../helper/xml';

export class Artsoft implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ARTSOFT',
		name: 'artsoft',
		icon: { light: 'file:artsoft.svg', dark: 'file:artsoft.svg' },
		group: ['transform'],
		usableAsTool: true,
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with the ARTSOFT ERP via XML API',
		defaults: {
			name: 'ARTSOFT',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'artsoftApi',
				required: true,
			},
		],
		properties: [
			// ─── Resource selector ─────────────────────────────────────────────
			{
				displayName: 'Recurso',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'CRM Event', value: 'event' },
					{ name: 'Customer', value: 'clientes' },
					{ name: 'Document', value: 'documentos' },
					{ name: 'Product', value: 'produtos' },
					{ name: 'Supplier', value: 'fornecedores' },
					{ name: 'Workflow', value: 'workflow' },
				],
				default: 'clientes',
			},

			// ─── Operation selector (Customer) ─────────────────────────────────
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['clientes'] } },
				options: customerOperations,
				default: 'createClient',
			},

			// ─── Operation selector (Supplier) ─────────────────────────────
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['fornecedores'] } },
				options: supplierOperations,
				default: 'createSupplier',
			},

			// ══════════════════════════════════════════════════════════════════
			// CLIENT
			// ══════════════════════════════════════════════════════════════════
			...customerProperties,

			// ─── Operation selector (Product) ────────────────────────────────
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['produtos'] } },
				options: productOperations,
				default: 'createProduct',
			},

			// ══════════════════════════════════════════════════════════════════
			// SUPPLIER
			// ══════════════════════════════════════════════════════════════════
			...supplierProperties,

			// ══════════════════════════════════════════════════════════════════
			// PRODUCT
			// ══════════════════════════════════════════════════════════════════
			...productProperties,

			// ─── Operation selector (Document) ──────────────────────────────
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['documentos'] } },
				options: documentOperations,
				default: 'createDocument',
			},

			// ══════════════════════════════════════════════════════════════════
			// DOCUMENT
			// ══════════════════════════════════════════════════════════════════
			...documentProperties,

			// ─── Operation selector (Workflow) ─────────────────────────────────
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['workflow'] } },
				options: workflowOperations,
				default: 'getWorkflows',
			},

			// ══════════════════════════════════════════════════════════════════
			// WORKFLOW
			// ══════════════════════════════════════════════════════════════════
			...workflowProperties,

			// ─── Operation selector (CRM Event) ──────────────────────────────
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['event'] } },
				options: eventOperations,
				default: 'listEvents',
			},

			// ══════════════════════════════════════════════════════════════════
			// EVENT (CRM)
			// ══════════════════════════════════════════════════════════════════
			...eventProperties,
		],
	};

	methods = {
		loadOptions: {
			/**
			 * Loads the priorities available in ARTSOFT (Workflow/GetTables tab=PRI).
			 * Used by the Priority field when creating/updating a workflow.
			 */
			async getWorkflowPriorities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const xmlBody = buildXml({
					root: {
						'@tab': 'PRI',
						'@shwWkSt': 'F',
					},
				});

				const response = await artsoftApiRequest.call(this, 'Workflow/GetTables', xmlBody);

				const root = response['root'] as Record<string, unknown> | undefined;
				const prior = root?.['prior'] as Record<string, unknown> | undefined;
				if (!prior) return [];

				const recs = prior['rec'];
				const recArray: Array<Record<string, unknown>> = Array.isArray(recs)
					? recs
					: recs
						? [recs as Record<string, unknown>]
						: [];

				return recArray
					.filter(Boolean)
					.map((rec) => ({
						name: fixEncoding(String(rec['@_d'] ?? rec['@_prior'] ?? '')),
						value: String(rec['@_prior'] ?? ''),
					}))
					.filter((opt) => opt.value !== '');
			},

			/**
			 * Loads the CDU fields available in ARTSOFT (ArtDB/CfgTables) for the workflow.
			 * Derives the idTable from wkfId: 8 (Leads) → 14, 9 (Suggestions) → 15.
			 */
			async getWorkflowCduFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const wkfId = this.getCurrentNodeParameter('wkfId') as number;
				const cduTableIdMap: Record<number, string> = { 8: '14', 9: '15' };
				const cduTableId = cduTableIdMap[wkfId];
				if (!cduTableId) return [];

				const xmlBody = buildXml({
					root: {
						'@table': 'TblCDUWorkFlow',
						'@idTable': cduTableId.trim(),
					},
				});

				const response = await artsoftApiRequest.call(this, 'ArtDB/CfgTables', xmlBody);

				const root = response['root'] as Record<string, unknown> | undefined;
				const table = root?.['table'] as Record<string, unknown> | undefined;
				if (!table) return [];

				const recs = table['rec'];
				const recArray: Array<Record<string, unknown>> = Array.isArray(recs)
					? recs
					: recs
						? [recs as Record<string, unknown>]
						: [];

				return recArray
					.filter(Boolean)
					.map((rec) => ({
						name: fixEncoding(String(rec['#text'] ?? rec['@_cdu'] ?? '')),
						value: String(rec['@_cdu'] ?? ''),
					}))
					.filter((opt) => opt.value !== '');
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const artResolver = new ArtResolver(this);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				const parsed: Record<string, unknown> = await artResolver.resolve(operation, i);

				const root =
					(parsed['message'] as IDataObject) ||
					(parsed['document'] as IDataObject) ||
					(parsed['Entity'] as IDataObject) ||
					{};
				const err = root['@_err'] as string | number | undefined;

				if (err !== undefined && err !== null && err !== '') {
					throw new NodeApiError(
						this.getNode(),
						{ message: `ARTSOFT rejected the request (code ${err})` },
						{
							message: `ARTSOFT rejected the request (code ${err})`,
							description: 'Check the values sent in the request and try again',
							itemIndex: i,
						},
					);
				}

				returnData.push({ json: parsed as IDataObject, pairedItem: i });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: i,
					});
					continue;
				}
				const n8nError =
					error instanceof NodeApiError || error instanceof NodeOperationError
						? error
						: new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
				throw n8nError;
			}
		}

		return [returnData];
	}
}
