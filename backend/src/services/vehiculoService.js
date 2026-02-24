const db = require('../db');

class VehiculoService {
    async getAll(status) {
        if (status) {
            const { rows } = await db.query('SELECT * FROM vehiculos WHERE status = $1 ORDER BY id DESC', [status]);
            return rows;
        }
        const { rows } = await db.query('SELECT * FROM vehiculos ORDER BY id DESC');
        return rows;
    }

    async getById(id) {
        const { rows } = await db.query('SELECT * FROM vehiculos WHERE id = $1', [id]);
        return rows[0];
    }

    async create(data) {
        const { cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones, status } = data;
        const query = `
      INSERT INTO vehiculos (cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;
        const { rows } = await db.query(query, [cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones, status || 'pending']);
        return rows[0];
    }

    async update(id, data) {
        const { cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones, status } = data;
        const query = `
      UPDATE vehiculos 
      SET cliente_id = $1, matricula = $2, marca = $3, modelo = $4, anio_matriculacion = $5, color = $6, puertas = $7, observaciones = $8, status = $9
      WHERE id = $10
      RETURNING *`;
        const { rows } = await db.query(query, [cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones, status || 'pending', id]);
        return rows[0];
    }

    async delete(id) {
        const { rowCount } = await db.query('DELETE FROM vehiculos WHERE id = $1', [id]);
        return rowCount > 0;
    }

    async patchStatus(id, status) {
        const { rows } = await db.query(
            'UPDATE vehiculos SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return rows[0];
    }
}

module.exports = new VehiculoService();
