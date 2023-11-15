// Translations
const i18n = new Map([
  [
    // German (input strings are german already, so we only need metadata for the language menu constructor here)
    'de', new Map([
      [ '__metadata__', {
        displayName: 'Deutsch',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="1" viewBox="0 0 6 3"><path stroke="#010101" d="M0,.5H6"/><path stroke="#DD0000" d="M0,1.5H6"/><path stroke="#FFCE00" d="M0,2.5H6"/></svg>',
      }],
    ])
  ],

  [
    // English
    'en', new Map([
      [ '__metadata__', {
        displayName: 'English',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 4.5 48 24.5"><path fill="#012169" d="M0,0V30H60V0Z"/><path stroke="#FEFEFE" stroke-width="6" d="M1.34,2.68l60,30m0-30-60,30m30-30v30m-30-15h60"/><path stroke="#C8102E" stroke-width="3" d="M31.34,2.68v30m-30-15h60m-60-15,60,30m0-30-60,30"/></svg>',
      }],
      [ 'Nur neue Kommentare', 'New comments only' ],
      [ 'Kommentare pro Seite:', 'Comments per Page:' ],
      [ 'alle', 'all' ],
      [ 'Kommentare {0} .. {1} von {2}', 'Comments {0} .. {1} of {2}' ],
      [ 'Antwort abschicken', 'Send reply' ],
      [ 'Deine Antwort zu diesem Kommentar', 'Your reply to this comment' ],
      [ 'antworten', 'answer' ],
      [ '({0} gefiltert)', '({0} filtered)' ],
      [ 'GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GreaseMonkey function {0}() not found! Add "@grant {0}" in the script header to fix the error.' ],
      [ 'DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.', 'Target DOM element not found. Are you logged in? If yes, maybe the DOM has changed.' ],
      [ 'Warnung!\nEs wurde versucht, ein nicht serialisierbares Objekt zu speichern!\nDas Skript wird versuchen, es als einfaches Objekt zu speichern, aber die Daten könnten beschädigt werden!', 'Warning!\nTried to store non-serializable object!\nThe script will try to store it as plain object, but the data might get corrupted!'],
      [ 'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden', 'It seems like there is deprecated/invalid/corrupted comment data stored.\nUsually this should be fixed with the next page refresh.' ],
      [ 'Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', 'Failed to gather "{0}" data - maybe the DOM has changed?' ],
      [ 'Folgenden Benutzer zur Ignorieren-Liste hinzufügen:', 'Add the following user to the ignore list:' ],
      [ 'Noch keine Kommentare...', 'No comments yet...' ],
      [ 'Zeige {0} ältere Antworten', 'Show {0} old replies' ],
      [ 'Kein Kommentar entspricht den Filterkriterien', 'No comments match the filter criteria' ],
      [ 'Hinzufügen...', 'Add...' ],
      [ 'Entfernen', 'Delete' ],
      [ 'Blockierte Benutzer', 'Blocked users' ],
      [ 'NuoFlix 2.0', 'Enhanced NuoFlix' ],
    ])
  ],
  [
    // Russian
    'ru', new Map([
      [ '__metadata__', {
        displayName: 'Russkiy',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="1" viewBox="0 0 6 3"><path stroke="#FEFEFE" d="M0,.5H6"/><path stroke="#0032A0" d="M0,1.5H6"/><path stroke="#DA291C" d="M0,2.5H6"/></svg>',
      }],
      [ 'Nur neue Kommentare', 'Tol\'ko novyye kommentarii' ],
      [ 'Kommentare pro Seite:', 'Kommentarii na stranitse:' ],
      [ 'alle', 'vse' ],
      [ 'Kommentare {0} .. {1} von {2}', 'Kommentarii {0} .. {1} ot {2}' ],
      [ 'Antwort abschicken', 'Otpravit\' otvet' ],
      [ 'Deine Antwort zu diesem Kommentar', 'Vash otvet na etot kommentariy' ],
      [ 'antworten', 'otvechat\'' ],
      [ '({0} gefiltert)', '({0} Otfil\'trovano)' ],
      [ 'GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'Funktsiya GreaseMonkey {0}() ne naydena! Dobav\'te «@grant {0}» v zagolovok skripta, chtoby ispravit\' oshibku.' ],
      [ 'DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.', 'Element DOM ne nayden. Ne voshel? Yesli da, to DOM izmenilsya.'],
      [ 'Warnung!\nEs wurde versucht, ein nicht serialisierbares Objekt zu speichern!\nDas Skript wird versuchen, es als einfaches Objekt zu speichern, aber die Daten könnten beschädigt werden!', 'Preduprezhdeniye!\nPytalsya sokhranit\' neserializuyemyy ob"yekt!\nSkript popytayetsya sokhranit\' yego kak prostoy ob"yekt, no dannyye mogut byt\' ' ],
      [ 'Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', 'Ne udalos\' sobrat\' dannyye "{0}". Vozmozhno, izmenilsya DOM?' ],
      [ 'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden', 'Pokhozhe, chto khranyatsya ustarevshiye/nedeystvitel\'nyye/povrezhdennyye dannyye kommentariyev.\nObychno eto dolzhno byt\' ispravleno pri sleduyushchem obnovlenii stranitsy.' ],
      [ 'Folgenden Benutzer zur Ignorieren-Liste hinzufügen:', 'Dobav\'te v spisok ignorirovaniya sleduyushchego pol\'zovatelya:' ],
      [ 'Noch keine Kommentare...', 'Kommentariyev poka net...' ],
      [ 'Zeige {0} ältere Antworten', 'Pokazany {0} starykh otvetov' ],
      [ 'Kein Kommentar entspricht den Filterkriterien', 'Net kommentariyev, sootvetstvuyushchikh kriteriyam fil\'tra.' ],
      [ 'Hinzufügen...', 'Dobavlyat\'...' ],
      [ 'Entfernen', 'Udalyat\'' ],
      [ 'Blockierte Benutzer', 'Zablokirovannyye pol\'zovateli' ],
      [ 'NuoFlix 2.0', 'Uluchshennyy NuoFlix' ],
    ])
  ],
]);
