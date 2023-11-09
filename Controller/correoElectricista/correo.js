const express = require('express');
const pool = require('../../Model/db');
const nodemailer = require('nodemailer');
require('../../lib/passport');
const router = express.Router();


// ruta para mostrar soporte 
router.get('/correoElec', (req, res) => {
    res.render('interface/correoElectricista');
});
// metodo para enviar correos electronicos
router.post('/soporte', (req, res) => {
    const { nombre, correo, mensaje } = req.body;

  // Configura el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aronboyancruz@gmail.com',
        pass: 'sofsuopdekzgyrdp',
    },
  });

  // Configura el mensaje de correo electrónico
  const mailOptions = {
    from: 'dante73274907@gmail.com',
    to: 'aronboyancruz@gmail.com',
    subject: 'Consulta de soporte',
    text: `Nombre: ${nombre}\nCorreo electrónico: ${correo}\nMensaje: ${mensaje}`,
  };

  // Envía el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo electrónico:', error);
      req.flash('error', 'Hubo un problema al enviar tu consulta');
    } else {
      console.log('Correo electrónico enviado:', info.response);
      req.flash('error', 'Tu consulta ha sido enviada con éxito');
    }
    res.redirect('/correoElec');
  });
});


module.exports = router;



/*const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../../Model/db');
const { obtenerRegistroPorId } = require('../../public/registros');
require('../../lib/passport');
const { isLoggedIn } = require('../../lib/auth');
const router = express.Router();

router.get('/correoElec', async (req, res) => {
  try {
    const electricistas = await obtenerElectricistasDesdeBaseDeDatos();
    res.render('interface/correoElectricista', { electricistas });
  } catch (error) {
    console.log('Error al obtener los electricistas:', error);
    req.flash('error', 'Error al obtener los electricistas.');
    res.redirect('/dashboard');
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dante73274907', // Reemplaza con tu dirección de correo electrónico
    pass: '73274907', // Reemplaza con tu contraseña de correo electrónico
  },
});

router.post('/correoElec', (req, res) => {
  const { nombre, correo, mensaje, electricistas } = req.body;
  const electricistasIDs = electricistas.split(',');

  obtenerElectricistasDesdeBaseDeDatos(electricistasIDs)
    .then((electricistasRegistrados) => {
      const envioCorreos = electricistasRegistrados.map((electricista) => {
        const { nombreElectricista, correo } = electricista;
        const correoOptions = {
          from: 'dante73274907@gmail.com', // Reemplaza con tu dirección de correo electrónico
          to: 'aronboyancruz@gmail.com',
          subject: 'Nuevo mensaje',
          text: `Hola ${nombreElectricista}, has recibido un nuevo mensaje:\n\n${mensaje}`,
        };

        return transporter.sendMail(correoOptions);
      });

      Promise.all(envioCorreos)
        .then(() => {
          req.flash('error', 'El correo se envió correctamente.');
          res.redirect('/dashboard');
        })
        .catch((error) => {
          console.log('Error al enviar correos:', error);
          req.flash('error', 'Error al enviar correos.');
          res.redirect('/dashboard');
        });
    })
    .catch((error) => {
      console.log('Error al obtener los detalles de los electricistas:', error);
      req.flash('error', 'Error al obtener los detalles de los electricistas.');
      res.redirect('/dashboard');
    });
});

async function obtenerElectricistasDesdeBaseDeDatos(electricistasIDs) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM electricistas WHERE id_electricistas IN (?)';
    pool.query(query, [electricistasIDs], (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}
*/