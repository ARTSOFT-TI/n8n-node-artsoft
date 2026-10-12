// Parity tests: helper/xml.ts must match fast-xml-parser 4.x / xmlbuilder2 (the libraries used
// up to v1.3.0). They are kept as devDependencies purely as a test oracle.
// Run with: npm test  (compiles first, then runs against dist/).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { XMLParser } = require('fast-xml-parser');
const { create } = require('xmlbuilder2');
const { parseXml, buildXml } = require('../dist/helper/xml.js');

const oracleParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	allowBooleanAttributes: true,
	parseAttributeValue: true,
	trimValues: true,
});
const oracleBuild = (data) =>
	create({ version: '1.0', encoding: 'UTF-8' }, data).end({ prettyPrint: false });

function attempt(fn) {
	try {
		return { ok: true, value: fn() };
	} catch (error) {
		return { ok: false, error: String(error?.message ?? error) };
	}
}

function compare(label, input, mine, oracle) {
	if (!oracle.ok) {
		assert.equal(mine.ok, false, `${label}: oracle threw but implementation did not\n${input}`);
		return;
	}
	assert.equal(mine.ok, true, `${label}: implementation threw (${mine.error})\n${input}`);
	assert.equal(
		JSON.stringify(mine.value),
		JSON.stringify(oracle.value),
		`${label}: output differs\n${input}`,
	);
}

const expectParse = (xml) =>
	compare(
		'parse',
		xml,
		attempt(() => parseXml(xml)),
		attempt(() => oracleParser.parse(xml)),
	);
const expectBuild = (data) =>
	compare(
		'build',
		JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? `${value}n` : value)),
		attempt(() => buildXml(data)),
		attempt(() => oracleBuild(data)),
	);

// Deterministic PRNG so failures are reproducible.
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const VALUES = [
	'',
	' ',
	'abc',
	'007',
	'1.50',
	'1e3',
	'0x1F',
	'-5',
	'+3',
	'true',
	'false',
	'12345678901234567890',
	'a&b',
	'<x>',
	'"q"',
	"it's",
	'ção',
	'😀',
	'  padded  ',
	'multi\nline',
	'-0',
	'00',
	'1_000',
	'.5',
	'5.',
	'NaN',
	'Infinity',
	'0',
	'-0.0',
	'1.0',
	'2024-01-31',
	'C:8000',
	'0001234',
	'12,5',
];
const NAMES = ['a', 'b', 'item', 'Cod.Codigo', 'Qtd-Real', 'x_y', 'ns:tag', 'ção', 'rec', 'T1'];
const ATTRS = ['id', 'err', 'type', 'xml:lang', 'a-b', 'a.b', 'Nr', 'ção'];

// ─── Fixed cases ──────────────────────────────────────────────────────────────

test('parse: fixed cases', () => {
	const cases = [
		'<?xml version="1.0" encoding="UTF-8"?><message id="5" err=""/>',
		'<?xml version="1.0"?><a/>',
		'<r a="007" b="1.50" c="1e3" d="0x1F" e="-5" f=" 12 " g="true" h="+3" i="12345678901234567890" j="1.0" k=".5" l="5."/>',
		'<r><a>007</a><b>1.50</b><c>true</c><d> 12 </d><e>0x10</e><f>1e3</f><g>-0</g></r>',
		'<r><a id="1">hello</a><b id="2"></b><c/></r>',
		'<r><i a="1"/><i a="2"/><x>1</x><x>2</x></r>',
		'<r a="&amp;&lt;&gt;&quot;&apos;&#65;&#x42;&nbsp;"><t>&amp;&lt;&gt;&quot;&apos;&#65;&#x42;&copy;</t></r>',
		'<r a="&amp;lt;">&amp;lt; &#38;#60; &#x3C; &#x3c;</r>',
		'<r><![CDATA[ <raw> & ]]></r>',
		'<r>a<![CDATA[b]]>c</r>',
		'<r><![CDATA[12]]></r>',
		'<r><![CDATA[]]></r>',
		'<r><!-- c --><a>1</a></r>',
		'<r>a<!-- c -->b</r>',
		'<r>one<a>1</a>two</r>',
		'<r>1<a/>2</r>',
		'<r checked disabled="x"/>',
		"<r a='x\"y'/>",
		'<r>\n  <a> x </a>\n  <b>\n</b>\n</r>',
		'<ns:r xmlns:ns="u" ns:a="1"><ns:c>2</ns:c></ns:r>',
		'<r a="1" />',
		'<r a = "1"   b="2"/>',
		'<r a="1" a="2"/>',
		'<r a="x\ny"/>',
		'<r a="x\ty"\tb="1"/>',
		'',
		'hello',
		'<!DOCTYPE r><r/>',
		'<?foo bar?><r/>',
		'<?foo?><r/>',
		'<r><a></r>',
		'﻿<r a="1"/>',
		'<r>\r\n<a>1</a>\r\n</r>',
		'<r-x a-b="1"><c.d>2</c.d></r-x>',
		'<r a="Ã§Ã£o">Ã§</r>',
		'<r><a>9007199254740993</a><b>00</b><c>0</c><d>-0.0</d><e>1_000</e></r>',
		'<a/><b/>',
		'<a>1</a><a>2</a>',
		'text<r/>text',
		'<r><a b="1">x</a><a>y</a></r>',
		'<root><table><rec d="Alta" prior="1"/><rec d="Baixa" prior="2"/></table></root>',
		'<message id="123" palete="7" err=""/>',
		'<document id="9" err="12"/>',
		'<r a="">x</r>',
		'<r a=""/>',
		'<r><a>  </a></r>',
		'<r><a>0</a><b>0.0</b><c>-1</c><d>+1</d><e>.5e1</e></r>',
		'<r a="1e400"/>',
		'<r a="0.1e-2"/>',
		'<r a="١٢٣"/>',
		'<r><a>x</a>tail</r>',
		'<r>\t<a/>\t</r>',
	];
	for (const xml of cases) expectParse(xml);
});

