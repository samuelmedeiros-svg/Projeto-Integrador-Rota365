const header = document.querySelector('header');
const logo = document.getElementById('logo');
const lupa = document.getElementById('lupa');
const profile = document.getElementById('profile');


const caminhoBase = logo.getAttribute('src').replace('logo.png', '');

window.addEventListener('scroll', function () {
  const scrolled = window.scrollY > 10;

  header.classList.toggle('scroll', scrolled);


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
