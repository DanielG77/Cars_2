# Cartel de Coches - API Backend

Este es el backend para el sistema de gestión de afectados por el cártel de coches (2006-2013).

## Requisitos

- Node.js (v14+)
- PostgreSQL

## Instalación

1.  Navega a la carpeta backend:
    ```bash
    cd backend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Configura las variables de entorno:
    Copia el archivo `.env.example` a `.env` y ajusta los valores de tu conexión a PostgreSQL.
    ```bash
    cp .env.example .env
    ```

4.  Inicializa la base de datos:
    Ejecuta los scripts SQL en tu instancia de PostgreSQL:
    - `sql/init.sql` (Crea las tablas)
    - `sql/seed.sql` (Inserta datos de prueba opcionales)

5.  Inicia el servidor:
    ```bash
    # Para producción
    npm start

    # Para desarrollo (requiere nodemon opcionalmente instalado)
    npm run dev
    ```

## API REST

### Clientes
- `GET /api/clientes` - Lista todos los clientes (filtro `?estado=...` opcional)
- `GET /api/clientes/:id` - Detalle de un cliente
- `GET /api/clientes/:id/vehiculos` - Detalle de cliente con sus vehículos
- `POST /api/clientes` - Crear un cliente
- `PUT /api/clientes/:id` - Actualizar un cliente
- `DELETE /api/clientes/:id` - Eliminar un cliente

### Vehículos
- `GET /api/vehiculos` - Lista todos los vehículos
- `GET /api/vehiculos/:id` - Detalle de un vehículo
- `POST /api/vehiculos` - Registrar un vehículo
- `PUT /api/vehiculos/:id` - Actualizar un vehículo
- `DELETE /api/vehiculos/:id` - Eliminar un vehículo

## Estructura del proyecto
- `src/app.js`: Entrada de la aplicación.
- `src/controllers/`: Manejadores de peticiones HTTP.
- `src/services/`: Lógica de negocio y consultas a DB.
- `src/routes/`: Definición de rutas de la API.
- `src/db/`: Configuración de la conexión a PostgreSQL.
- `sql/`: Scripts de base de datos.
