const db = require('../db');

class IncidenciaService {
    async getAll() {
        const { rows } = await db.query('SELECT * FROM incidencias ORDER BY id DESC');
        return rows;
    }

    async getByCliente(clienteId) {
        const { rows } = await db.query('SELECT * FROM incidencias WHERE cliente_id = $1 ORDER BY id DESC', [clienteId]);
        return rows;
    }

    async create(data) {
        const { cliente_id, titulo, descripcion } = data;
        const query = `
      INSERT INTO incidencias (cliente_id, titulo, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *`;
        const { rows } = await db.query(query, [cliente_id, titulo, descripcion]);
        return rows[0];
    }

    async update(id, data) {
        const { titulo, descripcion, resuelta } = data;
        const query = `
      UPDATE incidencias 
      SET titulo = $1, descripcion = $2, resuelta = $3
      WHERE id = $4
      RETURNING *`;
        const { rows } = await db.query(query, [titulo, descripcion, resuelta, id]);
        return rows[0];
    }

    async delete(id) {
        const { rowCount } = await db.query('DELETE FROM incidencias WHERE id = $1', [id]);
        return rowCount > 0;
    }
}

module.exports = new IncidenciaService();
