# 5. Clientes e fornecedores

Os recursos **Customer** (clientes) e **Supplier** (fornecedores) funcionam exatamente da mesma forma. Só mudam os nomes. As tabelas indicam o campo de cada um.

## Create — criar um cliente ou fornecedor

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Name** | Sim | Nome do cliente ou fornecedor |
| **NIF** | Não | Número de contribuinte |
| **Email** | Não | Endereço de email |
| **Phone** | Não | Telefone |
| **Notes** | Não | Observações |
| **Address** | Não | Clique em **Add address** e escolha o que quer indicar (ver abaixo) |

### Morada (**Address**)

| Campo | Descrição |
|---|---|
| **Street (Ter.Morada)** | Rua e número |
| **City (Ter.Localid)** | Localidade |
| **Postal Code (Ter.CPPais)** | Código postal |

**Resultado:** o ARTSOFT devolve o registo criado. O número interno do novo registo aparece em **`Entity` → `@_ID`**. Guarde-o se precisar dele nos passos seguintes (por exemplo, para criar um documento).

## Get — consultar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Customer Number** (clientes) / **Supplier Number** (fornecedores) | Sim | Número do cliente ou fornecedor no ARTSOFT |

**Resultado:** devolve o número, o nome e as observações do registo.

## Update — alterar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Customer Number** / **Supplier Number** | Sim | Número do registo a alterar |
| **Name**, **NIF**, **Email**, **Phone**, **Notes** | Não | Novos valores |
| **Address** | Não | Nova rua, localidade e/ou código postal |

Só são alterados os campos preenchidos.

## Delete — apagar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Customer Number** / **Supplier Number** | Sim | Número do registo a apagar |

> **Atenção:** apagar é definitivo. O ARTSOFT pode recusar apagar registos que já tenham movimentos (por exemplo, documentos). Nesse caso receberá uma mensagem de recusa.
