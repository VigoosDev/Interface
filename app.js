const express = require('express');
const correoElec = require('./Controller/correoElectricista/correo');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('express-flash');
const session = require('express-session');
const routes = require('./Controller/autentication');
const passport = require('passport');
const { check } = require('express-validator');
const soporte = require('./Controller/interface/soporte');
const interfaceRouter = require('./Controller/interface/interface');
const  error  = require('./Controller/errores/errores');
const fugasRouter = require('./Controller/interface/formFugas');

require('./lib/passport');
require('./lib/auth');


// Inicializando la aplicación
const app = express();
 
// Configuración de la aplicación
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

// Middlewares
// Middleware para capturar y manejar errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  req.flash('error', 'Ocurrió un error');
  res.redirect('/');
};
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(check());

// Variables globales
app.use((req, res, next) => {
  res.locals.message = req.flash('success');
  res.locals.danger = req.flash('error');
  app.locals.user=req.user
  next();
});

// Rutas
app.use('/',fugasRouter);
app.use('/', correoElec);
app.use('/', routes);
app.use('/', interfaceRouter);
app.use('/', error);
app.use('/', soporte);
app.use(errorHandler);
// Acceso a la carpeta pública
app.use(express.static(path.join(__dirname, 'public')));

// Inicia el servidor web
const server = app.listen(5000, () => {
  console.log('Servidor web Express iniciado en http://localhost:5000');
});

module.exports = { app, server };