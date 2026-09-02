
const scriptSrc = document.currentScript.src;
const BASE_URL = scriptSrc.substring(0, scriptSrc.indexOf('assets/js/scroll.js'));

window.addEventListener('scroll', function () {
  const header = document.querySelector('header');
  const logo = document.getElementById('logo');
  const lupa = document.getElementById('lupa');
  const profile = document.getElementById('profile');

  const scrolled = window.scrollY > 10;

  header.classList.toggle('scroll', scrolled);

  logo.src = scrolled
    ? BASE_URL + 'assets/images/logo-branca.png'
    : BASE_URL + 'assets/images/logo.png';

  lupa.src = scrolled
    ? BASE_URL + 'assets/images/lupa-branca.png'
    : BASE_URL + 'assets/images/lupa.png';

  profile.src = scrolled
    ? BASE_URL + 'assets/images/profile-branca.png'
    : BASE_URL + 'assets/images/profile.png';
});
