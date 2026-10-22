# 11. Exemplos práticos

## Exemplo 1 — Criar um cliente e emitir-lhe um documento

**Objetivo:** a partir de um pedido recebido, criar o cliente no ARTSOFT e criar um documento para ele.

### Passo 1 — Criar o cliente

1. Adicione um node **ARTSOFT**.
2. **Recurso:** **Customer**. **Operação:** **Create**.
3. Preencha **Name**, **NIF** e **Email** (pode usar valores do passo anterior com **Expression**).
4. Execute o passo. Na resposta, repare em `Entity` → `@_ID`: é o número do novo cliente.

### Passo 2 — Criar o documento

1. Adicione outro node **ARTSOFT** a seguir ao primeiro.
2. **Recurso:** **Document**. **Operação:** **Create**.
3. **Document Type (docID):** o tipo que usa, por exemplo `V010`.
4. **Entity Type:** **Customer**.
5. **Entity ID:** arraste o valor `Entity` → `@_ID` do passo anterior (com **Expression**).
6. Em **Document Items**, clique em **Add Item** e preencha **Code (Cod.Codigo)**, **Quantity (Qtd.Real)** e **Gross Unit Value (Val.UnBru)**.
7. Execute.

> **Atenção ao número:** confirme, num teste, se o valor `@_ID` é o número que o documento espera como **Entity ID**. Se não for, consulte o cliente com **Customer → Get** e use o número do cliente que ali aparece.

## Exemplo 2 — Criar clientes a partir de uma folha de cálculo

1. Adicione um node que leia a folha (por exemplo, **Google Sheets** ou **Microsoft Excel**), com uma linha por cliente.
2. Ligue-lhe o node **ARTSOFT** com **Customer → Create**.
3. Preencha **Name**, **NIF**, **Email** e restantes campos com as colunas da folha, usando **Expression**.
4. Ligue **Continue On Fail** nas definições do node, para que uma linha com problema não impeça as restantes.

O node corre uma vez por cada linha.

## Exemplo 3 — Registar uma interação de CRM

**Objetivo:** guardar no ARTSOFT, como evento, uma mensagem recebida por email.

1. Node de entrada (por exemplo, **Email Trigger**).
2. Node **ARTSOFT**: **CRM Event → Create**.
3. **Entity ID** e **Type:** o cliente a quem a mensagem diz respeito.
4. **Event Code:** o código do tipo de evento, por exemplo `80.51`.
5. **Contact**, **Subject** e **Message:** preencha com o contacto e com o assunto e corpo do email.

Se a conversa continuar, use **CRM Event → Add Message** com o **Event Number** do evento já criado.

## Exemplo 4 — Obter todos os leads de um utilizador

1. Node **ARTSOFT**: **Workflow → Get Many**.
2. **Workflow Type:** **Leads**. **User ID:** o número do utilizador.
3. **Page Size:** por exemplo `50`. **Sort Order:** **Descending (Newest First)**.
4. Execute. Para obter mais páginas, repita com o **Cursor (Next)** indicado na resposta anterior.

## Lista de verificação antes de pôr um fluxo em produção

- [ ] Testei o fluxo com dados de teste, num ARTSOFT de testes.
- [ ] A credencial usada é a do ambiente certo.
- [ ] Nas operações **Delete**, confirmei duas vezes o número a apagar.
- [ ] Ativei **Continue On Fail** apenas onde faz sentido.
- [ ] O fluxo está **Active** (ativo) no n8n.
