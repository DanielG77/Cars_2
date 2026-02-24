const db = require('../db');

class StatsController {
    async getStats(req, res) {
        try {
            const { rows } = await db.query(`
                SELECT
                    (SELECT COUNT(*) FROM clientes)::int                                        AS total_clientes,
                    (SELECT COUNT(*) FROM vehiculos)::int                                        AS total_vehiculos,
                    (SELECT COUNT(*) FROM vehiculos WHERE status = 'accepted')::int              AS total_accepted,
                    (SELECT fecha_registro FROM clientes ORDER BY fecha_registro DESC LIMIT 1)   AS ultimo_registro
            `);
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new StatsController();
