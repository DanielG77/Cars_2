const vehiculoService = require('../services/vehiculoService');
const { validationResult } = require('express-validator');

class VehiculoController {
    async getAll(req, res) {
        try {
            const { status } = req.query;
            const vehiculos = await vehiculoService.getAll(status);
            res.json(vehiculos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const vehiculo = await vehiculoService.getById(req.params.id);
            if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
            res.json(vehiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const nuevoVehiculo = await vehiculoService.create(req.body);
            res.status(201).json(nuevoVehiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const vehiculoActualizado = await vehiculoService.update(req.params.id, req.body);
            if (!vehiculoActualizado) return res.status(404).json({ error: 'Vehículo no encontrado' });
            res.json(vehiculoActualizado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const eliminado = await vehiculoService.delete(req.params.id);
            if (!eliminado) return res.status(404).json({ error: 'Vehículo no encontrado' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async patchStatus(req, res) {
        const { status } = req.body;
        if (!['accepted', 'pending', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status no válido. Use: accepted, pending, rejected' });
        }
        try {
            const updated = await vehiculoService.patchStatus(req.params.id, status);
            if (!updated) return res.status(404).json({ error: 'Vehículo no encontrado' });
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new VehiculoController();
