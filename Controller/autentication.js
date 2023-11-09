const express = require('express');
const passport = require('passport')
const pool = require('../Model/db');
const { obtenerRegistroPorId } = require('../public/registros');
require('../lib/passport')
const { isLoggedIn } = require('../lib/auth');
const { route } = require('./autentication');
const router = express.Router(); 



//pagina de inicio
router.get('/', (req, res) => {
  req.flash('success', 'welcome');
  res.render('beginning/begin'); 
})

// Signin
// Renderizar formulario de inicio de sesión
router.get('/signin', (req, res) => {
  res.render('login/signin');
});



router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error de autenticación:', err);
      return next(err);
    }

    if (!user) {
      // Actualizar el contador de intentos fallidos y bloquear la cuenta si es necesario
      updateLoginAttempts(req);
      if (req.session.loginAttempts >= 3) {
        blockUser(req.body.nombre);
        req.flash('error', 'Se ha bloqueado su cuenta debido a intentos fallidos de inicio de sesión.');
        return res.redirect('/signin');
      }
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/signin');
    }

    // Restablecer el contador de intentos fallidos si el inicio de sesión es exitoso
    resetLoginAttempts(req);

    req.logIn(user, (err) => {
      if (err) {
        console.error('Error de inicio de sesión:', err);
        return next(err);
      }

      // Verificar el rol del usuario
      if (req.user.admin === 1) {
        // Usuario con rol de superadministrador
        req.flash('success', 'BIENVENIDO ADMINISTRADOR ' + req.body.nombre);
        return res.redirect('/registros');
      } else {
        // Usuario sin rol de superadministrador
        return res.redirect('/dashboard');
      }
    });
  })(req, res, next);
});

function updateLoginAttempts(req) {
  if (!req.session.loginAttempts) {
    req.session.loginAttempts = 0;
  }
  req.session.loginAttempts++;
}

function resetLoginAttempts(req) {
  req.session.loginAttempts = 0;
}

function blockUser(username) {
  // Realiza las acciones necesarias para bloquear al usuario en la base de datos
  // Por ejemplo, puedes establecer la columna "activo" en 0 para indicar que la cuenta está bloqueada
  const sql = 'UPDATE usuarios SET activo = 0 WHERE nombre = ?';

  pool.query(sql, [username], (error, results) => {
    if (error) {
      console.error('Error al bloquear la cuenta del usuario:', error);
      // Puedes manejar el error según tus necesidades
      return;
    }

    console.log('Cuenta bloqueada para el usuario:', username);
  });
}

/* */  

  
// Renderizar formulario de registro
router.get('/users', (req, res) => {
  res.render('register');
});

// Procesar registro
router.post('/users', passport.authenticate('signup', {
  successRedirect: '/dashboard',
  failureRedirect: '/users',
  successFlash:true,
  failureFlash: true,
  rol:'superadmin'
}));


// Ruta protegida para el panel de control
router.get('/dashboard', (req, res) => {
  // Verificar si el usuario está autenticado
  if (req.isAuthenticated()) {
    // Verificar el rol del usuario
    if (req.user.admin === 1) {
      // Usuario con rol de superadministrador
      res.render('registrados', { users: req.user });
    } else {
      // Usuario sin rol de superadministrador
      // Verificar si el usuario está activo
      if (req.user.activo === 1) {
        // Usuario activo, permitir acceso al dashboard
        // Obtener los datos de las fugas relacionadas al usuario desde la base de datos
        const userId = req.user.id;
        const sql = 'SELECT * FROM fugas WHERE user_id = ?';
        pool.query(sql, [userId], (error, results) => {
          if (error) {
            console.error('Error al obtener las fugas:', error);
            req.flash('error', 'Error al obtener las fugas');
            res.redirect('/dashboard');
          } else {
            const fugas = results; // Asigna los resultados de la consulta a la variable fugas
            res.render('interface/dashboard', { user: req.user, fugas });
          }
        });
      } else {
        // Usuario inactivo, redirigir a una página de error o mostrar un mensaje adecuado
        res.render('login/signin');
      }
    }
  } else {
    // Redirigir al formulario de inicio de sesión si el usuario no está autenticado
    res.redirect('/signin');
  }
});



