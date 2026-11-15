(function () {
  // Nas páginas dentro de pages/ é preciso subir uma pasta para achar a raiz
  const raiz = window.location.pathname.includes('/pages/') ? '../' : '';

  function estaLogado() {
    return localStorage.getItem('logado') === 'true';
  }

  function paginaProtegida() {
    return document.documentElement.dataset.protegida === 'true';
  }

  // NOVO: em página protegida sem login, abre o modal de login e não deixa fechar.
  // Todos os modais ficam "estáticos" (sem fechar clicando fora ou com Esc),
  // para o usuário não escapar ao ir para "Esqueci minha senha" ou "Crie sua conta".
  function exigirLogin() {
    if (!paginaProtegida() || estaLogado()) return;

    document.querySelectorAll('.modal').forEach(function (el) {
      bootstrap.Modal.getOrCreateInstance(el, { backdrop: 'static', keyboard: false });
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal')).show();
  }

  // Mostra ou esconde os botões conforme o estado de login
  function atualizarHeader() {
    const logado = estaLogado();

    ['entrarheader-btn', 'cadastrarheader-btn'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('d-none', logado);
    });

    const saudacao = document.getElementById('saudacao-header');
    if (saudacao) saudacao.classList.toggle('d-none', !logado);

    // NOVO: ao carregar, ao sair da conta ou ao deslogar em outra aba
    exigirLogin();
  }

  function fecharModalLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  document.addEventListener('DOMContentLoaded', function () {
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

          if (paginaProtegida()) {
            // NOVO: numa página protegida, fica nela em vez de ir para gerente.html
            fecharModalLogin();
            atualizarHeader();
          } else {
            window.location.href = raiz + 'gerente.html';
          }

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
          const modal = document.getElementById('loginModal');
          if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
        }
      });
    }
  });

  // Se o usuário logar/sair em outra aba, esta aba atualiza sozinha
  window.addEventListener('storage', atualizarHeader);
})();
