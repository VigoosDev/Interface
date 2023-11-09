const boton_contraseña = document.getElementById('Contraseña');
const mostrar_contraseña = document.getElementById('mostrar-contraseña');
const ojo = document.getElementById('ojo');

mostrar_contraseña.addEventListener('mouseenter', function () {
  ojo.src = 'img/ojo-abierto.png';
  boton_contraseña.type = 'text';
});

mostrar_contraseña.addEventListener('mouseleave', function () {
  ojo.src = 'img/ojo-cerrado.png';
  boton_contraseña.type = 'password';
});