//ruta para informacion 
router.get('/informacion', (req, res) => {
  
    res.render('interface/information')
})



// funcion para salir de la interfaz
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


//ruta para mostrar usuarios registrados 
router.get('/registros', isLoggedIn, (req, res) => {
  pool.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.log('Error al obtener la lista de usuarios:', err);
      res.status(500).json({ message: 'Error al obtener la lista de usuarios' });
      return;
    }
    res.render('registrados', { users: results, success: req.flash('success') });
  });
});


/// Ruta para eliminar un usuario (baja lógica)

router.post('/users/:id', (req, res) => {
  const idUsuario = req.params.id;

  const sql = 'UPDATE usuarios SET activo = false WHERE id = ?';

  pool.query(sql, [idUsuario], (error, results) => {
    if (error) {
      console.error('Error al desactivar el usuario: ', error);
      req.flash('error', 'Error interno del servidor');
      res.status(500).redirect('/');
    } else if (results.affectedRows === 0) {
      req.flash('error', 'Usuario no encontrado');
      res.status(404).redirect('/');
    } else {
      console.log('usuario desactivado exitosamente')
      req.flash('success', 'Usuario desactivado exitosamente');
      res.redirect('/registros');
    }
  });
});
//RUTA PARA ELIMINAR UN USUARIO 
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.log('Error al eliminar el usuario:', err);
      res.status(500).json({ message: 'Error al eliminar el usuario' });
      return;
    }
    console.log('Mensajes flash:', req.flash());
    console.log('Usuario eliminado:', { id });
    req.flash('success', 'usuario eliminado');
    res.redirect('/registros');
  });
});


// Ruta para actualizar un usuario
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono } = req.body;

  pool.query('UPDATE usuarios SET nombre = ?,apellido_paterno = ?, apellido_materno = ?,correo = ?, contraseña = ?,direccion = ?, telefono = ? WHERE id = ?', [nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono, id], (err, result) => {
    if (err) {
      console.log('Error al actualizar el usuario:', err);
      res.status(500).json({ message: 'Error al actualizar el usuario' });
      return;
    }
    console.log('Usuario actualizado:', { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono });
    req.flash('success', 'USUARIO ACTUALIZADO');
    res.redirect('/registros');  
  });
});


// Ruta para actualizar un usuario
router.put('/dashboard/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono } = req.body;

  pool.query('UPDATE usuarios SET nombre = ?,apellido_paterno = ?, apellido_materno = ?,correo = ?, contraseña = ?,direccion = ?, telefono = ? WHERE id = ?', [nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono, id], (err, result) => {
    if (err) {
      console.log('Error al actualizar el usuario:', err);
      res.status(500).json({ message: 'Error al actualizar el usuario' });
      return;
    }
    console.log('Usuario actualizado:', { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono });
    req.flash('success', 'USUARIO ACTUALIZADO');
    res.redirect('/dashboard');  
  });
})



// Ruta para mostrar formulario de actualización
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const registro = await obtenerRegistroPorId(id);
  res.render('editar', { registro });
});




// Ruta para mostrar formulario de actualización de perfil
router.get('/cambiar/:id', async (req, res) => {
  const { id } = req.params;
  const registro = await obtenerRegistroPorId(id);
  res.render('interface/cambiar', { registro });
});

// ruta para el perfil
router.get('/perfil', (req, res) => {
  const user = req.user; // Obtener el objeto 'user' de la sesión

  // Verificar si el usuario está autenticado
  if (!user) {
    // Redireccionar al inicio de sesión si el usuario no está autenticado
    return res.redirect('/signin');
  }

  res.render('interface/perfil', { user: user });
});


