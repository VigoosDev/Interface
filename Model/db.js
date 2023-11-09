const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'datos',
  connectionLimit: 10 // número máximo de conexiones en el pool
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error('Error al conectar a la base de datos: ' + error.stack);
    return;
  }

  console.log('Conexión a la base de datos establecida con éxito.');

  connection.release(); // liberar la conexión
});
function obtenerElectricistasDesdeBaseDeDatos(electricistasIDs) {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return;
      }

      const query = 'SELECT * FROM electricistas WHERE id_electricistas IN (?)';
      connection.query(query, [electricistasIDs], (error, results) => {
        connection.release(); // liberar la conexión

        if (error) {
          reject(error);
          return;
        }

        resolve(results); 
      });
    });
  });
}

// Ejemplo de uso:
const electricistasIDs = [1, 2, 3]; // IDs de los electricistas
obtenerElectricistasDesdeBaseDeDatos(electricistasIDs)
  .then((electricistasRegistrados) => {
    console.log(electricistasRegistrados);
  })
  .catch((error) => {
    console.error('Error al obtener los electricistas desde la base de datos:', error);
  });
module.exports = pool;


/*module.exports = {
  query: function (sql, values, callback) {
    pool.getConnection(function (error, connection) {
      if (error) {
        return callback(error);
      }

      connection.query(sql, values, function (error, results) {
        connection.release();
        if (error) {
          return callback(error);
        }
        callback(null, results);
      });
    });
  }
};*/