test('parse: malformed input is rejected or handled like the oracle', () => {
	const cases = [
		'<r',
		'<r a="1',
		'<r><a>',
		'</r>',
		'<!-- x',
		'<![CDATA[ x',
		'<?xml',
		'<r></r></r>',
	];
	for (const xml of cases) {
		const oracle = attempt(() => oracleParser.parse(xml));
		const mine = attempt(() => parseXml(xml));
		if (oracle.ok) {
			assert.ok(mine.ok || mine.error, `unexpected result for ${xml}`);
		} else {
			assert.equal(mine.ok, false, `expected an error for ${JSON.stringify(xml)}`);
		}
	}
});

test('parse: DOCTYPE is skipped and custom entities are NOT expanded (deliberate difference)', () => {
	assert.deepEqual(parseXml('<!DOCTYPE r [ <!ENTITY e "v"> ]><r>&e;</r>'), { r: '&e;' });
	assert.deepEqual(parseXml('<!DOCTYPE r><r a="1"/>'), { r: { '@_a': 1 } });
});

test('parse: rejects excessive nesting and prototype keys', () => {
	assert.throws(() => parseXml('<a>'.repeat(200) + '</a>'.repeat(200)));
	assert.throws(() => parseXml('<__proto__>1</__proto__>'));
	assert.equal({}.polluted, undefined);
});

test('build: fixed cases', () => {
	const cases = [
		{ root: { '@a': 'x', '@b': 1, '@c': true, '@d': 'a&b<c>"d\'e\n\tf' } },
		{ root: { '#': 'a&b<c>"\'>]]>' } },
		{ root: { '@a': 1, '#': 't', child: { '@z': 2 } } },
		{ root: { item: [{ '@i': 1 }, { '@i': 2 }] } },
		{ root: { item: ['a', 'b'] } },
		{ root: { a: null, b: undefined, c: '', d: 0, e: false, f: {} } },
		{ root: { a: 1.5, b: -3, c: NaN } },
		{ root: {} },
		{ root: { '@a': undefined, '@b': null, '@c': '' } },
		{ root: { '@a': 'ção ü € 😀', '#': 'ç' } },
		{ root: { 'Cod.Codigo': 'x', 'Qtd.Real': 1 } },
		{ root: { a: [[{ '@i': 1 }]] } },
		{ root: { '#': '  padded  ' } },
		{ root: { a: { '#': '' } } },
		{ root: { '#': 5 } },
		{ root: { '#': null } },
		{ root: { a: 1, '#': 't', b: 2 } },
		{ root: { a: [1, null, 2, undefined, ''] } },
		{ root: { a: 10n } },
		{ 'a:b': { '@x:y': 1 } },
		{ root: { 'a.b-c_d': 1 } },
		{ root: { ção: 1 } },
		{ root: { '#': 't', a: { '#': 'u' } } },
		{ root: 'x' },
		{ root: '' },
		{ root: { a: new Date(0) } },
		{ root: { '@a': false } },
		{ root: { '#': 'a\u0001b', '@x': 'a\u000bb' } },
		// invalid names / unsupported keys must be rejected like the oracle (or stricter)
		{ root: { '1a': 'x' } },
		{ root: { 'a b': 'x' } },
		{ root: { '@1a': 'x' } },
		{ root: { '@': 'x' } },
	];
	for (const data of cases) expectBuild(data);
});

test('build: rejects invalid documents', () => {
	assert.throws(() => buildXml({ a: 1, b: 2 }));
	assert.throws(() => buildXml({ root: [{ '@a': 1 }, { '@a': 2 }] }));
	assert.throws(() => buildXml({ root: null }));
	assert.throws(() => buildXml({ root: { $: 'cdata' } }));
	assert.throws(() => buildXml({ root: { '!': 'comment' } }));
	assert.throws(() => buildXml({ root: { '?': 'pi' } }));
	assert.throws(() => buildXml({ root: { '': 'x' } }));
});

// ─── Fuzz ─────────────────────────────────────────────────────────────────────

