import { INodeProperties } from 'n8n-workflow';

export const productOperations = [
	{
		name: 'Create',
		value: 'createProduct',
		description: 'Create a new product (StkFch/Update)',
		action: 'Create a product',
	},
	{
		name: 'Get',
		value: 'getProduct',
		description: 'Get a product by code (Queries/Query)',
		action: 'Get a product',
	},
	{
		name: 'Update',
		value: 'updateProduct',
		description: 'Update an existing product (StkFch/Update)',
		action: 'Update a product',
	},
	{
		name: 'Delete',
		value: 'deleteProduct',
		description: 'Delete a product by ID (StkFch/Delete)',
		action: 'Delete a product',
	},
];

export const productProperties: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════
	// CREATE PRODUCT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Code (Cod.Codigo)',
		name: 'productCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['produtos'], operation: ['createProduct'] } },
		description: 'Product code',
	},
	{
		displayName: 'Name (Nome.0)',
		name: 'productName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['produtos'], operation: ['createProduct'] } },
		description: 'Main product description',
	},
	{
		displayName: 'Additional Fields',
		name: 'productAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['produtos'], operation: ['createProduct'] } },
		options: [
			{
				displayName: 'Notes (Div.Obs)',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Product notes',
			},
			{
				displayName: 'Optional Code (Cod.Opcional)',
				name: 'optionalCode',
				type: 'string',
				default: '',
				description: 'Optional code (e.g. EAN/barcode)',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// GET PRODUCT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Code (Cod.Codigo)',
		name: 'productCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['produtos'], operation: ['getProduct'] } },
		description: 'Product code to look up',
	},

	// ══════════════════════════════════════════════════════════════════
	// UPDATE PRODUCT
	// ══════════════════════════════════════════════════════════════════
	// {
	// 	displayName: 'Product ID',
	// 	name: 'productId',
	// 	type: 'string',
	// 	required: false,
	// 	default: '',
	// 	displayOptions: { show: { resource: ['produtos'], operation: ['updateProduct'] } },
	// 	description: 'Internal product ID in ARTSOFT (SKU ID)',
	// },
	{
		displayName: 'Code (Cod.Codigo)',
		name: 'productCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['produtos'], operation: ['updateProduct'] } },
		description: 'Product code',
	},
	{
		displayName: 'Additional Fields',
		name: 'productUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['produtos'], operation: ['updateProduct'] } },
		options: [
			{
				displayName: 'Name (Nome.0)',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Main product description',
			},
			{
				displayName: 'Notes (Div.Obs)',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Product notes',
			},
			{
				displayName: 'Optional Code (Cod.Opcional)',
				name: 'optionalCode',
				type: 'string',
				default: '',
				description: 'Optional code (e.g. EAN/barcode)',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// DELETE PRODUCT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['produtos'], operation: ['deleteProduct'] } },
		description: 'Internal product ID in ARTSOFT (SKU ID)',
	},
];
