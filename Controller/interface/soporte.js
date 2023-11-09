const express = require('express');
const pool = require('../../Model/db');
const nodemailer = require('nodemailer');
require('../../lib/passport');
const router = express.Router();


// ruta para mostrar soporte 
router.get('/soporte', (req, res) => {
    res.render('interface/soporte');
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
    from: 'aronboyancruz@gmail.com',
    to: 'dante73274907@gmail.com',
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
    res.redirect('/soporte');
  });
});


module.exports = router;