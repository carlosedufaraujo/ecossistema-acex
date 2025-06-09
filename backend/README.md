# Backend do Ecossistema Acex

Este diretório contém o backend da aplicação Ecossistema Acex, construído com NestJS e Prisma.

## Estrutura
backend/
├── src/                  # Código fonte
│   ├── modules/          # Módulos da aplicação
│   │   ├── auth/         # Autenticação
│   │   ├── usuarios/     # Usuários
│   │   ├── financeiro/   # Módulo financeiro
│   │   ├── ceac/         # Módulo CEAC
│   │   └── b3x/          # Módulo B3X Hub
│   ├── common/           # Recursos compartilhados
│   └── config/           # Configurações
├── prisma/               # Esquema do banco de dados
│   ├── schema.prisma     # Definição das tabelas
│   └── seed.ts           # Script de seed
└── package.json          # Dependências e scripts
## Configuração

1. Instale as dependências:
```bash
npm install
