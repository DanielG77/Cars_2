const db = require('../db');

class ClienteService {
    async getAll(estado) {
        let query = 'SELECT * FROM clientes';
        const params = [];
        if (estado) {
            query += ' WHERE estado = $1';
            params.push(estado);
        }
        query += ' ORDER BY id DESC';
        const { rows } = await db.query(query, params);
        return rows;
    }

    async getById(id) {
        const { rows } = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
        return rows[0];
    }

    async getByEmail(email) {
        const { rows } = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
        return rows[0];
    }

    async getWithVehiculos(id) {
        const cliente = await this.getById(id);
        if (!cliente) return null;

        const { rows: vehiculos } = await db.query('SELECT * FROM vehiculos WHERE cliente_id = $1', [id]);
        return { ...cliente, vehiculos };
    }

    async create(data) {
        const { dni, nombre, apellidos, telefono, email, estado } = data;
        const query = `
      INSERT INTO clientes (dni, nombre, apellidos, telefono, email, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
        const { rows } = await db.query(query, [dni, nombre, apellidos, telefono, email, estado || 'pendiente']);
        return rows[0];
    }

    async update(id, data) {
        const { dni, nombre, apellidos, telefono, email, estado } = data;
        const query = `
      UPDATE clientes 
      SET dni = $1, nombre = $2, apellidos = $3, telefono = $4, email = $5, estado = $6
      WHERE id = $7
      RETURNING *`;
        const { rows } = await db.query(query, [dni, nombre, apellidos, telefono, email, estado, id]);
        return rows[0];
    }

    async delete(id) {
        const { rowCount } = await db.query('DELETE FROM clientes WHERE id = $1', [id]);
        return rowCount > 0;
    }
}

module.exports = new ClienteService();
