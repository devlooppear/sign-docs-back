# 📄 Plataforma de Assinatura Digital - Desafio Técnico

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-11.x-red?logo=nestjs)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.x-blue?logo=typeorm)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-blue?logo=postgresql)
![Supabase](https://img.shields.io/badge/Supabase-Storage-green?logo=supabase)
![Status](https://img.shields.io/badge/Desafio%20T%C3%A9cnico-100%25%20Backend-brightgreen)

---

## 🚀 Sobre o Projeto

Este projeto é uma API para uma plataforma de assinatura digital de documentos, desenvolvida como desafio técnico. O sistema permite:

- Upload de documentos PDF por administradores
- Assinatura digital visual de documentos por usuários finais
- Armazenamento seguro dos arquivos em bucket Supabase
- Controle de usuários, autenticação JWT e histórico de assinaturas

> **Atenção:** Para testar o upload e assinatura de arquivos, é necessário possuir uma conta no [Supabase](https://supabase.com/), criar um bucket e configurar as credenciais no `.env`.

---

## 🛠️ Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Supabase Storage](https://supabase.com/storage)
- [pdf-lib](https://pdf-lib.js.org/) (assinatura visual)

---

## 🏁 Como Começar

1. **Clone o repositório:**

  ```bash
  git clone <repo-url>
  cd sign-docs-back
  ```

2. **Instale as dependências:**

  ```bash
  yarn install
  # ou npm install
  ```

3. **Configure o ambiente:**

  - Copie o arquivo `.env.example` para `.env`:
    ```bash
    cp .env.example .env
    ```
  - Preencha as variáveis do PostgreSQL e do Supabase (URL, KEY e BUCKET).

4. **Configure o Supabase:**
  - Crie uma conta gratuita em [supabase.com](https://supabase.com/)
  - Crie um projeto e um bucket (ex: `docs-sign`)
  - Copie a URL e a KEY do projeto para o `.env`
  - Dê permissão pública de leitura no bucket para testes

5. **Suba o banco de dados PostgreSQL:**
  - Você pode usar Docker, local ou cloud. O padrão do `.env.example` é para Docker local.

6. **Inicie a API:**

  ```bash
  yarn start:dev
  # ou npm run start:dev
  ```

---

## 📦 Estrutura do Projeto

- `src/` - Código-fonte principal
  - `resources/` - Módulos de domínio (document, user, assin, auth)
  - `common/` - Utilitários, enums, DTOs, constantes

---

# Testes

Para rodar os testes automatizados do projeto, utilize:

```bash
yarn run test
# ou npm run test
```

---

## � Documentação da API

- A documentação interativa da API está disponível em: [`/api-docs`](http://localhost:3000/api-docs) (Swagger UI)
- Explore, teste e visualize todos os endpoints diretamente pelo navegador.

---

## �📝 Funcionalidades

- Cadastro e autenticação de usuários (admin e cliente)
- Upload de documentos PDF
- Assinatura digital visual (campo visual no PDF)
- Histórico de assinaturas
- Armazenamento seguro no Supabase Bucket
- Controle de acesso por JWT

---

## 🧪 Testando o Upload e Assinatura

- Para testar upload/assinatura, configure corretamente o Supabase e o bucket.
- O campo visual da assinatura é gerado automaticamente na página e posição informada pelo frontend.
- O arquivo assinado é salvo com sufixo `_signed` e a URL pública é retornada na resposta.

---

## 💡 Observações

- O upload e download de arquivos depende do Supabase Storage.
- O banco de dados padrão é PostgreSQL, mas pode ser adaptado.

---

## 💡 Possíveis Melhorias 

- Utilizar RabbitMQ ou outra fila/mensageria para processar uploads e assinaturas de PDFs muito grandes ou em alta concorrência, evitando sobrecarga e melhorando a escalabilidade.
- Implementar workers para processamento assíncrono de PDFs.

---

## 👨‍💻 Para o Avaliador

- O código está documentado e modularizado.
- O fluxo de assinatura visual pode ser testado facilmente via Insomnia/Postman.

---

## 🏆 Desafio Técnico

Este projeto foi desenvolvido para o desafio técnico de backend, demonstrando domínio em:
- NestJS
- Integração com Supabase Storage
- Manipulação de PDF
- Boas práticas de autenticação e organização de código
