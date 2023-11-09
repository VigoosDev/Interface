const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../Model/db');
const helpers = require('./helpers');
const bcrypt = require('bcrypt');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'nombre', // Campo utilizado como nombre de usuario en el formulario de inicio de sesión
      passwordField: 'contraseña', // Campo utilizado como contraseña en el formulario de inicio de sesión
    },
    (username, password, done) => {
      // Verificar si el usuario existe en la base de datos
      const getUserQuery = 'SELECT * FROM usuarios WHERE nombre = ?';
      pool.query(getUserQuery, [username], (error, results) => {
        if (error) {
          return done(error);
        }
        if (results.length === 0) {
          return done(null, false, { message: 'Nombre de usuario incorrecto' });
        }

        // Verificar la contraseña utilizando bcrypt
        const user = results[0];
        console.log('Contraseña ingresada:', password);
        console.log('Contraseña almacenada:', user.contraseña);
        bcrypt.compare(password, user.contraseña, (error, isMatch) => {
          if (error) {
            return done(error);
          }
          if (isMatch) {
            // La contraseña es correcta, autenticación exitosa
            return done(null, user);
          } else {
            // La contraseña es incorrecta
            return done(null, false, { message: 'Contraseña incorrecta' });
          }
        });
      });
    }
  )
);
// CREATE ADMIN;
const nombre = 'Boyan';
const contraseña = '60137112';
const hashedPassword = bcrypt.hashSync(contraseña, 10); // Hash de la contraseña

const checkSuperAdminQuery = 'SELECT * FROM usuarios WHERE admin = 1';
pool.query(checkSuperAdminQuery, (error, results) => {
  if (error) {
    console.error('Error al verificar el superadministrador:', error);
    return;
  }

  if (results.length === 0) { 
    const createUserQuery = 'INSERT INTO usuarios (nombre, contraseña, admin) VALUES (?, ?, ?)';
    pool.query(
      createUserQuery,
      [nombre, hashedPassword, 1], // Valor de admin = 1 indica un superadministrador
      (error, results) => {
        if (error) {
          console.error('Error al crear el superadministrador:', error);
          return;
        }

        console.log('Superadministrador creado exitosamente.');
      }
    ); 
  } else {
    console.log('Ya existe un superadministrador en la base de datos.');
  }
});

passport.serializeUser((user, done) => {
  // Almacenar el ID del usuario en la sesión
  done(null, user.id);
});
passport.use(
    'signup',
    new LocalStrategy(
      {
        usernameField: 'nombre', // Campo utilizado como nombre de usuario en el formulario de registro
        passwordField: 'contraseña', // Campo utilizado como contraseña en el formulario de registro
        passReqToCallback: true, // Pasar el objeto de solicitud (req) como argumento adicional
      },
      (req, username, password, done) => {
        const { apellido_paterno, apellido_materno, correo, direccion, telefono } = req.body;
  
        // Verificar si el nombre de usuario ya está en uso
        const checkUsernameQuery = 'SELECT * FROM usuarios WHERE nombre = ?';
        pool.query(checkUsernameQuery, [username], (error, results) => {
          if (error) {
            return done(error);
          }
          if (results.length > 0) {
            return done(null, false, { message: 'El nombre de usuario ya está en uso' });
          }
          // Hash de la contraseña
          bcrypt.hash(password, 10, (error, hashedPassword) => {
            if (error) {
              return done(error);
            }
  
            // Crear un nuevo usuario en la base de datos
            const createUserQuery = 'INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)';
            pool.query(
              createUserQuery,
              [username, apellido_paterno, apellido_materno, correo, hashedPassword, direccion, telefono],
              (error, results) => {
                if (error) {
                  return done(error);
                }
  
                const newUser = {
                  id: results.insertId,
                  nombre: username,
                  apellido_paterno: apellido_paterno,
                  apellido_materno: apellido_materno,
                  correo: correo,
                  direccion: direccion,
                  telefono: telefono,
                };
  
                return done(null, newUser);
              }
            );
          });
        });
      }
    )
  );

passport.deserializeUser((id, done) => {
  // Obtener los datos del usuario desde la base de datos utilizando el ID almacenado en la sesión
  const getUserQuery = 'SELECT * FROM usuarios WHERE id = ?';
  pool.query(getUserQuery, [id], (error, results) => {
    if (error) {
      return done(error);
    }
    const user = results[0];
    done(null, user);
  });
});






/*passport.use('local.signin', new LocalStrategy({
    usernameField: 'nombre',
    passwordField: 'contraseña',
    passReqToCallback: true
}, async (req, nombre, contraseña, done) => {
    const rows = await pool.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(contraseña, user.contraseña)
        if (validPassword) {
            done(null, user, req.flash('success', 'Welcome ' + user.nombre));
        } else {
            done(null, false, req.flash('error', 'Incorrect Password'));
        }
    } else {
        return done(null, false, req.flash('error', 'The Username does not exists.'));
    }
}));


passport.use('local.signup', new LocalStrategy({
    usernameField: 'nombre',
    passwordField: 'contraseña',
    passReqToCallback: true
}, async (req, nombre, contraseña, done) => {
    const { apellido_paterno, apellido_materno, correo, direccion, telefono } = req.body;

    let newUser = {
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        contraseña,
        direccion,
        telefono
    };
    newUser.contraseña = await helpers.encryptPassword(contraseña);

    // Saving in the Database
    const result = await pool.query('INSERT INTO usuarios SET ?', newUser);
    if (result && result.insertId) {
      newUser.id = result.insertId;
      console.log('exito al crear el usuario');
    } else {
      console.log('error al crear usuario');
      return done(null, false, req.flash('error', 'Failed to create user.'));
    }
    return done(null, newUser);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length > 0) {
        done(null, rows[0]);
    } else {
        done(new Error('User not found.'));
    }
});*/


