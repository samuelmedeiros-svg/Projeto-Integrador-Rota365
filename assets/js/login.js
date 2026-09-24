(function () {
  // Nas páginas dentro de pages/ é preciso subir uma pasta para achar a raiz
  const raiz = window.location.pathname.includes('/pages/') ? '../' : '';

  function estaLogado() {
    return localStorage.getItem('logado') === 'true';
  }

  // Mostra ou esconde os botões conforme o estado de login
  function atualizarHeader() {
    const logado = estaLogado();
    ['entrarheader-btn', 'cadastrarheader-btn'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('d-none', logado);
    });
  }

  function fecharModalLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Roda ao carregar a página (mantém escondido se já estiver logado)
    atualizarHeader();

    // ---------- LOGIN ----------
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('InputEmail1').value.trim();
        const senha = document.getElementById('InputPassword1').value;

        if (email === 'gerente@gmail.com' && senha === '123456') {
          localStorage.setItem('logado', 'true');
          localStorage.setItem('tipoUsuario', 'gerente');
          window.location.href = raiz + 'gerente.html';

        } else if (email === 'cliente@gmail.com' && senha === '123456') {
          localStorage.setItem('logado', 'true');
          localStorage.setItem('tipoUsuario', 'cliente');
          fecharModalLogin();
          atualizarHeader();

        } else {
          alert('E-mail ou senha incorretos.');
        }
      });
    }

    // ---------- ÍCONE DE PERFIL ----------
    const profile = document.getElementById('profile');
    if (profile) {
      profile.addEventListener('click', function (e) {
        e.preventDefault();

        if (estaLogado()) {
          if (confirm('Deseja sair da conta?')) {
            localStorage.removeItem('logado');
            localStorage.removeItem('tipoUsuario');
            atualizarHeader();
          }
        } else {
          // Se não estiver logado, abre o modal de login
          const modal = document.getElementById('loginModal');
          if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
        }
      });
    }
  });

  // Se o usuário logar/sair em outra aba, esta aba atualiza sozinha
  window.addEventListener('storage', atualizarHeader);
})();
