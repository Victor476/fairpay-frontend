
# FairPay Frontend

## Visão Geral

FairPay Frontend é uma aplicação web desenvolvida com Next.js que proporciona interface intuitiva para gerenciar despesas compartilhadas entre grupos de pessoas. A aplicação se integra com o backend Spring Boot para fornecer uma experiência completa de gerenciamento de finanças compartilhadas.

## Tecnologias

- **Next.js 14+**: Framework React com renderização híbrida
- **TypeScript**: Tipagem estática para desenvolvimento robusto
- **TailwindCSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP para comunicação com API
- **JWT**: Autenticação baseada em tokens
- **React Hook Form**: Gerenciamento de formulários
- **Zustand**: Gerenciamento de estado global

## Funcionalidades da Interface

- **Autenticação**
  - Login e registro de usuários
  - Recuperação de senha
  - Autenticação persistente

- **Dashboard**
  - Visão geral de dívidas e créditos
  - Resumo de atividades recentes
  - Estatísticas e gráficos

- **Gerenciamento de Grupos**
  - Criação e edição de grupos
  - Convite de membros via link
  - Visualização de membros

- **Despesas**
  - Adição de novas despesas
  - Divisão personalizada
  - Filtros e categorização

- **Pagamentos**
  - Registro de pagamentos
  - Histórico de transações
  - Confirmação de recebimentos

- **Balanços**
  - Visualização de dívidas otimizadas
  - Histórico de transações
  - Relatórios exportáveis

## Configuração Local

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend configurado e em execução

### Executando Localmente

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/fairpay.git
   cd fairpay/fairpay-frontend
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente
   ```bash
   cp .env.example .env.local
   ```

   Edite `.env.local` e defina:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8090/api
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. A aplicação estará disponível em `http://localhost:3000`

## Configuração Docker

A aplicação pode ser executada usando Docker. Consulte o README principal na raiz do projeto para instruções detalhadas sobre Docker.

## Estrutura de Arquivos

```
fairpay-frontend/
├── public/           # Arquivos estáticos
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── contexts/     # Context API para gerenciamento de estado
│   ├── hooks/        # React hooks personalizados
│   ├── lib/          # Funções utilitárias e configurações
│   ├── pages/        # Rotas e páginas da aplicação
│   ├── services/     # Serviços para comunicação com API
│   ├── styles/       # Estilos globais e configuração do TailwindCSS
│   └── types/        # Definições de tipos TypeScript
└── ...               # Arquivos de configuração
```

## Desenvolvimento

### Convenções de Código

- Componentes funcionais com TypeScript
- Hooks para lógica reutilizável
- Componentes atômicos para interface
- Padrão de página e layout

### Responsividade

A aplicação foi desenvolvida seguindo o princípio mobile-first, garantindo uma experiência consistente em dispositivos móveis e desktop.

### Internacionalização

Suporte para múltiplos idiomas utilizando o framework i18n (quando aplicável).

## Integração com Backend

O frontend se comunica com o backend Spring Boot através de endpoints RESTful, com autenticação JWT e refresh tokens para manter a sessão do usuário.

## Contribuições

Contribuições são bem-vindas! Por favor, siga os padrões de código e adicione testes para novas funcionalidades.

## Licença

Este projeto está licenciado sob a Licença MIT.
EOF

