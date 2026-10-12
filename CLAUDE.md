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
- **Backward compatibility:** never rename a parameter `name` or an option `value` (they are stored in users' workflows). Only labels may change. Resource values are still Portuguese (`clientes`, `fornecedores`, `produtos`, `documentos`) for that reason.
- No `console.*` (request bodies can contain customer data).

## Architecture

```
credentials/ArtsoftApi.credentials.ts   # credential `artsoftApi`: device registration + login
nodes/Artsoft/Artsoft.node.ts           # node description, loadOptions, credentialTest, execute loop
nodes/Artsoft/credentialTest.ts         # credential test (validates settings, no registration)
nodes/Artsoft/GenericFunctions.ts       # artsoftApiRequest(): POST XML, parse response
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

**The credential test must never register a device** (`nodes/Artsoft/credentialTest.ts`, wired with `testedBy: 'artsoftApiTest'`; the credential has no `test` request). n8n persists what `preAuthentication` returns only when a workflow runs, not reliably while a credential is tested, and the server rejects a second registration, so every Save/Retry would register a new device and lose its keys. The test only checks that Host IP, Port and Contact are set and makes no HTTP request: the function-based test context only offers the deprecated `helpers.request`, which the lint rejects. The device is registered on the first workflow execution.

### Requests

`artsoftApiRequest` POSTs `text/xml` to `<protocol>://<host>:<port>/<service>` through `this.helpers.httpRequestWithAuthentication` and returns `parseXml(response)`. Each resolver builds its body with `buildXml` and calls it with a service name (e.g. `TerFch/Update`, `Queries/Query`, `DocFch/DocInsert`, `Workflow/UpdWorkflow`, `CRMHdr/Insert`).

### XML helpers (`helper/xml.ts`)

`buildXml`: `@name` keys are attributes, `#` is text, arrays repeat the element, `null`/`undefined` are omitted. `parseXml` returns the same JSON shape as fast-xml-parser 4.x did (attributes as `@_name`, numeric/boolean coercion, `#text`). Deliberate differences: DOCTYPE entities are not expanded and `buildXml` rejects documents without exactly one root element.

### Resources and operations

Customer, Supplier, Product (get/create/update/delete), Document (create, get, sign, delete), Workflow (list, get, create, update, delete) and CRM Event (list, get, create, update, add message, delete). The execute loop treats a non-empty `err` attribute in the response as a failure.

## Testing notes

`npm test` compares `helper/xml.ts` with the original libraries on fixed cases and seeded fuzzing. Change the helper only together with these tests. The node itself has no automated end-to-end tests; the operations were tested manually with `npm run dev` against a real ARTSOFT instance before the 2.0.0 release. Repeat that manual check after changes to resolvers or authentication.

## Open items

- The README links to https://help.artsoft.pt/ as the ARTSOFT documentation (required for verification). Check in a browser that it is public and covers the API/connector; it could not be read automatically (only a cookie banner is served without JavaScript).
