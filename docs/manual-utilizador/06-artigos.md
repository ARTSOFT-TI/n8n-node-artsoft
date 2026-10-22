# 6. Artigos (Product)

## Create — criar um artigo

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Code (Cod.Codigo)** | Sim | Código do artigo |
| **Name (Nome.0)** | Sim | Descrição principal do artigo |
| **Optional Code (Cod.Opcional)** | Não | Código opcional, por exemplo o código de barras (EAN) |
| **Notes (Div.Obs)** | Não | Observações |

## Get — consultar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Code (Cod.Codigo)** | Sim | Código do artigo a procurar |

**Resultado:** devolve o código, o código opcional, o nome e as observações.

## Update — alterar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Code (Cod.Codigo)** | Não | Código do artigo |
| **Name (Nome.0)** | Não | Nova descrição |
| **Optional Code (Cod.Opcional)** | Não | Novo código opcional |
| **Notes (Div.Obs)** | Não | Novas observações |

Só são enviados os campos preenchidos.

> **Teste antes de usar:** nesta operação o node não pede o número interno do artigo; identifica-o através do **Code (Cod.Codigo)**. Confirme num artigo de teste, antes de a usar em produção, que o ARTSOFT altera o artigo esperado.

## Delete — apagar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Product ID** | Sim | **Número interno** do artigo no ARTSOFT (não é o código) |

> **Atenção:** o número interno é diferente do código do artigo. Pode consultá-lo no ARTSOFT, ou na resposta da operação **Create**, quando o ARTSOFT a devolve. Guarde-o se pretender apagar mais tarde. Apagar é definitivo.
