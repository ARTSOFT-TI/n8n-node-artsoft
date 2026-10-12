import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest } from '../../GenericFunctions';
import { buildXml } from '../../../../helper/xml';

interface CduEntry {
	fieldId: string;
	value: string;
}

function buildCduEntries(cdus: CduEntry[]): Record<string, unknown>[] {
	return cdus
		.filter((c) => c.fieldId && c.value && c.value.trim() !== '')
		.map((c) => ({ '@id': c.fieldId, '#': c.value.trim() }));
}

export async function executeGetWorkflows(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const wkfId = this.getNodeParameter('wkfId', i) as number;
	const userId = this.getNodeParameter('workflowUserId', i) as string;
	const pageSize = this.getNodeParameter('workflowPageSize', i, 20) as number;
	const next = this.getNodeParameter('workflowNext', i, '0') as string;
	const sortDirection = this.getNodeParameter('workflowSortDirection', i, 'DESC') as string;
	const showActions = this.getNodeParameter('workflowShowActions', i, false) as boolean;
	const showCdu = this.getNodeParameter('workflowShowCdu', i, false) as boolean;

	const asc = sortDirection === 'DESC' ? 'S' : 'N';

	const xmlBody = buildXml({
		root: {
			'@tab': 'WRK',
			'@wk': String(wkfId),
			'@sit': 'ALL',
			'@shwMod': 'N',
			'@shwAct': showActions ? 'S' : 'N',
			'@shwDocs': 'N',
			'@shwCDU': showCdu ? 'S' : 'N',
			'@shwTer': 'T',
			'@logTpOp': 'USR',
			'@logOp': userId,
			'@nrRecs': String(pageSize),
			'@next': next,
			'@asc': asc,
		},
	});

	return artsoftApiRequest.call(this, 'Workflow/GetWorkflows', xmlBody);
}

export async function executeGetWorkflow(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const userId = this.getNodeParameter('workflowUserId', i) as string;
	const workflowId = this.getNodeParameter('workflowId', i) as string;

	const xmlBody = buildXml({
		root: {
			'@tab': 'WRK',
			'@sit': 'ALL',
			'@shwMod': 'N',
			'@shwAct': 'S',
			'@shwDocs': 'N',
			'@shwCDU': 'S',
			'@shwTer': 'T',
			'@logTpOp': 'USR',
			'@logOp': userId,
			'@usr': userId,
			'@id': workflowId,
			'@nrRecs': '1',
			'@next': '0',
			'@asc': 'N',
		},
	});

	return artsoftApiRequest.call(this, 'Workflow/GetWorkflows', xmlBody);
}

export async function executeCreateWorkflow(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const wkfId = this.getNodeParameter('wkfId', i) as number;
	const userId = this.getNodeParameter('workflowUserId', i) as string;
	const clientNumber = this.getNodeParameter('workflowClientNumber', i) as string;
	const subject = this.getNodeParameter('workflowSubject', i) as string;
	const priority = this.getNodeParameter('workflowPriority', i) as string;
	const cduCollection = this.getNodeParameter('workflowCdus', i, {}) as {
		cduValues?: CduEntry[];
	};

	const cduEntries = buildCduEntries(cduCollection.cduValues ?? []);

	const rec: Record<string, unknown> = {
		'@a': 'C',
		'@wkf': String(wkfId),
		'@ini': 'T',
		'@prior': String(priority),
		'@conc': 'WRK',
		'@obs': subject,
		ters: {
			ter: {
				'@tp': 'I',
				'@id': clientNumber,
			},
		},
	};

	if (cduEntries.length > 0) {
		rec['cdus'] = { cdu: cduEntries };
	}

	const xmlBody = buildXml({
		root: {
			'@logTpOp': 'USR',
			'@logOp': userId,
			rec,
		},
	});

	return artsoftApiRequest.call(this, 'Workflow/UpdWorkflow', xmlBody);
}

export async function executeUpdateWorkflow(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const userId = this.getNodeParameter('workflowUserId', i) as string;
	const workflowId = this.getNodeParameter('workflowId', i) as string;
	const subject = this.getNodeParameter('workflowSubject', i) as string;
	const priority = this.getNodeParameter('workflowPriority', i) as string;
	const stObs = this.getNodeParameter('workflowObs', i, '') as string;
	const cduCollection = this.getNodeParameter('workflowCdus', i, {}) as {
		cduValues?: CduEntry[];
	};

	const cduEntries = buildCduEntries(cduCollection.cduValues ?? []);

	const rec: Record<string, unknown> = {
		'@a': 'U',
		'@id': workflowId,
		'@prior': String(priority),
		'@obs': subject,
		'@stObs': stObs,
	};

	if (cduEntries.length > 0) {
		rec['cdus'] = { cdu: cduEntries };
	}

	const xmlBody = buildXml({
		root: {
			'@logTpOp': 'USR',
			'@logOp': userId,
			rec,
		},
	});

	return artsoftApiRequest.call(this, 'Workflow/UpdWorkflow', xmlBody);
}

export async function executeWorkflowAction(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const userId = this.getNodeParameter('workflowUserId', i) as string;
	const workflowId = this.getNodeParameter('workflowId', i) as string;

	const xmlBody = buildXml({
		root: {
			'@logTpOp': 'USR',
			'@logOp': userId,
			rec: {
				'@a': 'A',
				'@id': workflowId,
				'@act': 'D',
			},
		},
	});

	return artsoftApiRequest.call(this, 'Workflow/UpdWorkflow', xmlBody);
}
