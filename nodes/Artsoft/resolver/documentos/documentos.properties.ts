import { INodeProperties } from 'n8n-workflow';

export const documentOperations = [
	{
		name: 'Create',
		value: 'createDocument',
		description: 'Insert a new document (DocFch/DocInsert)',
		action: 'Create a document',
	},
	{
		name: 'Get',
		value: 'getDocument',
		description: 'Get a document by type and number (Queries/Query)',
		action: 'Get a document',
	},
	{
		name: 'Sign',
		value: 'signDocument',
		description: 'Sign a document (DocFch/DocSignature)',
		action: 'Sign a document',
	},
	{
		name: 'Delete',
		value: 'deleteDocument',
		description: 'Delete a document (DocFch/DocDelete)',
		action: 'Delete a document',
	},
];

export const documentProperties: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════
	// CREATE DOCUMENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Document Type (docID)',
		name: 'docID',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'V010',
		displayOptions: { show: { resource: ['documentos'], operation: ['createDocument'] } },
		description: 'Document type (e.g. V010)',
	},
	{
		displayName: 'Entity Type',
		name: 'entityType',
		type: 'options',
		required: true,
		default: 'C',
		displayOptions: { show: { resource: ['documentos'], operation: ['createDocument'] } },
		options: [
			{ name: 'Customer', value: 'C' },
			{ name: 'Supplier', value: 'F' },
		],
		description: 'Type of the entity associated with the document',
	},
	{
		displayName: 'Entity ID',
		name: 'entityID',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1000',
		displayOptions: { show: { resource: ['documentos'], operation: ['createDocument'] } },
		description: 'Entity number (combined with the type, e.g. C:1000)',
	},
	{
		displayName: 'Additional Fields',
		name: 'documentAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['documentos'], operation: ['createDocument'] } },
		options: [
			{
				displayName: 'Notes (Doc.Obs)',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Document header notes',
			},
		],
	},
	{
		displayName: 'Document Items',
		name: 'docItems',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		displayOptions: { show: { resource: ['documentos'], operation: ['createDocument'] } },
		description: 'Document lines',
		options: [
			{
				name: 'item',
				displayName: 'Item',
				values: [
					{
						displayName: 'Code (Cod.Codigo)',
						name: 'codigo',
						type: 'string',
						required: true,
						default: '',
						description: 'Product code',
					},
					{
						displayName: 'Quantity (Qtd.Real)',
						name: 'qtd',
						type: 'number',
						required: true,
						default: 1,
						description: 'Quantity',
					},
					{
						displayName: 'Gross Unit Value (Val.UnBru)',
						name: 'valUnBru',
						type: 'number',
						required: true,
						default: 0,
						description: 'Gross unit value',
					},
				],
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// GET DOCUMENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Document Type (TpDoc)',
		name: 'docType',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'V010',
		displayOptions: { show: { resource: ['documentos'], operation: ['getDocument'] } },
		description: 'Document type (e.g. V010)',
	},
	{
		displayName: 'Document Number (NrDoc)',
		name: 'docNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2429',
		displayOptions: { show: { resource: ['documentos'], operation: ['getDocument'] } },
		description: 'Document number',
	},

	// ══════════════════════════════════════════════════════════════════
	// SIGN DOCUMENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Document ID (docID)',
		name: 'signDocID',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'V010/1365163400',
		displayOptions: { show: { resource: ['documentos'], operation: ['signDocument'] } },
		description: 'Full document ID in TpDoc/NrDoc format (e.g. V010/1365163400)',
	},

	// ══════════════════════════════════════════════════════════════════
	// DELETE DOCUMENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Document ID (docID)',
		name: 'deleteDocID',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'V010/2429',
		displayOptions: { show: { resource: ['documentos'], operation: ['deleteDocument'] } },
		description: 'Full document ID in TpDoc/NrDoc format (e.g. V010/2429)',
	},
	{
		displayName: 'Additional Fields',
		name: 'documentDeleteFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['documentos'], operation: ['deleteDocument'] } },
		options: [
			{
				displayName: 'Cancellation Reason (MotDel)',
				name: 'deletionReason',
				type: 'number',
				default: 0,
				description: 'Cancellation reason number (optional)',
			},
		],
	},
];
