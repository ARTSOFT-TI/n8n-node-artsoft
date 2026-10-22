# 9. Eventos de CRM (CRM Event)

Os eventos de CRM são os registos de contactos e interações (chamadas, reuniões, mensagens…) ligados a um cliente, a um fornecedor ou a outra entidade.

## Campos que se repetem

| Campo | Descrição |
|---|---|
| **Entity ID** | Número da entidade a que o evento pertence. Exemplo: `8000` |
| **Type** | Tipo da entidade: **Customer**, **Supplier** ou **Other** |
| **Event Code** | Código do tipo de evento, no formato `x.yy`. Exemplo: `80.51` |
| **Event Number** | Número único do evento no ARTSOFT |
| **Contact** | Número do contacto associado ao evento. Exemplo: `12` |
| **Subject** | Assunto do evento |
| **Message** | Texto da mensagem |

## Get Many — listar os eventos de uma entidade

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Entity ID** | Sim | Entidade |
| **Type** | Sim | **Customer**, **Supplier** ou **Other** |
| **Event Code** | Sim | Código do tipo de evento (`x.yy`) |
| **Status** | Não | **All** — todos (por omissão); **Pending** — pendentes; **Completed** — concluídos |
| **Sort Order** | Não | **Descending (Newest First)** — mais recentes primeiro (por omissão); **Ascending (Oldest First)** — mais antigos primeiro |
| **Show Hidden Details** | Não | Ligado por omissão: inclui os detalhes escondidos |
| **Include Event Additional Fields** | Não | Ligado por omissão: inclui os campos adicionais do evento |
| **Include Third-Party Additional Fields** | Não | Ligado por omissão: inclui os campos adicionais do cliente/fornecedor |

## Get — consultar um evento

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Entity ID** | Sim | Entidade |
| **Type** | Sim | **Customer**, **Supplier** ou **Other** |
| **Event Code** | Sim | Código do tipo de evento (`x.yy`) |
| **Event Number** | Sim | Evento a consultar |

## Create — criar um evento

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Entity ID** | Sim | Entidade |
| **Type** | Sim | **Customer**, **Supplier** ou **Other** |
| **Event Code** | Sim | Código do tipo de evento (`x.yy`) |
| **Contact** | Sim | Contacto associado |
| **Subject** | Sim | Assunto |
| **Message** | Sim | Mensagem inicial |
| **Qualifiers** | Não | Qualificadores do evento (ver abaixo) |

## Update — alterar um evento

Altera o assunto e a mensagem inicial de um evento.

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Entity ID** | Sim | Entidade |
| **Type** | Sim | **Customer**, **Supplier** ou **Other** |
| **Event Code** | Sim | Código do tipo de evento (`x.yy`) |
| **Event Number** | Sim | Evento a alterar |
| **Contact** | Sim | Contacto associado |
| **Subject** | Sim | Novo assunto |
| **Message** | Sim | Nova mensagem |
| **Qualifiers** | Não | Qualificadores (ver abaixo) |

## Add Message — acrescentar uma mensagem

Acrescenta uma mensagem nova a um evento que já existe.

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Event Number** | Sim | Evento ao qual acrescentar |
| **Contact** | Sim | Contacto que escreve a mensagem |
| **Message** | Sim | Texto da mensagem |

## Delete — apagar um evento

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Event Number** | Sim | Evento a apagar |
| **Force Deletion** | Não | Desligado por omissão. Se ligar, o evento é apagado **mesmo que já tenha tratamento registado** |

> **Atenção:** só ligue **Force Deletion** se tiver a certeza. Perde-se o histórico desse evento.

## Qualificadores (**Qualifiers**)

Os qualificadores classificam o evento, conforme a configuração do seu ARTSOFT.

1. Clique em **Add Qualifier**.
2. Em **Key**, escreva o identificador do qualificador, por exemplo `q1` ou `q5`.
3. Em **Value**, escreva o valor, por exemplo `1.2`.
4. Repita para cada qualificador.

Se não souber que qualificadores usar, consulte quem configura o CRM no ARTSOFT.
