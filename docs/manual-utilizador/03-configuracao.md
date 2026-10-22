# 3. Configurar a ligação ao ARTSOFT

Antes de usar o node, tem de criar uma **credencial** — o conjunto de dados que diz ao n8n onde está o seu ARTSOFT.

## Passo 1 — Criar a credencial

1. Adicione um node **ARTSOFT** a um fluxo.
2. No campo **Credential to connect with**, escolha **Create new credential**.
3. Preencha os campos da tabela abaixo.
4. Clique em **Save**.

### Campos da credencial **ARTSOFT API**

| Campo | Obrigatório | O que escrever |
|---|---|---|
| **Host IP** | Sim | Endereço do servidor do conector ARTSOFT. Exemplo: `192.168.1.50` |
| **Port** | Sim | Porta do conector. Vem preenchida com `8080` |
| **Protocol** | Sim | **HTTP** ou **HTTPS**, conforme o seu conector. Vem preenchido com **HTTP** |
| **Reject Invalid Certificates** | — | Só aparece com **HTTPS**. Deixe **ligado**. Desligue apenas em ambientes de testes com certificado "caseiro" (autoassinado) |
| **Contact** | Sim | Um contacto, por exemplo um email. Fica registado no ARTSOFT junto do dispositivo, para saberem quem o criou. Exemplo: `nome@empresa.pt` |
| **Device Name** | Não | Nome do dispositivo no ARTSOFT. Vem preenchido com `n8n`. Use um nome diferente em cada credencial, por exemplo `n8n Produção` |

Os restantes dados (chaves e códigos de acesso) são guardados automaticamente e **ficam escondidos**. Não precisa de os preencher nem de os conhecer.

### O botão de teste

Ao guardar, o n8n faz um teste. **Este teste só verifica se o ARTSOFT responde** no endereço, porta e protocolo indicados.

- Se o teste passa, o endereço está certo.
- Se o teste passa, isso **não significa** que o dispositivo já esteja aprovado. Isso é o passo 3.

## Passo 2 — Primeira execução (o registo automático)

O registo do dispositivo acontece **quando um fluxo corre pela primeira vez** com esta credencial:

1. Ligue o node ARTSOFT a um **Manual Trigger** e escolha uma operação simples (por exemplo, **Customer → Get**).
2. Clique em **Execute workflow**.
3. O node regista-se no ARTSOFT. É normal que esta primeira execução termine com uma mensagem a pedir a aprovação do dispositivo.

## Passo 3 — Aprovar o dispositivo no ARTSOFT

1. Abra o ARTSOFT com um utilizador que tenha permissão para gerir dispositivos.
2. Procure o dispositivo com o nome que indicou em **Device Name** (por omissão, `n8n`). Estará como **pendente**.
3. **Aprove-o.**
4. Volte ao n8n e execute o fluxo outra vez.

> **Paciência:** depois de aprovar, a ligação pode demorar **alguns minutos** a funcionar. Se continuar a falhar logo a seguir, aguarde e tente de novo.

A partir daqui a ligação fica pronta. O n8n renova sozinho o acesso sempre que necessário.

## Situações a conhecer

| Situação | O que fazer |
|---|---|
| Quero ligar o n8n a **dois ARTSOFT diferentes** (ex.: produção e testes) | Crie **duas credenciais**, com nomes de dispositivo diferentes |
| **Apaguei a credencial** no n8n e preciso de a recriar | O ARTSOFT não entrega as chaves uma segunda vez. Apague primeiro o dispositivo antigo no ARTSOFT e crie a credencial de novo |
| Mudei o **endereço ou a porta** do servidor | Edite os campos da credencial e guarde. Não é preciso registar de novo |
| O ARTSOFT diz que o dispositivo **já existe** | Apague o dispositivo no ARTSOFT e volte a executar o fluxo com uma credencial nova |
| Mudei o **Device Name** numa credencial que já funciona | Não tem efeito no dispositivo já registado. Para mudar o nome, crie uma credencial nova |
