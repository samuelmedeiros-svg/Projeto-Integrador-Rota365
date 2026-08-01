window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  const logo = document.getElementById('logo');
  const lupa = document.getElementById('lupa');
  const profile = document.getElementById('profile');

  if (window.scrollY > 10) {
    header.classList.add('scroll');
    logo.src ="logo-branca.png";
    lupa.src ="lupa-branca.png";
    profile.src ="profile-branca.png";
  } else {
    header.classList.remove('scroll');
    logo.src = "logo.png";
    lupa.src ="lupa.png";
    profile.src ="profile.png";
  }
});
