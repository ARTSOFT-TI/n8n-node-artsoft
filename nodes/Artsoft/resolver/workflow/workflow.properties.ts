import { INodeProperties } from 'n8n-workflow';
import { returnAllProperties } from '../../GenericFunctions';

export const workflowOperations = [
	{
		name: 'Get Many',
		value: 'getWorkflows',
		description: "List the user's workflows (Workflow/GetWorkflows)",
		action: 'List workflows',
	},
	{
		name: 'Get',
		value: 'getWorkflow',
		description: 'Get the details of a workflow by ID (Workflow/GetWorkflows)',
		action: 'Get a workflow',
	},
	{
		name: 'Create',
		value: 'createWorkflow',
		description: 'Create a new workflow (Workflow/UpdWorkflow)',
		action: 'Create a workflow',
	},
	{
		name: 'Update',
		value: 'updateWorkflow',
		description: 'Update an existing workflow (Workflow/UpdWorkflow)',
		action: 'Update a workflow',
	},
	{
		name: 'Delete',
		value: 'executeWorkflowAction',
		description: 'Delete a workflow (Workflow/UpdWorkflow)',
		action: 'Delete a workflow',
	},
];

export const workflowProperties: INodeProperties[] = [
	// ══════════════════════════════════════════════════════════════════
	// LIST WORKFLOWS
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Workflow Type',
		name: 'wkfId',
		type: 'options',
		required: true,
		default: 8,
		options: [
			{ name: 'Leads', value: 8 },
			{ name: 'Suggestions', value: 9 },
		],
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['getWorkflows', 'createWorkflow', 'updateWorkflow'],
			},
		},
		description: 'Workflow type configured in ARTSOFT',
	},
	{
		displayName: 'User ID',
		name: 'workflowUserId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: [
					'getWorkflows',
					'getWorkflow',
					'createWorkflow',
					'updateWorkflow',
					'executeWorkflowAction',
				],
			},
		},
		description: 'User ID in ARTSOFT',
	},
	{
		displayName: 'Filters',
		name: 'workflowFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['workflow'], operation: ['getWorkflows'] } },
		options: [
			{
				displayName: 'Show Actions',
				name: 'showActions',
				type: 'boolean',
				default: false,
				description: 'Whether to show the actions of the records',
			},
			{
				displayName: 'Show Additional Fields',
				name: 'showAdditionalFields',
				type: 'boolean',
				default: false,
				description: 'Whether to include additional fields in the response',
			},
			{
				displayName: 'Sort Order',
				name: 'sortDirection',
				type: 'options',
				options: [
					{ name: 'Descending (Newest First)', value: 'DESC' },
					{ name: 'Ascending (Oldest First)', value: 'ASC' },
				],
				default: 'DESC',
				description: 'Sort direction of the results',
			},
		],
	},
	...returnAllProperties('workflow', ['getWorkflows']),

	// ══════════════════════════════════════════════════════════════════
	// GET WORKFLOW DETAIL
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Workflow ID',
		name: 'workflowId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['getWorkflow', 'updateWorkflow', 'executeWorkflowAction'],
			},
		},
		description: 'Unique workflow record ID in ARTSOFT',
	},

	// ══════════════════════════════════════════════════════════════════
	// CREATE / UPDATE WORKFLOW
	// ══════════════════════════════════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'workflowCreateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['workflow'], operation: ['createWorkflow'] } },
		options: [
			{
				displayName: 'Customer Number',
				name: 'clientNumber',
				type: 'string',
				default: '',
				description: 'Customer number to associate with the workflow',
			},
		],
	},
	{
		displayName: 'Subject',
		name: 'workflowSubject',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['workflow'], operation: ['createWorkflow', 'updateWorkflow'] },
		},
		description: 'Workflow subject/description',
	},
	{
		displayName: 'Notes',
		name: 'workflowObs',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['workflow'], operation: ['updateWorkflow'] },
		},
		description: 'Workflow notes',
	},
	{
		displayName: 'Priority Name or ID',
		name: 'workflowPriority',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkflowPriorities',
		},
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['workflow'], operation: ['createWorkflow', 'updateWorkflow'] },
		},
		description:
			'Workflow priority loaded from ARTSOFT. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'workflowCdus',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add additional field',
		default: {},
		displayOptions: {
			show: { resource: ['workflow'], operation: ['createWorkflow', 'updateWorkflow'] },
		},
		description: 'Additional custom fields of the workflow',
		options: [
			{
				name: 'cduValues',
				displayName: 'Additional Fields',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getWorkflowCduFields',
						},
						default: '',
						description:
							'CDU field loaded from ARTSOFT for the selected workflow type. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'CDU field value',
					},
				],
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════
	// EXECUTE ACTION
	// ══════════════════════════════════════════════════════════════════
	// {
	// 	displayName: 'ID da Ação',
	// 	name: 'workflowActionId',
	// 	type: 'string',
	// 	required: true,
	// 	default: '',
	// 	displayOptions: { show: { resource: ['workflow'], operation: ['executeWorkflowAction'] } },
	// 	description: 'ID da ação a executar no workflow',
	// },
];
