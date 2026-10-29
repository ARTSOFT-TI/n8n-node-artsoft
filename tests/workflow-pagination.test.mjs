// Workflow → Get Many: Return All / Limit walk the `next` cursor.
// Behaviour follows the ARTSOFT XML Server: `next` sits on the root of the response and is absent on
// the last page; a last page that is exactly full still carries `next`, followed by an empty page.
// The responses below are built from that description, not captured from a server.
// Run with: npm test  (compiles first, then runs against dist/).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { executeGetWorkflows } = require('../dist/nodes/Artsoft/resolver/workflow/index.js');

function run(params, responses) {
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
				requests.push(options.body);
				return responses[requests.length - 1] ?? "<root rc='0'/>";
			},
		},
	};
	return executeGetWorkflows.call(context, 0).then((result) => ({ result, requests }));
}

const attr = (body, name) => new RegExp(`${name}="([^"]*)"`).exec(body)?.[1];
const base = { wkfId: 8, workflowUserId: '2' };

test('Return All follows next until it is absent', async () => {
	const { result, requests } = await run({ ...base, returnAll: true }, [
		"<root next='501' rc='0'><rec id='1'/><rec id='2'/></root>",
		"<root next='502' rc='0'><rec id='3'/></root>",
		"<root rc='0'><rec id='4'/></root>",
	]);
	assert.deepEqual(result.map((r) => r['@_id']), [1, 2, 3, 4]);
	assert.deepEqual(requests.map((b) => attr(b, 'next')), ['0', '501', '502']);
	assert.ok(requests.every((b) => attr(b, 'nrRecs') === '100'));
});

test('a single record is returned as one item', async () => {
	const { result } = await run({ ...base, returnAll: true }, ["<root rc='0'><rec id='7'/></root>"]);
	assert.equal(result.length, 1);
	assert.equal(result[0]['@_id'], 7);
});

test('Limit requests only what is missing and stops', async () => {
	const { result, requests } = await run({ ...base, returnAll: false, limit: 3 }, [
		"<root next='501' rc='0'><rec id='1'/><rec id='2'/></root>",
		"<root next='502' rc='0'><rec id='3'/></root>",
	]);
	assert.equal(result.length, 3);
	assert.deepEqual(requests.map((b) => attr(b, 'nrRecs')), ['3', '1']);
});

test('Limit smaller than the page size is a single request', async () => {
	const { result, requests } = await run({ ...base, returnAll: false, limit: 2 }, [
		"<root next='501' rc='0'><rec id='1'/><rec id='2'/></root>",
	]);
	assert.equal(result.length, 2);
	assert.equal(requests.length, 1);
	assert.equal(attr(requests[0], 'nrRecs'), '2');
});

test('an exactly full last page ends on the empty page that follows', async () => {
	const { result, requests } = await run({ ...base, returnAll: true }, [
		"<root next='501' rc='0'><rec id='1'/><rec id='2'/></root>",
		"<root rc='0'/>",
	]);
	assert.equal(result.length, 2);
	assert.equal(requests.length, 2);
});

test('an empty result returns no items', async () => {
	const { result } = await run({ ...base, returnAll: true }, ["<root rc='0'/>"]);
	assert.deepEqual(result, []);
});

test('filters are forwarded on every page', async () => {
	const { requests } = await run(
		{ ...base, returnAll: true, workflowFilters: { sortDirection: 'ASC', showActions: true, showAdditionalFields: true } },
		["<root next='501' rc='0'><rec id='1'/></root>", "<root rc='0'><rec id='2'/></root>"],
	);
	for (const body of requests) {
		assert.equal(attr(body, 'asc'), 'N');
		assert.equal(attr(body, 'shwAct'), 'S');
		assert.equal(attr(body, 'shwCDU'), 'S');
	}
});

test('an error code in the response is reported', async () => {
	await assert.rejects(
		run({ ...base, returnAll: true }, ["<root rc='MissingXMLAttr'/>"]),
		/ARTSOFT rejected the request \(code MissingXMLAttr\)/,
	);
});
