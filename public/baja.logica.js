const deleteForms = document.querySelectorAll('.delete-form');
deleteForms.forEach(form => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = form.action;
    const method = 'PUT';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al realizar la baja lógica del usuario');
        }
        return response.json();
      })
      .then(data => {
        console.log('Mensajes flash:', data.flash);
        console.log('Usuario dado de baja:', { id: data.id });
        // Realizar acciones adicionales después de la baja lógica del usuario
      })
      .catch(error => {
        console.error('Error al realizar la baja lógica del usuario:', error);
      });
  });
});