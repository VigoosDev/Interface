//js para selecionar una consulta y obtener los datos de ususario
const pool = require('../Model/db');

async function obtenerRegistroPorId(id) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM usuarios WHERE id = ?', [id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

module.exports = { obtenerRegistroPorId };
module.exports = { obtenerRegistroPorId };

