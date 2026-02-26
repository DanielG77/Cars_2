# Cártel de Coches

Aplicación web para gestionar reclamaciones de afectados por el cártel de fabricantes de automóviles (2006-2013).

## Stack

| Servicio | Tecnología | Puerto |
|---|---|---|
| Frontend | Vue 3 + Vite + Nginx | 5173 |
| Backend | Node.js + Express | 3000 |
| Base de datos | PostgreSQL 15 | 5432 |
| Correo (pruebas) | MailHog | 8025 |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- Git

---

## Levantar la aplicación

### 1. Clonar el repositorio

```bash
git clone <https://github.com/DanielG77/Cars_2.git>
cd Cars_2
```

### 2. Configurar las variables de entorno

El archivo `.env` ya está incluido con valores por defecto listos para desarrollo local. No es necesario modificarlo.

```env
DB_USER=postgres
DB_PASSWORD=secret_password_123
DB_NAME=cartel_coches
DB_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=5173
MAILHOG_UI_PORT=8025
```

### 3. Construir y levantar todos los contenedores

```bash
docker compose up --build
```

> La primera vez descargará las imágenes base y construirá los contenedores. Las siguientes veces será más rápido.

### 4. Acceder a la aplicación

| URL | Descripción |
|---|---|
| http://localhost:5173 | Aplicación web (Frontend) |
| http://localhost:3000/api | API REST (Backend) |
| http://localhost:8025 | MailHog — bandeja de entrada de correos de prueba |

---

## Parar la aplicación

```bash
docker compose down
```

Para parar **y eliminar los datos** de la base de datos:

```bash
docker compose down -v
```

---

## Reiniciar solo un servicio

```bash
docker compose restart api
docker compose restart web
docker compose restart db
```

---

## Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Solo el backend
docker compose logs -f api

# Solo el frontend
docker compose logs -f web
```

---

## Usuarios de prueba

### Administrador

| Campo | Valor |
|---|---|
| Email | admin@tudominio.com |
| Contraseña | Admin123! |

### Clientes (la contraseña es la parte del email antes del `@`)

| Nombre | Email | Contraseña |
|---|---|---|
| Juan Pérez | juan.perez@email.com | `juan.perez` |
| María López | maria.lopez@email.com | `maria.lopez` |
| Carlos Rodríguez | carlos.rod@email.com | `carlos.rod` |
| Ana Gómez | ana.gomez@email.com | `ana.gomez` |

---

## Estructura del proyecto

```
Cars_2/
├── docker-compose.yml
├── .env
├── backend/               # API REST Node.js + Express
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── db/
│   └── sql/
│       ├── init.sql       # Creación de tablas
│       └── seed.sql       # Datos de prueba
└── frontend/              # SPA Vue 3
    └── src/
        ├── view/
        ├── components/
        ├── router/
        └── services/
```
