const express = require('express');
const { body } = require('express-validator');
const vehiculoController = require('../controllers/vehiculoController');

const router = express.Router();

const validateVehiculo = [
    body('cliente_id').isInt().withMessage('ID de cliente debe ser un número entero'),
    body('matricula').notEmpty().withMessage('La matrícula es obligatoria'),
    body('marca').notEmpty().withMessage('La marca es obligatoria'),
    body('modelo').notEmpty().withMessage('El modelo es obligatorio'),
    body('anio_matriculacion').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Año no válido'),
    body('puertas').optional().isInt({ min: 2, max: 7 }).withMessage('Número de puertas no válido')
];

router.get('/', vehiculoController.getAll);
router.get('/:id', vehiculoController.getById);
router.post('/', validateVehiculo, vehiculoController.create);
router.put('/:id', validateVehiculo, vehiculoController.update);
router.delete('/:id', vehiculoController.delete);

module.exports = router;
