import { createConnection } from 'mysql';

const connection = createConnection({
  host: 'localhost',
  user: 'root',
  password: '60137112',
  database: 'login'
})
try {
    connection.connect();
    document.write('Conectado a la base de datos MySQL');
  } catch (err) {
    document.write('Error al conectar a la base de datos MySQL: ' + err.message);
  }