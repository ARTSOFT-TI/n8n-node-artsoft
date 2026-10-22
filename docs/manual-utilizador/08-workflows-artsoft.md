# 8. Workflows do ARTSOFT (Workflow)

> **Não confundir:** aqui, "Workflow" refere-se aos **fluxos de trabalho do ARTSOFT** (por exemplo, oportunidades comerciais e sugestões), e não aos fluxos automáticos do n8n.

## Tipos de workflow (**Workflow Type**)

| Opção | Descrição |
|---|---|
| **Leads** | Oportunidades comerciais |
| **Suggestions** | Sugestões |

## Campos que se repetem

| Campo | Descrição |
|---|---|
| **User ID** | Número do utilizador do ARTSOFT em nome de quem a operação é feita. Obrigatório em todas as operações deste recurso |
| **Workflow ID** | Número do registo do workflow no ARTSOFT |

## Get Many — listar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Workflow Type** | Sim | **Leads** ou **Suggestions** |
| **User ID** | Sim | Utilizador do ARTSOFT |
| **Page Size** | Não | Quantos registos por página. Vem preenchido com `20` |
| **Cursor (Next)** | Não | Ponto de partida da página. Use `0` para a primeira página. Para as páginas seguintes, use o valor indicado na resposta anterior |
| **Sort Order** | Não | **Descending (Newest First)** — mais recentes primeiro (por omissão); **Ascending (Oldest First)** — mais antigos primeiro |
| **Show Actions** | Não | Ligado: inclui as ações de cada registo. Por omissão, desligado |
| **Show Additional Fields** | Não | Ligado: inclui os campos adicionais (os campos configurados por si no ARTSOFT). Por omissão, desligado |

## Get — consultar um

| Campo | Obrigatório | Descrição |
|---|---|---|
| **User ID** | Sim | Utilizador do ARTSOFT |
| **Workflow ID** | Sim | Registo a consultar |

A resposta inclui sempre as ações e os campos adicionais do registo.

## Create — criar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Workflow Type** | Sim | **Leads** ou **Suggestions** |
| **User ID** | Sim | Utilizador do ARTSOFT |
| **Customer Number** | Não | Número do cliente a associar |
| **Subject** | Sim | Assunto / descrição do workflow |
| **Priority Name or ID** | Sim | Prioridade. Escolha na lista, que é carregada do seu ARTSOFT |
| **Additional Fields** | Não | Campos adicionais (ver abaixo) |

## Update — alterar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Workflow Type** | Sim | **Leads** ou **Suggestions**. Serve para mostrar os campos adicionais certos |
| **User ID** | Sim | Utilizador do ARTSOFT |
| **Workflow ID** | Sim | Registo a alterar |
| **Subject** | Sim | Novo assunto |
| **Notes** | Sim | Notas |
| **Priority Name or ID** | Sim | Prioridade, escolhida na lista |
| **Additional Fields** | Não | Campos adicionais (ver abaixo) |

> Nesta operação, o assunto, as notas e a prioridade são sempre enviados. Preencha-os com os valores que quer manter ou alterar.

## Delete — apagar

| Campo | Obrigatório | Descrição |
|---|---|---|
| **User ID** | Sim | Utilizador do ARTSOFT |
| **Workflow ID** | Sim | Registo a apagar |

## Campos adicionais (**Additional Fields**)

São campos que a sua empresa criou no ARTSOFT para além dos habituais.

1. Clique em **Add additional field**.
2. Em **Field Name or ID**, escolha o campo na lista. A lista depende do **Workflow Type** escolhido (**Leads** ou **Suggestions**).
3. Em **Value**, escreva o valor.
4. Repita para cada campo.

Campos com o valor vazio são ignorados.

## A lista de prioridades ou de campos aparece vazia

| Causa provável | O que fazer |
|---|---|
| A credencial ainda não está aprovada no ARTSOFT | Conclua o [capítulo 3](03-configuracao.md) |
| Não há prioridades ou campos adicionais configurados | Configure-os no ARTSOFT |
| Não escolheu o **Workflow Type** | Escolha primeiro o tipo de workflow |

Em alternativa, pode escrever o número da prioridade através de uma **Expression**.
