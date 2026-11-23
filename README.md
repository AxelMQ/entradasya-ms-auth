# ms-auth

Microservicio de autenticación, identidad y gestión de usuarios para la plataforma **EntradasYa**. Emite tokens de acceso JWT (HS256) con claims estándar (`sub`, `name`, `email`, `role`, `iss`, `iat`, `exp`).

* **Tecnología:** Node.js 20 (TypeScript) + Express
* **Puerto:** `8001`
* **Base de datos:** `auth_db` (PostgreSQL 16)
* **Algoritmo JWT:** HS256 (vigencia 24h)

---

## 1. Endpoints

### Autenticación (`/api/v1/auth`)
* `POST /api/v1/auth/register`: Registro de nuevo cliente.
* `POST /api/v1/auth/login`: Inicio de sesión y emisión de JWT.
* `GET /api/v1/auth/me`: Perfil del usuario autenticado (requiere `Authorization: Bearer <token>`).

### Chequeos de Salud
* `GET /health/live`: Liveness probe (`{"status": "UP"}`).
* `GET /health/ready`: Readiness probe (verifica conectividad a `auth_db` con `SELECT 1`).

---

## 2. Variables de Entorno

Configurar archivo `.env`:

```env
PORT=8001
NODE_ENV=development
DATABASE_URL=postgresql://auth_user:auth_pass@localhost:5432/auth_db
JWT_SECRET=super-secure-shared-secret-entradasya-2026
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
```

---

## 3. Base de Datos

* **Migración:** `migrations/001_create_users_table.sql`
* **Semillas:** `seeds/001_seed_initial_users.sql`

Cuentas semilla disponibles:
* `organizador@entradasya.com` (`Org1234!`)
* `portero@entradasya.com` (`Port1234!`)
* `cliente@entradasya.com` (`Client1234!`)

---

## 4. Pruebas y Compilación

```bash
# Instalar dependencias
npm install

# Ejecutar suite de pruebas
npm test

# Compilar TypeScript
npm run build

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## Estado de Verificacion CI/CD

- Pipeline `.github/workflows/ci-develop.yml` verificado con disparo automatico en rama `develop`, generando artifacts descargables e imagenes en GHCR y Docker Hub.
