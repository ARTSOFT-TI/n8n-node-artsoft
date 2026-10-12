/**
 * Minimal dependency-free XML helpers.
 *
 * `parseXml` and `buildXml` intentionally reproduce the output of the libraries used up to
 * v1.3.0 (fast-xml-parser 4.x with `ignoreAttributes: false`, `attributeNamePrefix: '@_'`,
 * `parseAttributeValue: true`, and xmlbuilder2 with `prettyPrint: false`) so existing
 * workflows keep receiving the same JSON. Behaviour is covered by tests/xml.parity.test.mjs.
 *
 * Known limitations (all deliberate):
 * - DOCTYPE declarations are skipped; custom entities are not expanded.
 * - Only the five predefined XML entities (named or numeric) are decoded.
 * - `buildXml` rejects CDATA/comment/processing-instruction keys ('$', '!', '?').
 */

// ─── Parsing ──────────────────────────────────────────────────────────────────

const ATTRIBUTE_PREFIX = '@_';
const TEXT_NODE_NAME = '#text';
const MAX_NESTED_TAGS = 100;

type Scalar = string | number | boolean;
type ParsedValue = Scalar | ParsedObject | ParsedValue[];
interface ParsedObject {
	[key: string]: ParsedValue;
}

interface XmlElement {
	name: string;
	attributes?: ParsedObject;
	items: XmlItem[];
}

type XmlItem = { kind: 'text'; value: Scalar } | { kind: 'element'; element: XmlElement };

const hasOwn = (obj: object, key: string): boolean =>
	Object.prototype.hasOwnProperty.call(obj, key);

const HEX_REGEX = /^[-+]?0x[a-fA-F0-9]+$/;
const NUMBER_REGEX = /^([-+])?(0*)([0-9]*(\.[0-9]*)?)$/;

function trimZeros(numStr: string): string {
	if (numStr && numStr.indexOf('.') !== -1) {
		let result = numStr.replace(/0+$/, '');
		if (result === '.') result = '0';
		else if (result[0] === '.') result = '0' + result;
		else if (result[result.length - 1] === '.') result = result.slice(0, -1);
		return result;
	}
	return numStr;
}

/**
 * Converts numeric-looking strings to numbers and leaves everything else untouched
 * (e.g. "007" -> 7, "1e3" -> 1000, "0x1F" -> 31, but "1_000" stays a string).
 * Port of strnum 1.1.2 (MIT) with its default options (hex, leading zeros, e-notation).
 */
function toNumber(str: string): string | number {
	if (!str) return str;

	let trimmed = str.trim();
	if (str === '0') return 0;
	if (HEX_REGEX.test(trimmed)) return parseInt(trimmed, 16);

	if (trimmed.search(/[eE]/) !== -1) {
		const notation = trimmed.match(/^([-+])?(0*)([0-9]*(\.[0-9]*)?[eE][-+]?[0-9]+)$/);
		if (!notation) return str;
		trimmed = (notation[1] || '') + notation[3];
		return Number(trimmed);
	}

	const match = NUMBER_REGEX.exec(trimmed);
	if (!match) return str;

	const sign = match[1] ?? '';
	const leadingZeros = match[2];
	const numTrimmedByZeros = trimZeros(match[3]);

	if (leadingZeros === str) return 0;

	const num = Number(trimmed);
	const numStr = '' + num;

	if (numStr.search(/[eE]/) !== -1) return num;

	if (trimmed.indexOf('.') !== -1) {
		if (numStr === '0' && numTrimmedByZeros === '') return num;
		if (numStr === numTrimmedByZeros) return num;
		if (sign && numStr === '-' + numTrimmedByZeros) return num;
		return str;
	}

	if (leadingZeros) {
		return numTrimmedByZeros === numStr || sign + numTrimmedByZeros === numStr ? num : str;
	}
	return trimmed === numStr || trimmed === sign + numStr ? num : str;
}

function parseValue(val: string): Scalar {
	const trimmed = val.trim();
	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;
	return toNumber(val);
}

