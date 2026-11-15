document.addEventListener('DOMContentLoaded', function () {
  const sair = document.getElementById('sair-gerente');
  if (!sair) return;
  sair.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('logado');
    localStorage.removeItem('tipoUsuario');
    window.location.href = '../../index.html';
  });
});