router.get('/electricistas', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.activo === 1) {
      const userId = req.user.id;
      const sql = 'SELECT * FROM electricistas WHERE user_id = ?';
      pool.query(sql, [userId], (error, results) => {
        if (error) {
          console.error('Error al obtener los electricistas:', error);
          req.flash('error', 'Error al obtener los electricistas');
          res.redirect('/electricistas');
        } else {
          const electricistas = results;
          res.render('interface/electricista', { electricistas });
        }
      });
    } else {
      res.render('login/signin');
    }
  } else {
    res.redirect('/signin');
  }
});
// Mostrar formulario para agregar un electricista
router.get('/electricistas/agregar', (req, res) => {
  res.render('interface/form-electricista');
});

// Agregar un electricista
router.post('/electricistas/agregar', (req, res) => {
  const { nombreElectricista, apellidoPaterno, apellidoMaterno, correo, telefono, zona, calle, numero, especialidad } = req.body;

  const sql = 'INSERT INTO electricistas (nombreElectricista, apellidoPaterno, apellidoMaterno, correo, telefono, zona, calle, numero, especialidad, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [nombreElectricista, apellidoPaterno, apellidoMaterno, correo, telefono, zona, calle, numero, especialidad, req.user.id]; // Asumiendo que el usuario autenticado tiene un ID almacenado en req.user.id

  pool.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error al añadir el electricista:', error);
      req.flash('error', 'Error al añadir el electricista');
      res.redirect('/electricistas');
    } else {
      req.flash('success', 'Electricista añadido exitosamente');
      res.redirect('/electricistas');
    }
  });
});
//ruta para mostrar usuarios inactivos 
router.get('/usuarios_inactivos', (req, res) => {
  pool.query('SELECT * FROM usuarios WHERE activo = 0', (err, results) => {
    if (err) {
      console.log('Error al obtener la lista de usuarios inactivos:', err);
      res.status(500).json({ message: 'Error al obtener la lista de usuarios inactivos' });
      return;
    };
    res.render('usuarios-inactivo', { users: results });
  });
});


// metodo para activar un usuario 
router.post('/users/:id/activar', (req, res) => {
  const idUsuario = req.params.id;

  const sql = 'UPDATE usuarios SET activo = 1 WHERE id = ?';
 
  pool.query(sql, [idUsuario], (error, results) => {
    if (error) {
      console.error('Error al activar el usuario:', error);
      req.flash('error', 'Error interno del servidor');
      res.status(500).redirect('/usuarios_inactivos');
    } else if (results.affectedRows === 0) {
      req.flash('error', 'Usuario no encontrado');
      res.status(404).redirect('/usuarios_inactivos');
    } else {
      console.log('Usuario activado exitosamente');
      req.flash('success', 'Usuario activado exitosamente');
      res.redirect('/usuarios_inactivos');
    }
  });
});
router.get('/admin/electricistas', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.activo === 1) {
      const userId = req.user.id;
      const sql = 'SELECT * FROM electricistas WHERE user_id = ?';
      pool.query(sql, [userId], (error, results) => {
        if (error) {
          console.error('Error al obtener los electricistas:', error);
          req.flash('error', 'Error al obtener los electricistas');
          res.redirect('/electricistas');
        } else {
          const electricistas = results;
          res.render('interface/elec', { electricistas });
        }
      });
    } else {
      res.render('login/signin');
    }
  } else {
    res.redirect('/signin');
  }
});

router.get('/add', (req, res) => {
  res.render('fuga');
})
module.exports = router; 





















/*// Obtén los datos que deseas insertar
const datosFuga = {
  fechaHora: '2023-06-06 12:00:00',
  intensidad: 2.5,
  estado: 'activa',
  id_usuario: 194 // ID del usuario asociado a la fuga
};*/ 


/*// Construye la sentencia SQL INSERT
const sql = 'INSERT INTO fuga (fechaHora, intensidad, estado, id) VALUES (?, ?, ?, ?)';

// Ejecuta la consulta utilizando el módulo mysql
pool.query(sql, [datosFuga.fechaHora, datosFuga.intensidad, datosFuga.estado, datosFuga.id], (error, results) => {
  if (error) {
    console.error('Error al insertar el registro:', error);
    return;
  }
  console.log('Registro insertado correctamente');
});*/