function replaceEntities(val: string): string {
	if (val.indexOf('&') === -1) return val;
	return val
		.replace(/&(apos|#39|#x27);/g, "'")
		.replace(/&(gt|#62|#x3E);/g, '>')
		.replace(/&(lt|#60|#x3C);/g, '<')
		.replace(/&(quot|#34|#x22);/g, '"')
		.replace(/&(amp|#38|#x26);/g, '&');
}

function parseText(raw: string, isCdata = false): Scalar | undefined {
	const value = isCdata ? raw : raw.trim();
	if (value.length === 0) return undefined;
	return parseValue(isCdata ? value : replaceEntities(value));
}

const ATTRIBUTE_REGEX = /([^\s=]+)\s*(=\s*(['"])([\s\S]*?)\3)?/g;

function buildAttributes(attrStr: string): ParsedObject | undefined {
	const attributes: ParsedObject = {};
	let count = 0;
	for (const match of attrStr.matchAll(ATTRIBUTE_REGEX)) {
		const key = ATTRIBUTE_PREFIX + match[1];
		const rawValue = match[4];
		if (rawValue !== undefined) {
			attributes[key] = parseValue(replaceEntities(rawValue.trim()));
		} else {
			attributes[key] = true;
		}
		count++;
	}
	return count > 0 ? attributes : undefined;
}

/** Index of the last character of `needle`, searching from `from`. */
function findClosingIndex(xml: string, needle: string, from: number, errorMessage: string): number {
	const index = xml.indexOf(needle, from);
	if (index === -1) throw new Error(errorMessage);
	return index + needle.length - 1;
}

/** Reads a tag expression up to `closing`, ignoring closing characters inside quotes. */
function readTagExpression(
	xml: string,
	from: number,
	closing: string,
): { data: string; index: number } | undefined {
	let boundary = '';
	let data = '';
	for (let index = from; index < xml.length; index++) {
		let ch = xml[index];
		if (boundary) {
			if (ch === boundary) boundary = '';
		} else if (ch === '"' || ch === "'") {
			boundary = ch;
		} else if (ch === closing[0]) {
			if (closing.length === 1 || xml[index + 1] === closing[1]) return { data, index };
		} else if (ch === '\t') {
			ch = ' ';
		}
		data += ch;
	}
	return undefined;
}

function splitTag(data: string): { tagName: string; tagExp: string } {
	const separator = data.search(/\s/);
	if (separator === -1) return { tagName: data, tagExp: data };
	return {
		tagName: data.substring(0, separator),
		tagExp: data.substring(separator + 1).trimStart(),
	};
}

function skipDocType(xml: string, from: number): number {
	let depth = 0;
	let quote = '';
	for (let index = from; index < xml.length; index++) {
		const ch = xml[index];
		if (quote) {
			if (ch === quote) quote = '';
		} else if (ch === '"' || ch === "'") {
			quote = ch;
		} else if (ch === '[') {
			depth++;
		} else if (ch === ']') {
			depth--;
		} else if (ch === '>' && depth <= 0) {
			return index;
		}
	}
	throw new Error('DOCTYPE is not closed.');
}

function assertSafeName(name: string): void {
	if (name === '__proto__' || name === 'constructor' || name === 'prototype') {
		throw new Error(`Invalid name: "${name}" is not allowed`);
	}
}

function compress(items: XmlItem[]): ParsedObject {
	const result: ParsedObject = {};
	let text: Scalar | undefined;

	for (const item of items) {
		if (item.kind === 'text') {
			text = text === undefined ? item.value : text + ('' + item.value);
			continue;
		}

		const { element } = item;
		assertSafeName(element.name);
		const compressed = compress(element.items);
		let value: ParsedValue = compressed;

		if (element.attributes) {
			Object.assign(compressed, element.attributes);
		} else {
			const keys = Object.keys(compressed);
			if (keys.length === 1 && compressed[TEXT_NODE_NAME] !== undefined) {
				value = compressed[TEXT_NODE_NAME];
			} else if (keys.length === 0) {
				value = '';
			}
		}

		if (result[element.name] !== undefined && hasOwn(result, element.name)) {
			const existing = result[element.name];
			if (Array.isArray(existing)) existing.push(value);
			else result[element.name] = [existing, value];
		} else {
			result[element.name] = value;
		}
	}

	if (typeof text === 'string') {
		if (text.length > 0) result[TEXT_NODE_NAME] = text;
	} else if (text !== undefined) {
		result[TEXT_NODE_NAME] = text;
	}
	return result;
}

/**
 * Parse an XML string into a plain JS object.
 */
export function parseXml(xml: string): Record<string, unknown> {
	const source = xml.replace(/\r\n?/g, '\n');
	const root: XmlElement = { name: '!xml', items: [] };
	const stack: XmlElement[] = [root];
	let textData = '';

	const current = (): XmlElement => stack[stack.length - 1];
	const flushText = (target: XmlElement): void => {
		if (!textData) return;
		const value = parseText(textData);
		if (value !== undefined && value !== '') target.items.push({ kind: 'text', value });
		textData = '';
	};

	for (let i = 0; i < source.length; i++) {
		if (source[i] !== '<') {
			const next = source.indexOf('<', i);
			const end = next === -1 ? source.length : next;
			textData += source.substring(i, end);
			i = end - 1;
			continue;
		}

		const next = source[i + 1];

		if (next === '/') {
			const closeIndex = findClosingIndex(source, '>', i, 'Closing Tag is not closed.');
			flushText(current());
			if (stack.length === 1) throw new Error('Unexpected closing tag.');
			stack.pop();
			textData = '';
			i = closeIndex;
		} else if (next === '?') {
			const tag = readTagExpression(source, i + 1, '?>');
			if (!tag) throw new Error('Pi Tag is not closed.');
			flushText(current());

			const { tagName, tagExp } = splitTag(tag.data);
			const element: XmlElement = { name: tagName, items: [{ kind: 'text', value: '' }] };
			if (tagName !== tagExp) element.attributes = buildAttributes(tagExp);
			current().items.push({ kind: 'element', element });
			i = tag.index + 1;
		} else if (source.startsWith('!--', i + 1)) {
			i = findClosingIndex(source, '-->', i + 4, 'Comment is not closed.');
		} else if (source.startsWith('!D', i + 1)) {
			i = skipDocType(source, i);
		} else if (source.startsWith('![', i + 1)) {
			const closeIndex = findClosingIndex(source, ']]>', i, 'CDATA is not closed.') - 2;
			flushText(current());
			const value = parseText(source.substring(i + 9, closeIndex), true) ?? '';
			current().items.push({ kind: 'text', value });
			i = closeIndex + 2;
		} else {
			const tag = readTagExpression(source, i + 1, '>');
			if (!tag) throw new Error('Tag is not closed.');

			let { tagName, tagExp } = splitTag(tag.data);

			if (textData && current() !== root) flushText(current());

			if (tagExp.length > 0 && tagExp.lastIndexOf('/') === tagExp.length - 1) {
				// Self-closing tag
				if (tagName[tagName.length - 1] === '/') {
					tagName = tagName.substring(0, tagName.length - 1);
					tagExp = tagName;
				} else {
					tagExp = tagExp.substring(0, tagExp.length - 1);
				}
				const element: XmlElement = { name: tagName, items: [] };
				if (tagName !== tagExp) element.attributes = buildAttributes(tagExp);
				current().items.push({ kind: 'element', element });
			} else {
				if (stack.length - 1 > MAX_NESTED_TAGS) throw new Error('Maximum nested tags exceeded');
				const element: XmlElement = { name: tagName, items: [] };
				if (tagName !== tagExp) element.attributes = buildAttributes(tagExp);
				current().items.push({ kind: 'element', element });
				stack.push(element);
			}
			textData = '';
			i = tag.index;
		}
	}

	return compress(root.items);
}

// ─── Building ─────────────────────────────────────────────────────────────────

const NAME_START =
	':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C\\u200D' +
	'\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}';
// The combining-character ranges below are the NameChar productions from the XML 1.0 spec.
const XML_NAME = new RegExp(
	// eslint-disable-next-line no-misleading-character-class
	`^[${NAME_START}][${NAME_START}\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`,
	'u',
);

function assertXmlName(name: string): void {
	if (!XML_NAME.test(name)) throw new Error(`Invalid XML name: "${name}"`);
}

const escapeText = (value: string): string =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttribute = (value: string): string => escapeText(value).replace(/"/g, '&quot;');

function renderElement(name: string, value: unknown): string {
	if (value === undefined || value === null) return '';

	if (Array.isArray(value)) {
		return value.map((entry) => renderElement(name, entry)).join('');
	}

	assertXmlName(name);

	if (typeof value !== 'object') {
		const text = String(value);
		return text === '' ? `<${name}/>` : `<${name}>${escapeText(text)}</${name}>`;
	}

	let attributes = '';
	let content = '';
	let hasContent = false;

	for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
		if (key.startsWith('@')) {
			if (entry === undefined || entry === null) continue;
			const attributeName = key.substring(1);
			assertXmlName(attributeName);
			attributes += ` ${attributeName}="${escapeAttribute(String(entry))}"`;
		} else if (key === '#') {
			if (entry === undefined || entry === null) continue;
			content += escapeText(String(entry));
			hasContent = true;
		} else {
			if (/^[$!?]/.test(key)) throw new Error(`Unsupported XML node key: "${key}"`);
			const child = renderElement(key, entry);
			if (child !== '') hasContent = true;
			content += child;
		}
	}

	return hasContent ? `<${name}${attributes}>${content}</${name}>` : `<${name}${attributes}/>`;
}

/**
 * Build an XML string from a plain JS object.
 * The root key of `data` becomes the root element.
 *
 * Conventions: `@name` keys are attributes, `#` is the text content, arrays repeat the
 * element, and `null`/`undefined` values are omitted.
 */
export function buildXml(data: Record<string, unknown>): string {
	const roots: Array<[string, unknown]> = [];
	for (const [name, value] of Object.entries(data)) {
		for (const entry of [value].flat(Infinity)) {
			if (entry !== undefined && entry !== null) roots.push([name, entry]);
		}
	}
	if (roots.length !== 1) {
		throw new Error('XML document must have exactly one root element');
	}
	return `<?xml version="1.0" encoding="UTF-8"?>${renderElement(roots[0][0], roots[0][1])}`;
}

// ─── ARTSOFT helpers ──────────────────────────────────────────────────────────

/**
 * Corrige strings que chegaram com bytes UTF-8 interpretados como Latin-1.
 * Tenta re-decodificar: converte a string (lida como latin1) de volta para UTF-8.
 * Se falhar ou o resultado for inválido, devolve a string original.
 */
export function fixEncoding(str: string): string {
	try {
		const fixed = Buffer.from(str, 'latin1').toString('utf8');
		return fixed;
	} catch {
		return str;
	}
}

/**
 * Extract the parsed response fields exposed by the node:
 * success, id, palete, err, parsed, rawXml (if debug).
 */
export function parseArtsoftResponse(
	rawXml: string,
	debug = false,
): {
	success: boolean;
	id?: string | number;
	palete?: string | number;
	err?: string | number;
	parsed: Record<string, unknown>;
	rawXml?: string;
} {
	const parsed = parseXml(rawXml);

	// Response can be <message id="..." /> or <document id="..." />
	const root =
		(parsed['message'] as Record<string, unknown>) ||
		(parsed['document'] as Record<string, unknown>) ||
		{};

	const id = root['@_id'] as string | number | undefined;
	const palete = root['@_palete'] as string | number | undefined;
	const err = root['@_err'] as string | number | undefined;

	const success = err === undefined || err === null || err === '';

	return {
		success,
		...(id !== undefined && { id }),
		...(palete !== undefined && { palete }),
		...(!success && { err }),
		parsed,
		...(debug && { rawXml }),
	};
}
