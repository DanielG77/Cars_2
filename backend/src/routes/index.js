const express = require('express');
const clienteRoutes = require('./clienteRoutes');
const vehiculoRoutes = require('./vehiculoRoutes');
const incidenciaRoutes = require('./incidenciaRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

router.use('/clientes', clienteRoutes);
router.use('/vehiculos', vehiculoRoutes);
router.use('/incidencias', incidenciaRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
