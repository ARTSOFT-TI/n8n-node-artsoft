import { IExecuteFunctions } from 'n8n-workflow';
import { artsoftApiRequest } from '../../GenericFunctions';
import { buildXml } from '../../../../helper/xml';

// ─── List Events ──────────────────────────────────────────────────────────────
// <event code='80.51' dethidden='S' entityID='C:8000' detail='A' detorder='D' fduEvt='S' fduTer='S' />

export async function executeListEvents(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const entityId = this.getNodeParameter('eventEntityId', i) as string;
	const typeEntity = this.getNodeParameter('typeEntity', i) as string;
	const code = this.getNodeParameter('eventCode', i) as string;
	const detail = this.getNodeParameter('eventDetail', i, 'A') as string;
	const detorder = this.getNodeParameter('eventDetOrder', i, 'D') as string;
	const dethidden = this.getNodeParameter('eventDethidden', i, true) as boolean;
	const fduEvt = this.getNodeParameter('eventFduEvt', i, true) as boolean;
	const fduTer = this.getNodeParameter('eventFduTer', i, true) as boolean;

	const xmlBody = buildXml({
		event: {
			'@code': code,
			'@dethidden': dethidden ? 'S' : 'N',
			'@entityID': `${typeEntity}:${entityId}`,
			'@detail': detail,
			'@detorder': detorder,
			'@fduEvt': fduEvt ? 'S' : 'N',
			'@fduTer': fduTer ? 'S' : 'N',
		},
	});

	return artsoftApiRequest.call(this, 'CRMHdr/Status', xmlBody);
}

// ─── Get Event ────────────────────────────────────────────────────────────────
// <event code='80.51' dethidden='S' entityID='C:8000' detail='A' detorder='D'
//        fduEvt='S' fduTer='S' start='321316' end='321316' showDets='N' showAssoc='N'/>

export async function executeGetEvent(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const entityId = this.getNodeParameter('eventEntityId', i) as string;
	const code = this.getNodeParameter('eventCode', i) as string;
	const eventId = this.getNodeParameter('eventId', i) as string;
	const typeEntity = this.getNodeParameter('typeEntity', i) as string;

	const xmlBody = buildXml({
		event: {
			'@code': code,
			'@dethidden': 'S',
			'@entityID': `${typeEntity}:${entityId}`,
			'@detail': 'A',
			'@detorder': 'D',
			'@fduEvt': 'S',
			'@fduTer': 'S',
			'@start': eventId,
			'@end': eventId,
			'@showDets': 'N',
			'@showAssoc': 'N',
		},
	});

	return artsoftApiRequest.call(this, 'CRMHdr/Status', xmlBody);
}

// ─── Create Event ─────────────────────────────────────────────────────────────
// <event code='80.51' entityID='C:8000' contact='12'>
//   <subject>text</subject><message>text</message>
// </event>

export async function executeCreateEvent(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const entityId = this.getNodeParameter('eventEntityId', i) as string;
	const code = this.getNodeParameter('eventCode', i) as string;
	const contact = this.getNodeParameter('eventContact', i) as string;
	const subject = this.getNodeParameter('eventSubject', i) as string;
	const message = this.getNodeParameter('eventMessage', i) as string;
	const typeEntity = this.getNodeParameter('typeEntity', i) as string;
	const qualifiers = this.getNodeParameter('eventQualifiers', i, {}) as {
		qualif?: Array<{ key: string; value: string }>;
	};

	const eventNode: Record<string, unknown> = {
		'@code': code,
		'@entityID': `${typeEntity}:${entityId}`,
		'@contact': contact,
		subject,
		message,
	};

	if (qualifiers.qualif?.length) {
		const qualifAttrs: Record<string, string> = {};
		for (const { key, value } of qualifiers.qualif) {
			if (key) qualifAttrs[`@${key}`] = value;
		}
		eventNode.qualif = qualifAttrs;
	}

	const xmlBody = buildXml({ event: eventNode });
	return artsoftApiRequest.call(this, 'CRMHdr/Insert', xmlBody);
}

// ─── Update Event ─────────────────────────────────────────────────────────────
// <event eventId='321318' code='80.51' entityID='C:8000' contact='12'>
//   <subject>text</subject><message>text</message>
// </event>

export async function executeUpdateEvent(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const eventId = this.getNodeParameter('eventId', i) as string;
	const entityId = this.getNodeParameter('eventEntityId', i) as string;
	const code = this.getNodeParameter('eventCode', i) as string;
	const contact = this.getNodeParameter('eventContact', i) as string;
	const subject = this.getNodeParameter('eventSubject', i) as string;
	const message = this.getNodeParameter('eventMessage', i) as string;
	const typeEntity = this.getNodeParameter('typeEntity', i) as string;
	const qualifiers = this.getNodeParameter('eventQualifiers', i, {}) as {
		qualif?: Array<{ key: string; value: string }>;
	};

	const eventNode: Record<string, unknown> = {
		'@eventId': eventId,
		'@code': code,
		'@entityID': `${typeEntity}:${entityId}`,
		'@contact': contact,
		subject,
		message,
	};

	if (qualifiers.qualif?.length) {
		const qualifAttrs: Record<string, string> = {};
		for (const { key, value } of qualifiers.qualif) {
			if (key) qualifAttrs[`@${key}`] = value;
		}
		eventNode.qualif = qualifAttrs;
	}

	const xmlBody = buildXml({ event: eventNode });
	return artsoftApiRequest.call(this, 'CRMHdr/Update', xmlBody);
}

// ─── Add Message ──────────────────────────────────────────────────────────────
// <event eventID='321318' contact='12'><message>nova mensagem</message></event>

export async function executeAddMessage(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const eventId = this.getNodeParameter('eventId', i) as string;
	const contact = this.getNodeParameter('eventContact', i) as string;
	const message = this.getNodeParameter('eventMessage', i) as string;

	const xmlBody = buildXml({
		event: {
			'@eventID': eventId,
			'@contact': contact,
			message,
		},
	});

	return artsoftApiRequest.call(this, 'CRMHdr/Update', xmlBody);
}

// ─── Delete Event ─────────────────────────────────────────────────────────────
// <event eventID='321318' forceDel='s' />

export async function executeDeleteEvent(
	this: IExecuteFunctions,
	i: number,
): Promise<Record<string, unknown>> {
	const eventId = this.getNodeParameter('eventId', i) as string;
	const forceDel = this.getNodeParameter('eventForceDel', i, false) as boolean;

	const eventAttrs: Record<string, unknown> = { '@eventID': eventId };
	if (forceDel) eventAttrs['@forceDel'] = 's';

	const xmlBody = buildXml({ event: eventAttrs });
	return artsoftApiRequest.call(this, 'CRMHdr/Delete', xmlBody);
}
