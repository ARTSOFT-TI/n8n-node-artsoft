# 2. Instalação

O node chama-se **`n8n-nodes-artsoft`**. Escolha o cenário que corresponde à sua instalação do n8n.

## Opção A — Pelo ecrã do n8n (recomendado)

1. Entre no n8n com o utilizador **proprietário** ou **administrador**.
2. Abra **Settings** (Definições) e depois **Community nodes**.
3. Clique em **Install**.
4. No campo do nome do pacote escreva: `n8n-nodes-artsoft`
5. Assinale a caixa que confirma que compreende os riscos de instalar nodes da comunidade.
6. Clique em **Install**.

Quando terminar, o node **ARTSOFT** passa a aparecer ao pesquisar nos nodes disponíveis.

> **n8n Cloud:** se o node ainda não estiver na lista de nodes verificados, pode não ser possível instalá-lo na n8n Cloud. Nesse caso, fale com a área informática ou com a ARTSOFT.

## Opção B — Linha de comandos (n8n instalado no servidor)

Esta opção é para quem administra o servidor. Na pasta de dados do n8n (normalmente `~/.n8n`), execute:

```bash
npm install n8n-nodes-artsoft
```

Depois reinicie o n8n.

## Como confirmar que ficou instalado

1. Abra um fluxo novo no n8n.
2. Clique em **+** para adicionar um node.
3. Escreva **ARTSOFT** na pesquisa. Deve surgir o node com o logótipo da ARTSOFT.

## Atualizar

- Em **Settings → Community nodes**, abra o node **n8n-nodes-artsoft** e clique em **Update** quando houver nova versão.
- As atualizações **não estragam os fluxos já criados**: os nomes internos das opções mantêm-se de versão para versão.

## Desinstalar

Em **Settings → Community nodes**, escolha **n8n-nodes-artsoft** e clique em **Uninstall**. Os fluxos que usam o node deixam de funcionar até o reinstalar.
