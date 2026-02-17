const db = require('../db');

class VehiculoService {
    async getAll() {
        const { rows } = await db.query('SELECT * FROM vehiculos ORDER BY id DESC');
        return rows;
    }

    async getById(id) {
        const { rows } = await db.query('SELECT * FROM vehiculos WHERE id = $1', [id]);
        return rows[0];
    }

    async create(data) {
        const { cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones } = data;
        const query = `
      INSERT INTO vehiculos (cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`;
        const { rows } = await db.query(query, [cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones]);
        return rows[0];
    }

    async update(id, data) {
        const { cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones } = data;
        const query = `
      UPDATE vehiculos 
      SET cliente_id = $1, matricula = $2, marca = $3, modelo = $4, anio_matriculacion = $5, color = $6, puertas = $7, observaciones = $8
      WHERE id = $9
      RETURNING *`;
        const { rows } = await db.query(query, [cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones, id]);
        return rows[0];
    }

    async delete(id) {
        const { rowCount } = await db.query('DELETE FROM vehiculos WHERE id = $1', [id]);
        return rowCount > 0;
    }
}

module.exports = new VehiculoService();
