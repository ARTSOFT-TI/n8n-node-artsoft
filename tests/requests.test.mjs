// Characterization tests: the XML request each create/update/delete operation sends must not change.
// The references in tests/__golden__/ were recorded from the node before the optional fields moved
// into Additional Fields / Filters, so these tests prove that moving them did not alter any request.
// UPDATE_GOLDEN=1 writes references that do not exist yet; UPDATE_GOLDEN=all rewrites every one
// (only when a change of the request is intended).
// Run with: npm test  (compiles first, then runs against dist/).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const goldenDir = path.join(here, '__golden__');
const resolver = (dir) => require(`../dist/nodes/Artsoft/resolver/${dir}/index.js`);

const customer = resolver('customer');
const supplier = resolver('fornecedor');
const product = resolver('produtos');
const document = resolver('documentos');
const workflow = resolver('workflow');
const event = resolver('event');

function makeContext(params, responses) {
	const requests = [];
	const context = {
		getNodeParameter(name, _i, fallback) {
			if (name in params) return params[name];
			if (fallback === undefined) throw new Error(`Missing parameter: ${name}`);
			return fallback;
		},
		getNode: () => ({ name: 'ARTSOFT' }),
		getCredentials: async () => ({ protocol: 'http', hostIp: 'host', port: 1, rejectUnauthorized: true }),
		helpers: {
			httpRequestWithAuthentication: async (_name, options) => {
				requests.push({ endpoint: options.url.replace(/^http:\/\/host:1\//, ''), body: options.body });
				return responses ? responses[requests.length - 1] ?? "<root rc='0'/>" : "<root rc='0'/>";
			},
		},
	};
	return { context, requests };
}

const address = { street: 'Rua A 1', city: 'Lisboa', zip: '1000-001' };

const cases = [
	// ── customers ──
	{
		name: 'customer-create-full', fn: customer.executeCreateClient,
		params: { clientName: 'Cliente Um', clientAdditionalFields: { nif: '999999990', email: 'a@b.pt', phone: '210000000', notes: 'nota' }, clientAddress: address },
	},
	{
		name: 'customer-create-minimal', fn: customer.executeCreateClient,
		params: { clientName: 'Cliente Dois', clientAdditionalFields: {}, clientAddress: {} },
	},
	{
		name: 'customer-update-full', fn: customer.executeUpdateClient,
		params: { numberCli: '12', clientUpdateFields: { name: 'Novo', nif: '999999990', email: 'n@x.pt', phone: '210000001', notes: 'obs' }, clientAddress: address },
	},
	{
		name: 'customer-update-email-only', fn: customer.executeUpdateClient,
		params: { numberCli: '12', clientUpdateFields: { email: 'n@x.pt' }, clientAddress: {} },
	},
	// ── suppliers ──
	{
		name: 'supplier-create-full', fn: supplier.executeCreateSupplier,
		params: { supplierName: 'Forn Um', supplierAdditionalFields: { nif: '999999991', email: 'f@b.pt', phone: '220000000', notes: 'nota' }, supplierAddress: address },
	},
	{
		name: 'supplier-create-minimal', fn: supplier.executeCreateSupplier,
		params: { supplierName: 'Forn Dois', supplierAdditionalFields: {}, supplierAddress: {} },
	},
	{
		name: 'supplier-update-full', fn: supplier.executeUpdateSupplier,
		params: { numberFor: '7', supplierUpdateFields: { name: 'Novo', nif: '999999991', email: 'n@x.pt', phone: '220000001', notes: 'obs' }, supplierAddress: address },
	},
	{
		name: 'supplier-update-phone-only', fn: supplier.executeUpdateSupplier,
		params: { numberFor: '7', supplierUpdateFields: { phone: '220000001' }, supplierAddress: {} },
	},
	// ── products ──
	{
		name: 'product-create-full', fn: product.executeCreateProduct,
		params: { productCode: 'P1', productName: 'Produto', productAdditionalFields: { optionalCode: 'OPT', notes: 'obs' } },
	},
	{
		name: 'product-create-minimal', fn: product.executeCreateProduct,
		params: { productCode: 'P2', productName: 'Produto 2', productAdditionalFields: {} },
	},
	{
		name: 'product-update-full', fn: product.executeUpdateProduct,
		params: { productCode: 'P1', productUpdateFields: { optionalCode: 'OPT', name: 'Novo nome', notes: 'obs' } },
	},
	{
		name: 'product-update-name-only', fn: product.executeUpdateProduct,
		params: { productCode: 'P1', productUpdateFields: { name: 'Novo nome' } },
	},
	// ── documents ──
	{
		name: 'document-create-with-notes', fn: document.executeCreateDocument,
		params: { docID: 'FT', entityType: 'C', entityID: '12', documentAdditionalFields: { notes: 'obs' }, docItems: { item: [{ codigo: 'A1', qtd: 2, valUnBru: 10 }] } },
	},
	{
		name: 'document-create-no-notes', fn: document.executeCreateDocument,
		params: { docID: 'FT', entityType: 'C', entityID: '12', documentAdditionalFields: {}, docItems: { item: [{ codigo: 'A1', qtd: 2, valUnBru: 10 }] } },
	},
	{
		name: 'document-delete-with-reason', fn: document.executeDeleteDocument,
		params: { deleteDocID: 'FT 1/5', documentDeleteFields: { deletionReason: 3 } },
	},
	{
		name: 'document-delete-no-reason', fn: document.executeDeleteDocument,
		params: { deleteDocID: 'FT 1/5', documentDeleteFields: {} },
	},
	// ── events ──
	{
		name: 'event-list-defaults', fn: event.executeListEvents,
		params: { eventEntityId: '8000', typeEntity: 'C', eventCode: '80.51', eventFilters: {} },
	},
	{
		name: 'event-list-custom', fn: event.executeListEvents,
		params: { eventEntityId: '8000', typeEntity: 'C', eventCode: '80.51', eventFilters: { status: 'N', sortOrder: 'A', showHiddenDetails: false, includeEventAdditionalFields: false, includeThirdPartyAdditionalFields: false } },
	},
	{
		name: 'event-delete-force', fn: event.executeDeleteEvent,
		params: { eventId: '321', eventDeleteFields: { forceDelete: true } },
	},
	{
		name: 'event-delete-plain', fn: event.executeDeleteEvent,
		params: { eventId: '321', eventDeleteFields: {} },
	},
	// ── workflows ──
	{
		name: 'workflow-create-with-client', fn: workflow.executeCreateWorkflow,
		params: { wkfId: 8, workflowUserId: '2', workflowSubject: 'Assunto', workflowPriority: '75', workflowCreateFields: { clientNumber: '1000' }, workflowCdus: {} },
	},
	{
		name: 'workflow-update', fn: workflow.executeUpdateWorkflow,
		params: { workflowUserId: '2', workflowId: '158', workflowSubject: 'Assunto', workflowPriority: '75', workflowObs: 'obs', workflowCdus: {} },
	},
];

for (const c of cases) {
	test(c.name, async () => {
		const { context, requests } = makeContext(c.params);
		await c.fn.call(context, 0);
		const actual = requests[requests.length - 1];
		const file = path.join(goldenDir, `${c.name}.json`);
		// Existing references are never overwritten unless UPDATE_GOLDEN=all.
		const write =
			process.env.UPDATE_GOLDEN === 'all' || (process.env.UPDATE_GOLDEN && !fs.existsSync(file));
		if (write) {
			fs.mkdirSync(goldenDir, { recursive: true });
			fs.writeFileSync(file, JSON.stringify(actual, null, '\t') + '\n');
			return;
		}
		assert.deepEqual(actual, JSON.parse(fs.readFileSync(file, 'utf-8')));
	});
}
