window.addEventListener('scroll', function () {
  const header = document.querySelector('header');
  const logo = document.getElementById('logo');
  const lupa = document.getElementById('lupa');
  const profile = document.getElementById('profile');

  const scrolled = window.scrollY > 10;

  header.classList.toggle('scroll', scrolled);

  logo.src = scrolled
    ? 'assets/images/logo-branca.png'
    : 'assets/images/logo.png';

  lupa.src = scrolled
    ? 'assets/images/lupa-branca.png'
    : 'assets/images/lupa.png';

  profile.src = scrolled
    ? 'assets/images/profile-branca.png'
    : 'assets/images/profile.png';
});
