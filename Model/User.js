const pool = require('./db');

const User = {
  findByUsername: function (username, callback) {
    pool.query('SELECT * FROM usuarios WHERE nombre = ?', [username], function (error, results) {
      if (error) {
        return callback(error, null);
      }
      if (results.length === 0) {
        return callback(null, null);
      }
      const user = results[0];
      return callback(null, user);
    });
  },

  create: function (userData, callback) {
    pool.query('INSERT INTO usuarios SET ?', userData, function (error, results) {
      if (error) {
        return callback(error, null);
      }
      const userId = results.insertId;
      return callback(null, userId);
    });
  },
};

module.exports = User;


























/*// Importa el módulo mysql2
const mysql = require('mysql2');

// Crea una conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'datos',
});

// Define el modelo User
const User = {
  // Función para encontrar un usuario por nombre
  findByUsername: function (username, callback) {
    connection.query('SELECT * FROM usuarios WHERE nombre = ?', [username], function (error, results) {
      if (error) {
        return callback(error, null);
      }
      if (results.length === 0) {
        return callback(null, null);
      }
      const user = results[0];
      return callback(null, user);
    });
  },

  // Función para crear un nuevo usuario
  create: function (userData, callback) {
    connection.query('INSERT INTO usuarios SET ?', userData, function (error, results) {
      if (error) {
        return callback(error, null);
      }
      const userId = results.insertId;
      return callback(null, userId);
    });
  },
};

// Exporta el modelo User
module.exports = User;*/