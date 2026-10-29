import { INodeProperties } from 'n8n-workflow';

export const eventOperations = [
	{
		name: 'Get Many',
		value: 'listEvents',
		description: 'List the events of an entity',
		action: 'List events',
	},
	{
		name: 'Get',
		value: 'getEvent',
		description: 'Get a specific event by ID',
		action: 'Get an event',
	},
	{
		name: 'Create',
		value: 'createEvent',
		description: 'Create a new event',
		action: 'Create an event',
	},
	{
		name: 'Update',
		value: 'updateEvent',
		description: 'Update the subject and initial message of an event',
		action: 'Update an event',
	},
	{
		name: 'Add Message',
		value: 'addMessage',
		description: 'Add a new message to an existing event',
		action: 'Add a message to an event',
	},
	{
		name: 'Delete',
		value: 'deleteEvent',
		description: 'Delete an event',
		action: 'Delete an event',
	},
];

export const eventProperties: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════
	// SHARED — Entity ID
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Entity ID',
		name: 'eventEntityId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '8000',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['listEvents', 'getEvent', 'createEvent', 'updateEvent'],
			},
		},
		description: 'Entity identifier',
	},
	{
		displayName: 'Type',
		name: 'typeEntity',
		type: 'options',
		required: true,
		default: 'C',
		options: [
			{ name: 'Customer', value: 'C' },
			{ name: 'Supplier', value: 'F' },
			{ name: 'Other', value: 'N' },
		],
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['listEvents', 'getEvent', 'createEvent', 'updateEvent'],
			},
		},
		description: 'Entity type',
	},

	// ══════════════════════════════════════════════════════════════════
	// SHARED — Event Code
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Event Code',
		name: 'eventCode',
		type: 'string',
		required: true,
		default: '',
		placeholder: '80.51',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['listEvents', 'getEvent', 'createEvent', 'updateEvent'],
			},
		},
		description: 'Event type code in x.yy format',
	},

	// ══════════════════════════════════════════════════════════════════
	// SHARED — Event ID
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Event Number',
		name: 'eventId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['getEvent', 'updateEvent', 'addMessage', 'deleteEvent'],
			},
		},
		description: 'Unique event identifier in ARTSOFT',
	},

	// ══════════════════════════════════════════════════════════════════
	// SHARED — Contact
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Contact',
		name: 'eventContact',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'updateEvent', 'addMessage'],
			},
		},
		description: 'Identifier of the contact associated with the event',
	},

	// ══════════════════════════════════════════════════════════════════
	// SHARED — Subject
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Subject',
		name: 'eventSubject',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'updateEvent'],
			},
		},
		description: 'Event subject text',
	},

	// ══════════════════════════════════════════════════════════════════
	// SHARED — Message
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Message',
		name: 'eventMessage',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'updateEvent', 'addMessage'],
			},
		},
		description: 'Event message body',
	},

	// ══════════════════════════════════════════════════════════════════
	// LIST EVENTS — Filters
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'eventFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['event'], operation: ['listEvents'] } },
		options: [
			{
				displayName: 'Include Event Additional Fields',
				name: 'includeEventAdditionalFields',
				type: 'boolean',
				default: true,
				description: 'Whether to include the content of the event additional record fields',
			},
			{
				displayName: 'Include Third-Party Additional Fields',
				name: 'includeThirdPartyAdditionalFields',
				type: 'boolean',
				default: true,
				description: 'Whether to include the content of the third-party additional record fields',
			},
			{
				displayName: 'Show Hidden Details',
				name: 'showHiddenDetails',
				type: 'boolean',
				default: true,
				description: 'Whether to include hidden details in the response',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				default: 'D',
				options: [
					{ name: 'Descending (Newest First)', value: 'D' },
					{ name: 'Ascending (Oldest First)', value: 'A' },
				],
				description: 'Sort direction of the event details',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'A',
				options: [
					{ name: 'All', value: 'A' },
					{ name: 'Pending', value: 'P' },
					{ name: 'Completed', value: 'F' },
				],
				description: 'Filter events by status',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// CREATE / UPDATE EVENT — Qualifiers
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Qualifiers',
		name: 'eventQualifiers',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'updateEvent'],
			},
		},
		description: 'Event qualifiers (e.g. q1, q5)',
		options: [
			{
				name: 'qualif',
				displayName: 'Qualifier',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: 'q1',
						placeholder: 'q1',
						description: 'Qualifier key (e.g. q1, q5)',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						placeholder: 'x.y',
						description: 'Qualifier value',
					},
				],
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// DELETE EVENT
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'eventDeleteFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['event'], operation: ['deleteEvent'] } },
		options: [
			{
				displayName: 'Force Deletion',
				name: 'forceDelete',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the event even if it already has recorded handling',
			},
		],
	},
];
