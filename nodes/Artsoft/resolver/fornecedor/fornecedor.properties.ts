import { INodeProperties } from 'n8n-workflow';

export const supplierOperations = [
	{
		name: 'Create',
		value: 'createSupplier',
		description: 'Create a new supplier (TerFch/Update)',
		action: 'Create a supplier',
	},
	{
		name: 'Get',
		value: 'getSupplier',
		description: 'Get a supplier by number (Queries/Query)',
		action: 'Get a supplier',
	},
	{
		name: 'Update',
		value: 'updateSupplier',
		description: 'Update an existing supplier (TerFch/Update)',
		action: 'Update a supplier',
	},
	{
		name: 'Delete',
		value: 'deleteSupplier',
		description: 'Delete a supplier by ID (TerFch/Delete)',
		action: 'Delete a supplier',
	},
];

export const supplierProperties: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════
	// CREATE SUPPLIER
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Name',
		name: 'supplierName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['createSupplier'] } },
		description: 'Supplier name',
	},
	{
		displayName: 'NIF',
		name: 'supplierNif',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['createSupplier'] } },
		description: 'Supplier tax ID (NIF)',
	},
	{
		displayName: 'Email',
		name: 'supplierEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['createSupplier'] } },
		description: 'Supplier email',
	},
	{
		displayName: 'Phone',
		name: 'supplierPhone',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['createSupplier'] } },
		description: 'Supplier phone number',
	},
	{
		displayName: 'Notes',
		name: 'supplierObs',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['createSupplier'] } },
		description: 'Supplier notes',
	},
	{
		displayName: 'Address',
		name: 'supplierAddress',
		type: 'collection',
		placeholder: 'Add address',
		default: {},
		displayOptions: { show: { resource: ['fornecedores'], operation: ['createSupplier'] } },
		options: [
			{ displayName: 'Street (Ter.Morada)', name: 'street', type: 'string', default: '' },
			{ displayName: 'City (Ter.Localid)', name: 'city', type: 'string', default: '' },
			{ displayName: 'Postal Code (Ter.CPPais)', name: 'zip', type: 'string', default: '' },
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// GET SUPPLIER / DELETE SUPPLIER
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Supplier Number',
		name: 'supplierId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['fornecedores'], operation: ['getSupplier', 'deleteSupplier'] },
		},
		description: 'Supplier number in ARTSOFT',
	},

	// ══════════════════════════════════════════════════════════════════
	// UPDATE SUPPLIER
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Supplier Number',
		name: 'numberFor',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		description: 'Internal supplier number in ARTSOFT',
	},
	{
		displayName: 'Name',
		name: 'supplierName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		description: 'Supplier name',
	},
	{
		displayName: 'NIF',
		name: 'supplierNif',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		description: 'Supplier tax ID (NIF)',
	},
	{
		displayName: 'Email',
		name: 'supplierEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		description: 'Supplier email',
	},
	{
		displayName: 'Phone',
		name: 'supplierPhone',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		description: 'Supplier phone number',
	},
	{
		displayName: 'Notes',
		name: 'supplierObs',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		description: 'Supplier notes',
	},
	{
		displayName: 'Address',
		name: 'supplierAddress',
		type: 'collection',
		placeholder: 'Add address',
		default: {},
		displayOptions: { show: { resource: ['fornecedores'], operation: ['updateSupplier'] } },
		options: [
			{ displayName: 'Street (Ter.Morada)', name: 'street', type: 'string', default: '' },
			{ displayName: 'City (Ter.Localid)', name: 'city', type: 'string', default: '' },
			{ displayName: 'Postal Code (Ter.CPPais)', name: 'zip', type: 'string', default: '' },
		],
	},
];
