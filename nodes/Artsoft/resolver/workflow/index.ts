import {
	IDataObject,
	IExecuteFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { artsoftApiRequest, getOptionalField } from '../../GenericFunctions';
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

// The service has no documented maximum for `nrRecs`; 100 keeps each response small.
const WORKFLOW_PAGE_SIZE = 100;
// Guards against a cursor that never ends.
const WORKFLOW_MAX_PAGES = 1000;

/**
 * Walks Workflow/GetWorkflows until the limit is reached or the response has no `next` cursor.
 * The service keeps the cursor on the root element; a last page that is exactly full still
 * carries `next`, so an empty page also ends the loop.
 */
async function getAllWorkflows(
	context: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const wkfId = context.getNodeParameter('wkfId', i) as number;
	const userId = context.getNodeParameter('workflowUserId', i) as string;
	const returnAll = context.getNodeParameter('returnAll', i, false) as boolean;
	const limit = returnAll ? Infinity : (context.getNodeParameter('limit', i, 50) as number);
	const filters = context.getNodeParameter('workflowFilters', i, {}) as IDataObject;
	const sortDirection = (filters.sortDirection as string) ?? 'DESC';
	const showActions = (filters.showActions as boolean) ?? false;
	const showCdu = (filters.showAdditionalFields as boolean) ?? false;

	const asc = sortDirection === 'DESC' ? 'S' : 'N';
	const results: IDataObject[] = [];
	let next = '0';

	for (let page = 0; page < WORKFLOW_MAX_PAGES; page++) {
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
				'@nrRecs': String(Math.min(limit - results.length, WORKFLOW_PAGE_SIZE)),
				'@next': next,
				'@asc': asc,
			},
		});

		const response = await artsoftApiRequest.call(context, 'Workflow/GetWorkflows', xmlBody);
		const root = (response['root'] as IDataObject | undefined) ?? {};

		const rc = root['@_rc'];
		if (rc !== undefined && String(rc) !== '0') {
			throw new NodeApiError(
				context.getNode(),
				{ message: `ARTSOFT rejected the request (code ${String(rc)})` },
				{ itemIndex: i },
			);
		}

		const rec = root['rec'];
		const records = (Array.isArray(rec) ? rec : rec ? [rec] : []) as IDataObject[];
		results.push(...records);

		const cursor = root['@_next'];
		if (results.length >= limit || cursor === undefined || records.length === 0) {
			return results.slice(0, limit);
		}
		next = String(cursor);
	}

	throw new NodeOperationError(
		context.getNode(),
		`Pagination stopped after ${WORKFLOW_MAX_PAGES} pages; reduce the number of results with a limit.`,
		{ itemIndex: i },
	);
}

export async function executeGetWorkflows(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	return getAllWorkflows(this, i);
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
	const clientNumber = getOptionalField(this, i, 'workflowCreateFields', 'clientNumber', '');
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