/*// Ruta protegida para el panel de control
router.get('/dashboard', (req, res) => {
  // Verificar si el usuario está autenticado
  if (req.isAuthenticated()) {
    // Renderizar la página del panel de control
    res.render('interface/dashboard', { user: req.user });
  } else {
    // Redirigir al formulario de inicio de sesión si el usuario no está autenticado
    res.redirect('/signin');
  }
});*/

/*// Ruta para cerrar sesión
const logout = async (req, res, next) => {
  await req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out now.");
    res.redirect("/auth/signin");
  });
};*/

// Ruta para crear un nuevo usuario
/*router.post('/users', (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono } = req.body;

  pool.query('INSERT INTO usuarios SET ?', { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono }, (err, result) => {
    if (err) {
      console.log('Error al crear un nuevo usuario:', err);
      req.flash('error', 'Error al crear un nuevo usuario');
      return;
    }
    console.log('Nuevo usuario creado:', { nombre, apellido_paterno, apellido_materno, correo, contraseña, direccion, telefono });
    console.log('Mensajes flash:', req.flash()); // Agregar esta línea
    req.flash('success', 'El usuario ha sido creado correctamente');
    res.redirect('/registros');
  });
});*/

//ruta para eliminar un usuario 

/*router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.log('Error al eliminar el usuario:', err);
      res.status(500).json({ message: 'Error al eliminar el usuario' });
      return;
    }
    console.log('Mensajes flash:', req.flash());
    console.log('Usuario eliminado:', { id });
    req.flash('success', 'usuario eliminado');
    res.redirect('/registros');
  });
});*/


/*// Ruta para realizar la baja lógica de un usuario
router.put('/users/:id/deactivate', (req, res) => {
  const { id } = req.params;
  pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.log('Error al realizar la baja lógica del usuario:', err);
      res.status(500).json({ message: 'Error al realizar la baja lógica del usuario' });
      return;
    }
    console.log('Mensajes flash:', req.flash());
    console.log('Usuario dado de baja:', { id });
    req.flash('success', 'Usuario dado de baja');
    res.redirect('/registros');
  });
});
*/
/*// Ruta de registro de usuarios
router.get('/users', (req, res) => {
  res.render('register'); // Renderiza el formulario de registro
});

router.post(
  '/users',
  [
    check('nombre').notEmpty().withMessage('Username is required'),
    check('contraseña').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const { nombre, contraseña } = req.body;

    // Validación de errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/users');
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findByUsername(nombre);
      if (existingUser) {
        req.flash('error', 'User already exists');
        return res.redirect('/users');
      }

      // Crear un nuevo usuario
      const userData = {
        nombre,
        contraseña,
      };
      await User.create(userData);

      req.flash('success', 'User registered successfully');
      res.redirect('/signin');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to register user');
      res.redirect('/users');
    }
  }
);*/

/*// Ruta de inicio de sesión
router.get('/signin', (req, res) => {
  res.render('signin'); // Renderiza el formulario de inicio de sesión
});

router.post(
  '/signin',
  [
    check('nombre').notEmpty().withMessage('Username is required'),
    check('contraseña').notEmpty().withMessage('Password is required'),
  ],
  passport.authenticate('local', {
    successRedirect: '/interfaz',
    failureRedirect: '/signin',
    failureFlash: true,
  })
);

/* autenticacion del ususrio al login */

/*router.get('/signin', (req, res) => {
  res.render('login/signin');
});*/

// Renderizar archivo ejs
/*router.get('/signin', (req, res) => {
  res.render('login/signin');
});

router.post('/signin', [
  body('nombre').notEmpty().withMessage('Username is required'),
  body('contraseña').notEmpty().withMessage('Password is required')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/signin');
  }

  passport.authenticate('local.signin', {
    successRedirect: '/interfaz',
    failureRedirect: '/signin',
    successFlash: 'Welcome!',
    failureFlash: true
  })(req, res, next);
});

//signup
router.get('/users', (req, res) => {
  res.render('register');
});

router.post('/users', passport.authenticate('local.signup', {
  successRedirect: '/interface',
  failureRedirect: '/users',
  failureFlash: true
}));*/


