window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  const logo = document.getElementById('logo');
  const lupa = document.getElementById('lupa');
  const profile = document.getElementById('profile');

  if (window.scrollY > 10) {
    header.classList.add('scroll');
    logo.src ="assets/images/logo-branca.png";
    lupa.src ="assets/images/lupa-branca.png";
    profile.src ="assets/images/profile-branca.png";
  } else {
    header.classList.remove('scroll');
    logo.src = "assets/images/logo.png";
    lupa.src ="assets/images/lupa.png";
    profile.src ="assets/images/profile.png";
  }
});
