// Pegamos os elementos aqui fora para o navegador não precisar ficar buscando eles toda vez que você rolar a página
const header = document.querySelector('header');
const logo = document.getElementById('logo');
const lupa = document.getElementById('lupa');
const profile = document.getElementById('profile');

// Pega o caminho exato que está no HTML (ex: "assets/images/" ou "../assets/images/")
// Pegamos do atributo 'src' original e tiramos o "logo.png", sobrando só a rota das pastas!
const caminhoBase = logo.getAttribute('src').replace('logo.png', '');

window.addEventListener('scroll', function () {
  const scrolled = window.scrollY > 10;

  header.classList.toggle('scroll', scrolled);

  // Agora a gente só junta o caminhoBase com o nome da imagem certa
  logo.src = scrolled
    ? caminhoBase + 'logo-branca.png'
    : caminhoBase + 'logo.png';

  lupa.src = scrolled
    ? caminhoBase + 'lupa-branca.png'
    : caminhoBase + 'lupa.png';

  profile.src = scrolled
    ? caminhoBase + 'profile-branca.png'
    : caminhoBase + 'profile.png';
});
