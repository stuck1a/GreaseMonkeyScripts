/**
 * Checks, whether we are currently on the page "My Profile" or not.
 *
 * @return {boolean}
 */
function onProfilePage() {
  return window.location.toString().startsWith('nuoflix.de/profil/')
      || window.location.toString().startsWith('http://nuoflix.de/profil/')
      || window.location.toString().startsWith('https://nuoflix.de/profil/')
}
