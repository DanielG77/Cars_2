const clienteService = require('../services/clienteService');
const { validationResult } = require('express-validator');

class ClienteController {
    async getAll(req, res) {
        try {
            const { estado } = req.query;
            const clientes = await clienteService.getAll(estado);
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const cliente = await clienteService.getById(req.params.id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getWithVehiculos(req, res) {
        try {
            const data = await clienteService.getWithVehiculos(req.params.id);
            if (!data) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const nuevoCliente = await clienteService.create(req.body);
            res.status(201).json(nuevoCliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const clienteActualizado = await clienteService.update(req.params.id, req.body);
            if (!clienteActualizado) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(clienteActualizado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const eliminado = await clienteService.delete(req.params.id);
            if (!eliminado) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ClienteController();
