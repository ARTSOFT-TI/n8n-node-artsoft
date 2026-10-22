# 7. Documentos (Document)

## Create — criar um documento

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Document Type (docID)** | Sim | Tipo de documento, tal como está configurado no ARTSOFT. Exemplo: `V010` |
| **Entity Type** | Sim | **Customer** (cliente) ou **Supplier** (fornecedor) |
| **Entity ID** | Sim | Número do cliente ou fornecedor. Exemplo: `1000` |
| **Notes (Doc.Obs)** | Não | Observações do cabeçalho do documento |
| **Document Items** | Sim | As linhas do documento (ver abaixo) |

### Linhas do documento (**Document Items**)

Clique em **Add Item** para cada linha. Cada linha tem:

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Code (Cod.Codigo)** | Sim | Código do artigo |
| **Quantity (Qtd.Real)** | Sim | Quantidade. Vem preenchido com `1` |
| **Gross Unit Value (Val.UnBru)** | Sim | Valor unitário bruto. Vem preenchido com `0` |

> **Dica:** pode adicionar quantas linhas precisar. Se o seu documento tem 3 artigos, clique em **Add Item** três vezes.

## Get — consultar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Document Type (TpDoc)** | Sim | Tipo de documento. Exemplo: `V010` |
| **Document Number (NrDoc)** | Sim | Número do documento. Exemplo: `2429` |

**Resultado:** devolve os dados das linhas do documento (código e quantidade, entre outros).

## Sign — assinar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Document ID (docID)** | Sim | Identificação completa do documento no formato `TIPO/NÚMERO`. Exemplo: `V010/1365163400` |

## Delete — apagar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Document ID (docID)** | Sim | Identificação completa no formato `TIPO/NÚMERO`. Exemplo: `V010/2429` |
| **Cancellation Reason (MotDel)** | Não | Número do motivo de anulação, conforme configurado no ARTSOFT. Deixe `0` se não for necessário |

> **Atenção:** pode haver regras legais e de certificação que impedem apagar documentos assinados. O ARTSOFT aplica essas regras e pode recusar o pedido.

## Como escrever a identificação completa de um documento

A identificação completa junta o **tipo** e o **número** com uma barra:

| Tipo | Número | Identificação completa |
|---|---|---|
| `V010` | `2429` | `V010/2429` |
