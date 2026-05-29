# Competências do Líder ADEO - Dashboard de Realização

Este é um dashboard corporativo de alto desempenho, desenvolvido em **React 19**, **Vite** e **Tailwind CSS v4**, otimizado para acompanhar a realização de capacitações de líderes do grupo **ADEO (Leroy Merlin)**.

A aplicação foi planejada para funcionar de forma **100% estática (SPA)**, sem necessidade de banco de dados ou servidores dedicados (backend). Isso a torna segura, extremamente veloz e **pronta para deploy gratuito na plataforma Netlify**, com custo zero de infraestrutura.

---

## 📁 Estrutura de Pastas do Projeto

O projeto está organizado nos seguintes diretórios principais:

```text
├── public/                 # Arquivos estáticos servidos no navegador
│   └── data/
│       └── base_elegiveis.json  # 📂 ARQUIVO FONTE PRINCIPAL DO DASHBOARD (Substitua este arquivo)
├── src/                    # Código-fonte do sistema
│   ├── components/         # Módulos visuais (Widgets reutilizáveis)
│   │   ├── Header.tsx            # Título e relógio de sincronização
│   │   ├── Filters.tsx           # Filtros dinâmicos no topo de página
│   │   ├── KPICards.tsx          # Painel de indicadores (Elegíveis, Realizados, %)
│   │   ├── DashboardCharts.tsx   # Gráficos interativos (Recharts) e Leaderboard
│   │   ├── TabelaResumo.tsx      # Tabela consolidada (Regional x Área)
│   │   └── TabelasDetalhadas.tsx # Tabelas de colaboradores com filtros, buscas, paginação e exportação
│   ├── data/
│   │   └── base_elegiveis.ts     # Cópia offline de contingência (Backup)
│   ├── utils/
│   │   └── export.ts             # Motor de exportação de planilhas CSV compatíveis com Excel (BOM UTF-8)
│   ├── App.tsx             # Elemento lógico unificador e roteamento de estados
│   ├── index.css           # Estilos globais e fontes (Inter & Space Grotesk)
│   ├── main.tsx            # Ponto de entrada do React
│   └── types.ts            # Definições de tipos de dados (TypeScript)
├── index.html              # Template base HTML5
├── metadata.json           # Configurações do ecossistema AI Studio
├── package.json            # Bibliotecas instaladas e scripts de execução
├── tscongif.json           # Diretivas do compilador TypeScript
└── vite.config.ts          # Arquivo de configuração de build do Vite
```

---

## 🛠️ Como Executar Localmente

Se você deseja rodar e testar o painel no seu computador pessoal:

1. **Baixe ou clone o repositório** para a sua máquina.
2. Abra a pasta do projeto no terminal e instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
4. No seu navegador, abra o endereço que aparecerá no terminal (normalmente `http://localhost:3000`).

---

## 🚀 Como Fazer Deploy no Netlify (Grátis)

Fazer o deploy da aplicação e deixá-la disponível para qualquer pessoa na internet leva menos de 5 minutos utilizando o **Netlify**:

### Método Recomendado: Conexão com GitHub (Atualização Automática)
1. **Envie o projeto para o seu GitHub**: Crie um repositório no seu perfil e envie os arquivos da pasta para lá.
2. **Crie uma conta no Netlify**: Acesse [netlify.com](https://www.netlify.com) e crie uma conta usando o seu login do GitHub.
3. **Selecione "Add new site" > "Import an existing project"**.
4. Conecte com o seu provedor GitHub e escolha o repositório do Dashboard.
5. O Netlify preencherá as configurações de build automaticamente:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
6. Clique no botão verde **"Deploy site"**.
7. Pronto! O site receberá um endereço temporário (exemplos: `nome-do-site.netlify.app`), que você pode personalizar nas configurações.

---

## 💾 Manual Simples de Atualização da Base (Para Usuário Não Técnico)

A aplicação foi rigorosamente projetada para que a manutenção seja extremamente fácil, sem que você precise tocar em nenhuma linha de código! 

Sempre que um novo ciclo de treinamento ocorrer ou novos colaboradores forem incluídos, siga o passo a passo resumido abaixo:

### Passo 1: Prepare as Informações
As informações devem estar salvas no formato **JSON**, que é o formato padrão do banco de dados do painel. Cada linha do seu colaborador segue o formato exemplar abaixo:

```json
{
  "matricula": "AD-10204",
  "nome": "Alessandro Silva Ramos",
  "status": "Realizado",
  "regional": "Regional SP Capital",
  "diretoria": "Diretoria de Operações",
  "areaRH": "Business Partner SP Capital",
  "cargo": "Gerente Geral de Loja",
  "centroCusto": "CC-1001 - Loja Lar Center"
}
```

*Dica de Excel:* Se você utiliza uma planilha Excel clássica, você pode usar conversores gratuitos online (como o *Excel to JSON Converter*) ou apenas exportar como CSV e usar uma ferramenta visual para deixá-lo no formato correspondente.

### Passo 2: Substitua o Arquivo Fonte
1. Acesse o seu repositório no **GitHub** pelo navegador.
2. Vá até a pasta `public` > `data`.
3. Clique em cima do arquivo `base_elegiveis.json`.
4. Clique no ícone de lápis ✏️ (Editar) no canto superior direito para colar a sua nova lista compilada ou faça upload do arquivo `base_elegiveis.json` substituindo o antigo diretamente pelo site do GitHub clicando em "Upload files".
5. Clique no botão verde **"Commit changes"** (Salvar alterações) na parte inferior.

### Passo 3: Visualização Instantânea
Assim que você salvar o arquivo no GitHub, **o Netlify identificará a mudança sozinho**, compilará o build e atualizará o site na internet em menos de 1 minuto! Quando os usuários acessarem a URL do painel, já verão a base atualizada, indicando o novo relógio de atualização dinâmico no topo direito do Dashboard.

---

## 📊 Regras de Negócio Implementadas

Todas as premissas indicadas nos requisitos corporativos foram rigorosamente mapeadas e integradas ao motor do sistema:
* **Filtros Dinâmicos no Topo**: Regional, Diretoria, Área de Recursos Humanos, Status e Busca Textual por Nome ou Matrícula atuam em cadeia e recalculam instantaneamente todos os gráficos e KPIs.
* **KPIs Reativos**:
  - `Total Elegíveis` = Contagem do total de colaboradores sob o recorte de filtros ativo.
  - `Realizado` = Contagem de elegíveis com status exato "Realizado".
  - `Não Realizado` = Contagem com status "No realizado" ou "Não realizado".
  - `% Realização` = `Realizados` / `Elegíveis`.
  - `% Não Realização` = `Não Realizados` / `Elegíveis`.
* **Módulos Gráficos**: Gráfico de barração de desempenho Regional, distribuição percentual em anel estilo Donut, taxas regionais por áreas em bars e visualização de Ranking Líder (Leaderboard de regionais).
* **Exportação Segura**: Os botões de exportação geram arquivos `.csv` limpos que adicionam um cabeçalho de marcação especial de codificação (UTF-8 com BOM). Isso faz com que caracteres em português (como cedilhas e acentos) abram perfeitamente em qualquer versão do **Microsoft Excel** sem ficarem corrompidos!
