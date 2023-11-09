const express = require('express');
const pool = require('../../Model/db');
require('../../lib/passport');
const { isLoggedIn } = require('../../lib/auth');
const router = express.Router();

// Ruta para mostrar el formulario de inserción
router.get('/fugas/create', (req, res) => {
    res.render('interface/formFugas'); // Ajusta la ruta y el nombre del archivo de vista según tu estructura de carpetas y nombres
  });
  
  // Ruta para procesar el formulario y guardar los datos en la base de datos
  router.post('/fugas/create', (req, res) => {
    const { fechaHora, intensidad, estado } = req.body;
    const user_id = req.user.id; // Obtener el ID de usuario del usuario autenticado
  
    // Insertar los datos en la tabla fugas
    const query = 'INSERT INTO fugas (fechaHora, intensidad, estado, user_id) VALUES (?, ?, ?, ?)';
    pool.query(query, [fechaHora, intensidad, estado, user_id], (error, results) => {
      if (error) {
        console.log('Error al insertar los datos:', error);
        res.redirect('/fugas');
        return;
      }
  
      console.log('Datos insertados correctamente en la tabla fugas');
      res.redirect('/fugas');
    });
  });
  
  module.exports = router;
  