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
		displayName: 'NIF',
		name: 'clientNif',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		description: 'Customer tax ID (NIF)',
	},
	{
		displayName: 'Email',
		name: 'clientEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		description: 'Customer email',
	},
	{
		displayName: 'Phone',
		name: 'clientPhone',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		description: 'Customer phone number',
	},
	{
		displayName: 'Notes',
		name: 'clientObs',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['createClient'] } },
		description: 'Customer notes',
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
		displayName: 'Name',
		name: 'clientName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		description: 'Customer name',
	},
	{
		displayName: 'NIF',
		name: 'clientNif',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		description: 'Customer tax ID (NIF)',
	},
	{
		displayName: 'Email',
		name: 'clientEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		description: 'Customer email',
	},
	{
		displayName: 'Phone',
		name: 'clientPhone',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		description: 'Customer phone number',
	},
	{
		displayName: 'Notes',
		name: 'clientObs',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['clientes'], operation: ['updateClient'] } },
		description: 'Customer notes',
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