function pick(rng, list) {
	return list[Math.floor(rng() * list.length)];
}

function genBuildValue(rng, depth) {
	const roll = rng();
	if (depth <= 0 || roll < 0.3) {
		const kind = rng();
		if (kind < 0.7) return pick(rng, VALUES);
		if (kind < 0.85) return pick(rng, [0, 1, -3, 1.5, 1e21, true, false]);
		return kind < 0.93 ? null : undefined;
	}
	if (roll < 0.45) {
		return Array.from({ length: 1 + Math.floor(rng() * 3) }, () => genBuildValue(rng, depth - 1));
	}
	const obj = {};
	const keyCount = Math.floor(rng() * 5);
	for (let k = 0; k < keyCount; k++) {
		const r = rng();
		if (r < 0.35) obj['@' + pick(rng, ATTRS)] = pick(rng, [...VALUES, 1, true, null, undefined]);
		else if (r < 0.5) obj['#'] = pick(rng, [...VALUES, 5, null]);
		else obj[pick(rng, NAMES)] = genBuildValue(rng, depth - 1);
	}
	return obj;
}

test('build: fuzz parity (3000 random documents)', () => {
	const rng = mulberry32(20261007);
	for (let n = 0; n < 3000; n++) {
		const value = genBuildValue(rng, 3);
		// An empty document (no root element) is rejected on purpose, unlike the oracle.
		if ([value].flat(Infinity).every((entry) => entry === undefined || entry === null)) continue;
		expectBuild({ [pick(rng, NAMES)]: value });
	}
});

const TEXTS = [
	...VALUES.map((v) => v.replace(/[<&]/g, '')),
	'&amp;',
	'&lt;b&gt;',
	'&quot;&apos;',
	'&#38;',
	'&#x26;',
	'&#60;',
	'&#x3C;',
	'&#x3c;',
	'&#65;',
	'&copy;',
	'&nbsp;',
	'&unknown;',
	'&amp;lt;',
	'a &amp; b',
	'<![CDATA[ raw <&> ]]>',
	'<![CDATA[12]]>',
	'<![CDATA[]]>',
	'<!-- c -->',
	'\n  ',
	'\t',
	'\r\n',
	' 42 ',
	'true',
	'  false  ',
];

function genXmlText(rng) {
	return Array.from({ length: Math.floor(rng() * 3) }, () => pick(rng, TEXTS)).join(
		pick(rng, ['', ' ', '\n']),
	);
}

function genAttributes(rng) {
	let out = '';
	const used = [];
	const count = Math.floor(rng() * 4);
	for (let k = 0; k < count; k++) {
		const name = pick(rng, ATTRS);
		used.push(name);
		const r = rng();
		const sep = pick(rng, ['', ' ', '  ', '\n', '\t']);
		const value = pick(
			rng,
			VALUES.map((v) => v.replace(/[<&"]/g, '')).concat([
				'&amp;',
				'&#38;',
				'&lt;',
				'&quot;',
				'&#x3E;',
				'&#65;',
				'&copy;',
			]),
		);
		if (r < 0.1) out += ` ${name}`;
		else if (r < 0.3) out += ` ${name}${sep}=${sep}'${value.replace(/'/g, '')}'`;
		else out += ` ${name}${sep}=${sep}"${value}"`;
	}
	return out;
}

function genXmlElement(rng, depth) {
	const name = pick(rng, NAMES);
	const attributes = genAttributes(rng);
	const r = rng();
	if (depth <= 0 || r < 0.2) {
		return pick(rng, [
			`<${name}${attributes}/>`,
			`<${name}${attributes} />`,
			`<${name}${attributes}></${name}>`,
		]);
	}
	let body = genXmlText(rng);
	const children = Math.floor(rng() * 4);
	for (let c = 0; c < children; c++) body += genXmlElement(rng, depth - 1) + genXmlText(rng);
	return `<${name}${attributes}>${body}</${name}>`;
}

test('parse: fuzz parity (5000 random documents)', () => {
	const rng = mulberry32(7102026);
	for (let n = 0; n < 5000; n++) {
		const declaration = pick(rng, [
			'',
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<?xml version="1.0"?>\n',
			'﻿',
		]);
		const roots = 1 + Math.floor(rng() * 2);
		let xml = declaration;
		for (let k = 0; k < roots; k++) xml += genXmlElement(rng, 3);
		expectParse(xml);
	}
});

test('round trip: parse(build(x)) matches the oracle round trip', () => {
	const rng = mulberry32(424242);
	for (let n = 0; n < 1000; n++) {
		const data = { [pick(rng, NAMES)]: genBuildValue(rng, 3) };
		const built = attempt(() => buildXml(data));
		const oracleBuilt = attempt(() => oracleBuild(data));
		if (!built.ok || !oracleBuilt.ok) continue;
		compare(
			'round trip',
			built.value,
			attempt(() => parseXml(built.value)),
			attempt(() => oracleParser.parse(oracleBuilt.value)),
		);
	}
});
