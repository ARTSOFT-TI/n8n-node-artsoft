import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import {
	executeCreateClient,
	executeDeleteClient,
	executeGetClient,
	executeUpdateClient,
} from './customer';
import {
	executeCreateSupplier,
	executeDeleteSupplier,
	executeGetSupplier,
	executeUpdateSupplier,
} from './fornecedor';
import {
	executeCreateProduct,
	executeDeleteProduct,
	executeGetProduct,
	executeUpdateProduct,
} from './produtos';
import {
	executeCreateDocument,
	executeDeleteDocument,
	executeGetDocument,
	executeSignDocument,
} from './documentos';
import {
	executeGetWorkflows,
	executeGetWorkflow,
	executeCreateWorkflow,
	executeUpdateWorkflow,
	executeWorkflowAction,
} from './workflow';
import {
	executeListEvents,
	executeGetEvent,
	executeCreateEvent,
	executeUpdateEvent,
	executeAddMessage,
	executeDeleteEvent,
} from './event';

export class ArtResolver {
	private context: IExecuteFunctions;
	constructor(_rootctx: IExecuteFunctions) {
		this.context = _rootctx;
	}

	async resolve(op: string, i: number): Promise<Record<string, unknown> | IDataObject[]> {
		switch (op) {
			// CUSTOMER
			case 'createClient':
				return await executeCreateClient.call(this.context, i);
			case 'getClient':
				return await executeGetClient.call(this.context, i);
			case 'updateClient':
				return await executeUpdateClient.call(this.context, i);
			case 'deleteClient':
				return await executeDeleteClient.call(this.context, i);

			// SUPPLIERS
			case 'createSupplier':
				return await executeCreateSupplier.call(this.context, i);
			case 'getSupplier':
				return await executeGetSupplier.call(this.context, i);
			case 'updateSupplier':
				return await executeUpdateSupplier.call(this.context, i);
			case 'deleteSupplier':
				return await executeDeleteSupplier.call(this.context, i);

			// PRODUTOS
			case 'createProduct':
				return await executeCreateProduct.call(this.context, i);
			case 'getProduct':
				return await executeGetProduct.call(this.context, i);
			case 'updateProduct':
				return await executeUpdateProduct.call(this.context, i);
			case 'deleteProduct':
				return await executeDeleteProduct.call(this.context, i);

			// DOCUMENTS
			case 'createDocument':
				return await executeCreateDocument.call(this.context, i);
			case 'getDocument':
				return await executeGetDocument.call(this.context, i);
			case 'signDocument':
				return await executeSignDocument.call(this.context, i);
			case 'deleteDocument':
				return await executeDeleteDocument.call(this.context, i);

			// WORKFLOW
			case 'getWorkflows':
				return await executeGetWorkflows.call(this.context, i);
			case 'getWorkflow':
				return await executeGetWorkflow.call(this.context, i);
			case 'createWorkflow':
				return await executeCreateWorkflow.call(this.context, i);
			case 'updateWorkflow':
				return await executeUpdateWorkflow.call(this.context, i);
			case 'executeWorkflowAction':
				return await executeWorkflowAction.call(this.context, i);

			// EVENT (CRM)
			case 'listEvents':
				return await executeListEvents.call(this.context, i);
			case 'getEvent':
				return await executeGetEvent.call(this.context, i);
			case 'createEvent':
				return await executeCreateEvent.call(this.context, i);
			case 'updateEvent':
				return await executeUpdateEvent.call(this.context, i);
			case 'addMessage':
				return await executeAddMessage.call(this.context, i);
			case 'deleteEvent':
				return await executeDeleteEvent.call(this.context, i);

			default:
				throw new NodeOperationError(this.context.getNode(), `Unknown operation: ${op}`, {
					itemIndex: i,
				});
		}
	}
}
