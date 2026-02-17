const express = require('express');
const { body } = require('express-validator');
const incidenciaController = require('../controllers/incidenciaController');

const router = express.Router();

const validateIncidencia = [
    body('cliente_id').isInt().withMessage('ID de cliente debe ser un número entero'),
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('descripcion').optional()
];

router.get('/', incidenciaController.getAll);
router.get('/cliente/:clienteId', incidenciaController.getByCliente);
router.post('/', validateIncidencia, incidenciaController.create);
router.put('/:id', incidenciaController.update);
router.delete('/:id', incidenciaController.delete);

module.exports = router;
