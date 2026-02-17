const express = require('express');
const clienteRoutes = require('./clienteRoutes');
const vehiculoRoutes = require('./vehiculoRoutes');

const router = express.Router();

router.use('/clientes', clienteRoutes);
router.use('/vehiculos', vehiculoRoutes);

module.exports = router;
