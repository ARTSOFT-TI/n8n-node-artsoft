# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`n8n-nodes-artsoft` is an **n8n community node** for the ARTSOFT ERP. It sends XML requests over HTTP(S) to the ARTSOFT connector and returns the parsed response as JSON. The goal is to publish it as a **verified** community node, so the constraints below are not optional.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start a local n8n with the node linked (n8n-node dev)
npm run build      # compile + copy static files (n8n-node build)
npm run lint       # n8n lint rules (must stay at 0 errors)
npm run lint:fix   # apply auto-fixes
npm test           # tsc + parity tests for helper/xml.ts (tests/*.test.mjs)
```

Releases go through `npm run release` (release-it) and the `Publish` GitHub Action (npm trusted publishing with provenance). Never run `npm publish` manually.

## Verification constraints (do not break)

- **No runtime dependencies.** `dependencies` must stay empty; imports other than `n8n-workflow` and Node built-ins are rejected by the lint. `fast-xml-parser` and `xmlbuilder2` are pinned `devDependencies` used only as a test oracle.
- **No file system or environment access** (`fs`, `os`, `process.env`). Everything the node needs comes from node parameters or credentials.
- **English only** for UI text, descriptions and error messages. Follow the n8n UX guidelines (Title Case labels, sentence-case descriptions, "Whether…" for booleans, "… Name or ID" for dynamic options, no "error/failed" wording in messages).
- **Backward compatibility:** parameter `name`s and option `value`s are stored in users' workflows. Never rename or move one without a **major** version bump and a migration note in the README (n8n does not convert stored values and does not warn). Version 4.0.0 moved the optional fields into `Additional Fields` / `Filters` collections this way. Resource values are still Portuguese (`clientes`, `fornecedores`, `produtos`, `documentos`) for that reason.
- No `console.*` (request bodies can contain customer data).

## Architecture

```
credentials/ArtsoftApi.credentials.ts   # credential `artsoftApi`: device registration + login
nodes/Artsoft/Artsoft.node.ts           # node description, loadOptions, execute loop
nodes/Artsoft/GenericFunctions.ts       # artsoftApiRequest(), getOptionalField(), returnAllProperties()
nodes/Artsoft/resolver/                 # one folder per resource (properties + XML builders)
helper/xml.ts                           # dependency-free parseXml / buildXml / fixEncoding
tests/xml.parity.test.mjs               # parity tests against the previous XML libraries
icons/, nodes/Artsoft/artsoft.svg       # icons (credential / node)
```

### Authentication (`ArtsoftApi.credentials.ts`)

ARTSOFT requires every integration to be registered as a **device** and approved in ARTSOFT.

1. `preAuthentication` runs when `accessToken` is empty or a request returns 401.
2. If `apiKey`/`apiSecret` are empty it calls `POST /ArtConn/AppRegister` (random `devID`, `AppName=n8n`, `Name=<Device Name field>`, `Contact`). The server returns `ApiKey` and `Secret` **once** and rejects a second registration of the same device, so the keys are persisted in hidden credential fields (confirmed in a real n8n instance: they are kept between workflow runs and restarts). Registration is never repeated while the keys exist.
3. It logs in with `GET /login` (`X-API-KEY`, `X-API-TIMESTAMP`, `X-API-HMAC: HS256:<hmac-sha256(hex secret, "\n<ts>\nGET\n/login")>`, `X-API-APP`) and stores the `x-access-token` header as `accessToken`.
4. `authenticate` sends `Authorization: Bearer {{accessToken}}`.

A new device stays pending until approved in ARTSOFT; the login error says so. After approving, the login can keep returning 401 for a while; it works after waiting. A lost `Secret` can only be recovered by deleting the device in ARTSOFT (back office or MobileManager) and registering again.

**Credential test** (`test` property on the credential, required by the n8n reviewers; a function-based `testedBy` was rejected as "Missing credential test"). It is a declarative `GET /login` reachability check with `ignoreHttpStatusErrors`. Verified manually in a real n8n instance against ARTSOFT (2026-10-13): testing and saving a new credential does not leave an orphan device and the next workflow run reuses the keys. Repeat that check if the test request or `preAuthentication` changes.

### Requests

`artsoftApiRequest` POSTs `text/xml` to `<protocol>://<host>:<port>/<service>` through `this.helpers.httpRequestWithAuthentication` and returns `parseXml(response)`. Each resolver builds its body with `buildXml` and calls it with a service name (e.g. `TerFch/Update`, `Queries/Query`, `DocFch/DocInsert`, `Workflow/UpdWorkflow`, `CRMHdr/Insert`).

### XML helpers (`helper/xml.ts`)

`buildXml`: `@name` keys are attributes, `#` is text, arrays repeat the element, `null`/`undefined` are omitted. `parseXml` returns the same JSON shape as fast-xml-parser 4.x did (attributes as `@_name`, numeric/boolean coercion, `#text`). Deliberate differences: DOCTYPE entities are not expanded and `buildXml` rejects documents without exactly one root element.

### Resources and operations

Customer, Supplier, Product (get/create/update/delete), Document (create, get, sign, delete), Workflow (list, get, create, update, delete) and CRM Event (list, get, create, update, add message, delete). The execute loop treats a non-empty `err` attribute in the response as a failure.

## Field layout

Required fields are at the top level of each operation; optional ones live in an `Additional Fields` collection (create/update) or a `Filters` collection (lists), and *Workflow → Get Many* has **Return All / Limit**. The resolvers read optional values with `getOptionalField()`, and only list operations that return an array produce one item per record. Field requirements come from the node (`required: true`): the ARTSOFT services were checked for the identifiers (`logTpOp`/`logOp`, `id`, `eventID`) but not for business fields such as name or NIF.

## Testing notes

`npm test` runs, against `dist/`: the `helper/xml.ts` parity tests; `tests/requests.test.mjs`, which compares the XML request of every create/update/delete operation with the references in `tests/__golden__/` (recorded before the optional fields moved into collections; `UPDATE_GOLDEN=1` only writes missing references, `UPDATE_GOLDEN=all` rewrites them, only when a change of the request is intended); and `tests/workflow-pagination.test.mjs` for the Return All / Limit loop. The pagination responses are built from the XML Server description, not captured from a server. The node has no automated end-to-end tests; the operations were tested manually with `npm run dev` against a real ARTSOFT instance before the 2.0.0 release. Repeat that manual check after changes to resolvers or authentication.

## Open items

- The README links to https://help.artsoft.pt/ as the ARTSOFT documentation (required for verification). Check in a browser that it is public and covers the API/connector; it could not be read automatically (only a cookie banner is served without JavaScript).
