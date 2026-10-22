# 1. Antes de começar

## O que é o node ARTSOFT

O n8n é uma ferramenta que liga aplicações entre si e executa tarefas automaticamente (por exemplo, "quando chegar um pedido no site, criar o cliente no ARTSOFT"). O **node ARTSOFT** é a peça que permite ao n8n falar com o seu ARTSOFT.

## O que precisa de ter

| Requisito | Detalhe |
|---|---|
| Um n8n em funcionamento | Instalado na sua empresa (*self-hosted*) ou na n8n Cloud |
| Um ARTSOFT acessível a partir do n8n | O n8n tem de conseguir "chegar" ao serviço de ligação do ARTSOFT (o conector). Se o n8n estiver fora da rede da empresa, peça apoio à área informática |
| Os dados do conector | **Endereço** (IP ou nome do servidor), **porta** e se usa **HTTP** ou **HTTPS**. Se não os conhece, peça à pessoa que administra o ARTSOFT |
| Permissão para aprovar dispositivos no ARTSOFT | A primeira ligação tem de ser aprovada no ARTSOFT (ver [capítulo 3](03-configuracao.md)) |
| Permissão para instalar nodes no n8n | Só o proprietário ou administrador do n8n pode instalar |

## Como funciona a segurança

Não existe nome de utilizador nem palavra-passe. O ARTSOFT trata o n8n como um **dispositivo** (como um telemóvel ou um tablet que se liga ao ARTSOFT):

1. O n8n regista-se no ARTSOFT na primeira vez que um fluxo corre.
2. Alguém com permissões **aprova** esse dispositivo no ARTSOFT.
3. A partir daí, a ligação é automática e renova-se sozinha.

## Boas práticas

- **Use uma credencial por ambiente.** Por exemplo, uma para produção e outra para testes. Cada credencial corresponde a um dispositivo no ARTSOFT.
- **Teste primeiro num ambiente de testes**, sobretudo antes de usar as operações **Delete** (apagar).
- **Dê um nome claro a cada dispositivo** (por exemplo, *n8n Produção*), para o reconhecer na lista de dispositivos do ARTSOFT.
