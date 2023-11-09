const express = require('express');
const passport = require('passport');
const pool = require('../../Model/db');
const { obtenerRegistroPorId } = require('../../public/registros');
require('../../lib/passport');
const { isLoggedIn } = require('../../lib/auth');
const router = express.Router();

router.get('/prueba', (req, res) => {
    res.send('recibido');
}); 

module.exports = router;