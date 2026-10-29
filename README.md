# n8n-nodes-artsoft

[n8n](https://n8n.io) community node for **ARTSOFT** (ERP by ARTSOFT Business Software). It lets workflows create, read, update and delete customers, suppliers, products, documents, workflows and CRM events through the ARTSOFT XML connector.

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Credentials](#credentials)
- [Operations](#operations)
- [Example workflow](#example-workflow)
- [Response format](#response-format)
- [Compatibility and limitations](#compatibility-and-limitations)
- [Resources](#resources)
- [Version history](#version-history)

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and install the package `n8n-nodes-artsoft`.

For a self-hosted instance you can also install it from the command line in your n8n user folder:

```bash
npm install n8n-nodes-artsoft
```

## Prerequisites

- An ARTSOFT installation with the XML connector reachable from n8n (host, port and protocol).
- Permission to approve a new device in ARTSOFT. Each credential registers itself as a device (see [Credentials](#credentials)).

## Credentials

Create an **ARTSOFT API** credential with:

| Field | Description |
|---|---|
| Host IP | Address of the ARTSOFT connector, e.g. `192.168.1.50` |
| Port | Connector port (default `8080`) |
| Protocol | `HTTP` or `HTTPS` |
| Reject Invalid Certificates | HTTPS only. Disable only for self-signed certificates in development |
| Contact | Contact (e.g. an email address) stored with the device registration in ARTSOFT |
| Device Name | Name of the device registered in ARTSOFT (default `n8n`). Use a different name for each credential so the devices can be told apart |

There is no username or password. Authentication works per **device**:

1. The first time a **workflow runs** with the credential, the node registers a new device in ARTSOFT (`AppRegister`). ARTSOFT returns an API key and secret **only once**; n8n stores them encrypted in the credential. The credential test only checks that the connector answers at the given host, port and protocol.
2. The device stays *pending* until someone **approves it in ARTSOFT**. Until then requests fail with a message asking for the approval. Run the workflow again after approving. It can take a few minutes for the approval to take effect.
3. For every session the node logs in with a signed request and sends the returned access token as a bearer token. The token is renewed automatically.

Things to know:

- Use **one credential per ARTSOFT environment**. Each credential is one device.
- If the stored secret is lost (for example the credential was deleted), ARTSOFT will not issue it again. Delete the device in ARTSOFT (back office or MobileManager) and create a new credential.

## Operations

| Resource | Operations |
|---|---|
| **Customer** | Create, Get, Update, Delete |
| **Supplier** | Create, Get, Update, Delete |
| **Product** | Create, Get, Update, Delete |
| **Document** | Create, Get, Sign, Delete |
| **Workflow** | Get Many, Get, Create, Update, Delete |
| **CRM Event** | Get Many, Get, Create, Update, Add Message, Delete |

Main fields per resource:

- **Customer / Supplier:** name, tax ID (NIF), email, phone, notes and address (street, city, postal code). *Get* and *Delete* use the customer or supplier number.
- **Product:** code (`Cod.Codigo`), name (`Nome.0`), optional code (e.g. EAN) and notes. *Get* uses the code, *Delete* the internal product ID.
- **Document:** document type (e.g. `V010`), entity type (customer or supplier), entity ID, notes and a list of lines (code, quantity, gross unit value). *Sign* and *Delete* use the full document ID in `TpDoc/NrDoc` format (e.g. `V010/2429`); *Delete* accepts an optional cancellation reason.
- **Workflow:** workflow type (Leads or Suggestions), user ID, subject, notes, priority and additional (CDU) fields. *Get Many* has **Return All** / **Limit** and a **Filters** collection (sort order, show actions, show additional fields); it returns one item per record.
- **CRM Event:** entity ID and type (customer, supplier or other), event code (`x.yy`), event number, contact, subject, message, qualifiers and filters (status, sort order, hidden details). *Delete* can force deletion of events that already have recorded handling.

Parameter labels show the ARTSOFT field name in parentheses where it helps, for example *Code (Cod.Codigo)*.

On *Create* and *Update* only the required fields are shown by default; the optional ones are in **Additional Fields**, and on *Get Many* / list operations in **Filters**. On *Update*, only the fields you add are changed.

## Example workflow

Create a customer and then a document for it:

1. **ARTSOFT** node: *Customer → Create*, with name, tax ID and email. ARTSOFT answers with the new entity (for example `<Entity rc="0" ID="26837"/>`, returned as `Entity.@_ID`).
2. **ARTSOFT** node: *Document → Create*, with the document type, entity type *Customer*, the entity ID from step 1 (use an expression) and the document lines.

Enable **Continue On Fail** on any step if you want the workflow to keep going when ARTSOFT rejects an item.

## Response format

ARTSOFT answers in XML. The node converts it to JSON: attributes become keys prefixed with `@_` (for example `@_id`, `@_err`), repeated elements become arrays, numeric and `true`/`false` values are converted to numbers and booleans, and element text is returned in `#text` when the element also has attributes.

If the root element of the response (`message`, `document` or `Entity`) has a non-empty `err` attribute the node fails the item with the ARTSOFT code (or returns it as an error item when *Continue On Fail* is on).

## Compatibility and limitations

- Requires an n8n version that supports community nodes with `n8nNodesApiVersion` 1.
- The node sends one request per input item.
- XML `DOCTYPE` declarations in responses are ignored (custom entities are not expanded).
- Parameter names and option values are stored in saved workflows. Changing them is a breaking change and only happens in a major version (see below).

### Migrating from 3.x to 4.0

Version 4.0 changes the field layout. n8n does **not** convert the stored values, so review the workflows that use the ARTSOFT node and fill the moved fields in again:

| Change | Before (3.x) | Now (4.x) |
|---|---|---|
| Optional fields on *Create* / *Update* (NIF, email, phone, notes, optional code, document notes, cancellation reason, client number of a workflow, force deletion) | Top-level fields | **Additional Fields** collection |
| Display options of *CRM Event → Get Many* and *Workflow → Get Many* | Top-level fields | **Filters** collection |
| *Workflow → Get Many* paging | **Page Size** and **Cursor (Next)** | **Return All** / **Limit** (the node follows the cursor) |
| *Workflow → Get Many* output | One item with the whole response | One item per workflow record |
| *Product → Update* **Code (Cod.Codigo)** | Optional | Required |

## Resources

- [Source code and issues](https://github.com/ARTSOFT-TI/n8n-node-artsoft)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [ARTSOFT help center and connector documentation](https://help.artsoft.pt/)

## Version history

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE.md)
