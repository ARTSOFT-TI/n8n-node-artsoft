# 4. Utilizar o node

## A ideia geral

Em qualquer operação, escolhe sempre **duas coisas** no topo do node:

1. **Recurso** — *sobre o quê* quer trabalhar.
2. **Operação** — *o que* quer fazer.

Depois, o node mostra apenas os campos que fazem sentido para essa combinação.

### Recursos disponíveis

| Recurso (no ecrã) | O que é | Operações |
|---|---|---|
| **Customer** | Clientes | Create, Get, Update, Delete |
| **Supplier** | Fornecedores | Create, Get, Update, Delete |
| **Product** | Artigos | Create, Get, Update, Delete |
| **Document** | Documentos (faturas, guias, etc.) | Create, Get, Sign, Delete |
| **Workflow** | Fluxos de trabalho do ARTSOFT (Leads e Sugestões) | Get Many, Get, Create, Update, Delete |
| **CRM Event** | Eventos de CRM | Get Many, Get, Create, Update, Add Message, Delete |

### O que significa cada operação

| Operação | Significado |
|---|---|
| **Create** | Cria um registo novo |
| **Get** | Obtém **um** registo |
| **Get Many** | Obtém uma **lista** de registos |
| **Update** | Altera um registo que já existe |
| **Delete** | Apaga um registo |
| **Sign** | Assina um documento |
| **Add Message** | Acrescenta uma mensagem a um evento que já existe |

## Passo a passo

1. Adicione o node **ARTSOFT** ao fluxo.
2. Escolha a **credencial** (ver [capítulo 3](03-configuracao.md)).
3. Escolha o **Recurso** e a **Operação**.
4. Preencha os campos. Os que têm um asterisco vermelho (`*`) são obrigatórios.
5. Clique em **Execute step** para testar só este passo.
6. Veja o resultado no painel da direita (ver [capítulo 10](10-resultados-e-erros.md)).

## Usar dados vindos de passos anteriores

Em vez de escrever um valor fixo, pode usar um valor que veio de um passo anterior. Por exemplo, o email recebido num formulário.

1. Passe o rato sobre o campo e escolha **Expression** (Expressão).
2. Arraste o valor desejado do painel da esquerda para dentro do campo.

Isto é muito útil, por exemplo, para usar o número do cliente acabado de criar ao criar um documento (ver [capítulo 11](11-exemplos.md)).

## Vários itens de uma só vez

Se o passo anterior entregar **vários itens** (por exemplo, 10 linhas de uma folha de cálculo), o node ARTSOFT corre **uma vez por cada item**. Ou seja, são feitos 10 pedidos ao ARTSOFT, um de cada vez.

## Quando algo corre mal num item

Por omissão, se o ARTSOFT recusar um item, o fluxo **para** e mostra o erro.

Se preferir que o fluxo **continue** com os restantes itens, abra **Settings** (no topo do node) e ligue **Continue On Fail**. Os itens com problema ficam com uma mensagem de erro em vez de resultado.

## Regras de preenchimento que se repetem

- **Campos vazios em "Update":** em todas as operações **Update** de clientes, fornecedores e artigos, só são alterados os campos que **preencher**. O que deixar vazio **não é apagado**: mantém-se como está.
- **Números de cliente/fornecedor:** são os números que vê no ARTSOFT.
- **Texto:** escreva normalmente, incluindo acentos.
