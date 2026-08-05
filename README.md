# Remix of Lead Compass

Título: Central de Qualificação de Leads — MySide (formato helpdesk)

Contexto: Ferramenta de uso pessoal para um SDR de pré-vendas imobiliárias (MySide), pra qualificar leads durante ligações/atendimentos e depois gerar um resumo pronto pra colar no CRM (HubSpot/MyLo) ou repassar ao Personal Shopper.

Formato: Página web única, estilo helpdesk/sistema de tickets — dois painéis lado a lado.

Painel esquerdo — Fila de leads:

Busca por nome

Botão "+ Novo lead"

Lista de leads salvos, cada card exibindo: nome, tag de objetivo (Moradia/Investimento), etapa atual, data da última atualização

Clique no card abre a ficha completa no painel principal

Ordenados por atualização mais recente

Painel principal — Ficha de qualificação do lead selecionado:

Campo "Etapa" no topo (dropdown editável): Novo / Qualificando / Aguardando retorno / Call marcada / Perdido / Convertido

Campos de qualificação:

Nome do lead (texto)

Objetivo: Moradia / Investimento (seleção única) → se Investimento: Locação tradicional / Airbnb-temporada / Revenda-valorização (múltipla seleção)

Tipologia: Studio, 1, 2, 3, 4+ quartos (múltipla seleção) + Suíte essencial: Sim/Não/Indiferente

Estágio: Pronto / Na planta (seleção única) → se Na planta: Até 1 ano / Até 2 anos / Até 3 anos / Sem preferência

Metragem mínima e máxima (dois campos numéricos)

Valor mínimo e máximo (dois campos numéricos) + Valor total ou Valor de entrada (seleção única)

Pagamento: Financiamento bancário / Direto com construtora / Sem preferência → se Financiamento: Renda bruta familiar (texto livre)

Região: busca + os 16 bairros de SP com região ao lado (múltipla seleção) + campo "outro bairro" (texto livre)

Central: Jardim Paulista, Bela Vista, Consolação, Liberdade

Zona Sul: Vila Mariana, Moema, Saúde, Campo Belo

Zona Oeste: Pinheiros, Itaim Bibi, Alto de Pinheiros, Vila Leopoldina, Perdizes, Lapa, Butantã, Morumbi

Preferências/comodidades: Piscina, Varanda, Garagem (com campo de quantidade), Academia, Salão de festas, Portaria 24h, Espaço pet, Coworking, Playground + "outra preferência" (texto livre)

Reside no Brasil: Sim/Não → se Não: país/fuso horário (texto livre)

Idioma do atendimento: PT / EN / ES

Observações (texto livre)

Ações:

"Copiar resumo" — gera texto formatado em português com os campos preenchidos (omite os vazios) e copia pra área de transferência

"Excluir lead" — remove da fila, com confirmação

Autosave a cada alteração

Comportamento geral:

Não é wizard — todos os campos visíveis, preenchimento em qualquer ordem

Estado de cada lead persiste entre sessões

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2a71ffd7-4252-4df2-bfa0-b363335f653c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
