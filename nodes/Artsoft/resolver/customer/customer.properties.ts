import { INodeProperties } from 'n8n-workflow';

export const customerOperations = [
	{
		name: 'Create',
		value: 'createClient',
		description: 'Create a new customer (TerFch/Update)',
		action: 'Create a customer',
	},
	{
		name: 'Get',
		value: 'getClient',
		description: 'Get a customer by number (Queries/Query)',
		action: 'Get a customer',
	},
	{
		name: 'Update',
		value: 'updateClient',
		description: 'Update an existing customer (TerFch/Update)',
		action: 'Update a customer',
	},
	{
		name: 'Delete',
		value: 'deleteClient',
		description: 'Delete a customer by ID (TerFch/Delete)',
		action: 'Delete a customer',
	},
];

export const customerProperties: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════
	// CREATE CLIENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Name',
		name: 'clientName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		description: 'Customer name',
	},
	{
		displayName: 'Additional Fields',
		name: 'clientAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Customer email',
			},
			{
				displayName: 'NIF',
				name: 'nif',
				type: 'string',
				default: '',
				description: 'Customer tax ID (NIF)',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Customer notes',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Customer phone number',
			},
		],
	},
	{
		displayName: 'Address',
		name: 'clientAddress',
		type: 'collection',
		placeholder: 'Add address',
		default: {},
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		options: [
			{ displayName: 'Street (Ter.Morada)', name: 'street', type: 'string', default: '' },
			{ displayName: 'City (Ter.Localid)', name: 'city', type: 'string', default: '' },
			{ displayName: 'Postal Code (Ter.CPPais)', name: 'zip', type: 'string', default: '' },
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// GET CLIENT / DELETE CLIENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Customer Number',
		name: 'clientNumero',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['getClient', 'deleteClient'] } },
	},

	// ══════════════════════════════════════════════════════════════════
	// UPDATE CLIENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Customer Number',
		name: 'numberCli',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		description: 'Internal customer number in ARTSOFT',
	},
	{
		displayName: 'Additional Fields',
		name: 'clientUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Customer email',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Customer name',
			},
			{
				displayName: 'NIF',
				name: 'nif',
				type: 'string',
				default: '',
				description: 'Customer tax ID (NIF)',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Customer notes',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Customer phone number',
			},
		],
	},
	{
		displayName: 'Address',
		name: 'clientAddress',
		type: 'collection',
		placeholder: 'Add address',
		default: {},
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		options: [
			{ displayName: 'Street (Ter.Morada)', name: 'street', type: 'string', default: '' },
			{ displayName: 'City (Ter.Localid)', name: 'city', type: 'string', default: '' },
			{ displayName: 'Postal Code (Ter.CPPais)', name: 'zip', type: 'string', default: '' },
		],
	},
];
