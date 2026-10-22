# 10. Resultados e mensagens de erro

## Como é apresentado o resultado

O ARTSOFT responde num formato próprio (XML). O node converte-o automaticamente para uma lista de campos que o n8n entende, e que pode usar nos passos seguintes.

Regras de leitura:

| No resultado | Significa |
|---|---|
| Nomes que começam por `@_` (por exemplo `@_ID`, `@_err`) | São propriedades do registo |
| Uma lista de vários elementos | Foram devolvidos vários registos |
| Números e `true`/`false` | Já vêm como números e valores verdadeiro/falso |
| `#text` | O texto do elemento, quando este também tem propriedades |

Exemplo: ao criar um cliente, o ARTSOFT responde algo como `Entity` com `@_rc` = `0` e `@_ID` = `26837`. O número `26837` é o número interno do cliente criado.

## Quando o ARTSOFT recusa um pedido

Se a resposta trouxer um código de erro, o node mostra:

> **ARTSOFT rejected the request (code …)**

Isto quer dizer que o ARTSOFT recebeu o pedido mas **não o aceitou**. Confirme os valores enviados e tente novamente. O código ajuda a equipa ARTSOFT a perceber a razão.

## Problemas frequentes

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Mensagem a pedir para aprovar o dispositivo | Dispositivo novo, ainda pendente | Aprove-o no ARTSOFT e volte a executar. Pode demorar alguns minutos ([capítulo 3](03-configuracao.md)) |
| O teste da credencial falha | Endereço, porta ou protocolo errados, ou o ARTSOFT não é acessível a partir do n8n | Confirme os dados com a área informática; verifique firewall e rede |
| O teste da credencial passa, mas o fluxo falha | Dispositivo ainda não aprovado | Aprove o dispositivo no ARTSOFT |
| Erro com certificados (HTTPS) | Certificado autoassinado ou inválido | Em testes, desligue **Reject Invalid Certificates**. Em produção, instale um certificado válido |
| "ARTSOFT did not return an API key for this device" | O dispositivo já tinha sido registado antes e o ARTSOFT não volta a dar as chaves | Apague o dispositivo no ARTSOFT e execute de novo |
| Deixou de funcionar depois de apagar e recriar a credencial | O ARTSOFT guarda o dispositivo antigo | Apague o dispositivo antigo no ARTSOFT |
| **ARTSOFT rejected the request (code …)** | Valores inválidos, registo que não existe, ou regra do ARTSOFT que impede a operação | Verifique números, códigos e campos obrigatórios |
| As listas de prioridades ou de campos adicionais aparecem vazias | Sem ligação ou sem dados configurados | Ver [capítulo 8](08-workflows-artsoft.md) |
| O fluxo pára no primeiro erro | Comportamento normal | Ligue **Continue On Fail** nas definições do node para continuar |

## Apoio

- Código-fonte e pedidos de ajuda: https://github.com/ARTSOFT-TI/n8n-node-artsoft
- Centro de ajuda ARTSOFT: https://help.artsoft.pt/
- Contacto da equipa de programação: programacao@artsoft.pt

Ao pedir ajuda, indique: o **recurso** e a **operação** usados, a **mensagem de erro** completa e a **hora** aproximada. **Não envie** chaves, palavras-passe nem dados pessoais de clientes.
