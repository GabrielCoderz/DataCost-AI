# Tutorial para subir o projeto DataCost-AI

## 1. Subindo o backend (API)

```sh
cd api
# Instale as dependências
npm install

# Execute as migrations do Prisma para criar as tabelas no banco
npx prisma migrate deploy

# Suba o banco de dados PostgreSQL com Docker
docker-compose up -d

# Inicie o servidor backend em modo desenvolvimento
npm run dev
```

## 2. Subindo o frontend (App Angular)

```sh
cd app
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento Angular
ng serve -o
```

## Observações

- Certifique-se de que o Docker está instalado para subir o PostgreSQL.
- O backend ficará disponível normalmente em `http://localhost:3000` (ou porta configurada).
- O frontend estará em `http://localhost:4200`.
