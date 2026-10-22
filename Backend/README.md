# JC Hidráulica — aplicação web

O frontend usa HTML, CSS e JavaScript sem framework e está em `src/main/resources/static`. O Spring Boot serve a interface e a API na mesma origem, então não é necessário iniciar um servidor frontend separado.

## Executar

Requer JDK 25. A partir desta pasta:

```bash
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`. Acesse `http://localhost:8080/`.

## API consumida pela interface

- `GET /api/produtos` e `GET /api/produtos/{id}`: consulta pública do catálogo.
- `POST /api/admins/login` com JSON `{ "email": "...", "senha": "..." }`: login; cria uma sessão HTTP.
- `GET /api/admins/session` e `POST /api/admins/logout`: consulta e encerra a sessão.
- `GET /api/admins/produtos`: lista de produtos para o painel, exige sessão.
- `POST /api/produtos`, `PUT /api/produtos/{id}`, `PATCH /api/produtos/{id}/status` e `DELETE /api/produtos/{id}`: operações administrativas, exigem sessão.

Em um banco sem administradores, a aplicação cria uma conta local de demonstração ao iniciar:

- E-mail: `demo-admin@localhost.invalid`
- Senha: `JC-Demo-Only-7vQ!4mZ#9pL2xR`

Se já existir qualquer administrador, a conta de demonstração não é criada nem altera contas existentes. É possível configurar os dados iniciais com `JC_ADMIN_EMAIL`, `JC_ADMIN_PASSWORD` e `JC_ADMIN_DOCUMENTO` antes de iniciar a aplicação. Não use as credenciais de demonstração em produção: atualmente as senhas são armazenadas sem hash e o bootstrap usa valores locais padrão. Antes de expor o sistema publicamente, configure credenciais próprias e implemente armazenamento de senha com hash e autenticação apropriada.

O catálogo consulta o backend; se a API estiver indisponível, a página inicial exibe produtos locais de demonstração e o catálogo informa que os dados não puderam ser atualizados.
