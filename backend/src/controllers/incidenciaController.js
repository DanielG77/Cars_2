const incidenciaService = require('../services/incidenciaService');
const { validationResult } = require('express-validator');

class IncidenciaController {
    async getAll(req, res) {
        try {
            const incidencias = await incidenciaService.getAll();
            res.json(incidencias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getByCliente(req, res) {
        try {
            const incidencias = await incidenciaService.getByCliente(req.params.clienteId);
            res.json(incidencias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const nuevaIncidencia = await incidenciaService.create(req.body);
            res.status(201).json(nuevaIncidencia);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const incidenciaActualizada = await incidenciaService.update(req.params.id, req.body);
            if (!incidenciaActualizada) return res.status(404).json({ error: 'Incidencia no encontrada' });
            res.json(incidenciaActualizada);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const eliminada = await incidenciaService.delete(req.params.id);
            if (!eliminada) return res.status(404).json({ error: 'Incidencia no encontrada' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new IncidenciaController();
