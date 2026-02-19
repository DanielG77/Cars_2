const express = require('express');
const { body } = require('express-validator');
const clienteController = require('../controllers/clienteController');

const router = express.Router();

const validateCliente = [
    body('dni').notEmpty().withMessage('El DNI es obligatorio'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellidos').notEmpty().withMessage('Los apellidos son obligatorios'),
    body('email').optional().isEmail().withMessage('Email no válido'),
    body('estado').optional().isIn(['pendiente', 'en_tramite', 'resuelto', 'rechazado']).withMessage('Estado no válido')
];

router.get('/', clienteController.getAll);
router.get('/:id', clienteController.getById);
router.get('/:id/vehiculos', clienteController.getWithVehiculos);
router.post('/', validateCliente, clienteController.create);
router.put('/:id', validateCliente, clienteController.update);
router.delete('/:id', clienteController.delete);
router.get('/email/:email', clienteController.getByEmail);  // <--- NUEVA RUTA

module.exports = router;
