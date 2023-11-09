const express = require('express');
const pool = require('../../Model/db');
require('../../lib/passport');
const router = express.Router();

router.get('/errores', (req, res) => {
    // Realizar consulta para obtener los errores de la base de datos
    const getErrorsQuery = 'SELECT errores.*, usuarios.id AS userId FROM errores LEFT JOIN usuarios ON errores.id = usuarios.id';
    pool.query(getErrorsQuery, (error, results) => {
      if (error) {
        console.error('Error al obtener los errores:', error);
        // Manejar el error de forma adecuada, redireccionar o mostrar mensaje de error al usuario
        return res.redirect('/'); // Redireccionar al inicio en caso de error
      }
  
      // Pasar los resultados de la consulta a la plantilla de errores
      res.render('errores/errores', { errors: results });
    });
});
  

module.exports = router;
