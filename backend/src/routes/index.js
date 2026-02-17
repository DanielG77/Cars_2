const express = require('express');
const clienteRoutes = require('./clienteRoutes');
const vehiculoRoutes = require('./vehiculoRoutes');
const incidenciaRoutes = require('./incidenciaRoutes');

const router = express.Router();

router.use('/clientes', clienteRoutes);
router.use('/vehiculos', vehiculoRoutes);
router.use('/incidencias', incidenciaRoutes);

module.exports = router;
