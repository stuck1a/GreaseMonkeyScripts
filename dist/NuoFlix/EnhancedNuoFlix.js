// ==UserScript==
// @name            Enhanced NuoFlix
// @name:de         NuoFlix 2.0
// @namespace       http://tampermonkey.net/
// @version         1.2.1
// @description     Block feature: deletes comments from blocked user | profile page: pagination, comment filter (unread / only conversation with User XY)
// @description:de  Blockierfunktion: entfernt Kommentare von blockierten Usern | Profilseite: Seitenumbruch, Kommentarfilter (ungelesene / nur Konversation mit User XY)
// @icon            https://nuoflix.de/favicon-16x16.png
// @icon64          https://nuoflix.de/apple-touch-icon.png
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @author          stuck1a
// @website         https://stuck1a.de/
// @match           http*://nuoflix.de/*
// @run-at          document-end
// @updateURL       https://raw.githubusercontent.com/stuck1a/GreaseMonkeyScripts/main/dist/NuoFlix/EnhancedNuoFlix.js
// @downloadURL     https://raw.githubusercontent.com/stuck1a/GreaseMonkeyScripts/main/dist/NuoFlix/EnhancedNuoFlix.js
// @supportURL      mailto:dev@stuck1a.de?subject=Meldung zum Skript 'Enhanced NuoFlix'&body=Problembeschreibung, Frage oder Feedback:
// ==/UserScript==
(function() {
 const CACHE_KEY = 's1a/enhancednuoflix';
// Logger prefix
 const MSG_PREFIX = 'Enhanced NuoFlix';
// Fixed configs
 const highlightedCommentsColor = '#4A4A20';
 const highlightedRepliesColor = '#373434';
 const highlightedHasNewRepliesColor = '#52522a';
 const cssClassNewComments = 'newComment';
 const cssClassHasNewReplies = 'hasNewReply';
 const cssClassNewReplies = 'newReply';
 const expandedReplyCount = 3;
// Defaults
 const defaultStart = 1;
 const defaultLength = 5;
 const defaultLanguage = 'de';
 const defaultPlaylists = [
  { id: 1, is_custom: false, max_items: -1, name: 'Favoriten', item_cnt: 0, items: [], },
  { id: 2, is_custom: false, max_items: -1, name: 'Für später gespeichert', item_cnt: 0, items: [], },
  { id: 3, is_custom: false, max_items: 3, name: 'Zuletzt angesehene Videos', item_cnt: 0, items: [], },
];
// IDs of Playlists with special functions
 const favoritesID = 1;
 const watchLaterID = 2;
 const lastWatchedID = 3;
// Map execution flows to pages
 const pageRoutes = new Map([
  [ '/',        'start'   ],
  [ '/profil',  'profile' ],
  [ '/.+',      'video'   ],
]);
 const i18n = new Map([
  [
    'de', new Map([
      [ '__metadata__', {
        displayName: 'Deutsch',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="1" viewBox="0 0 6 3"><path stroke="#010101" d="M0,.5H6"/><path stroke="#DD0000" d="M0,1.5H6"/><path stroke="#FFCE00" d="M0,2.5H6"/></svg>',
      }],
    ])
  ],
  [
    'en', new Map([
      [ '__metadata__', {
        displayName: 'English',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 4.5 48 24.5"><path fill="#012169" d="M0,0V30H60V0Z"/><path stroke="#FEFEFE" stroke-width="6" d="M1.34,2.68l60,30m0-30-60,30m30-30v30m-30-15h60"/><path stroke="#C8102E" stroke-width="3" d="M31.34,2.68v30m-30-15h60m-60-15,60,30m0-30-60,30"/></svg>',
      }],
      [
'Nur neue Kommentare',
'New comments only',
],
[
'Kommentare pro Seite:',
'Comments per Page:',
],
[
'alle',
'all'
],
[
'Kommentare {0} .. {1} von {2}',
'Comments {0} .. {1} of {2}',
],
[
'Antwort abschicken',
'Send reply',
],
[
'Deine Antwort zu diesem Kommentar',
'Your reply to this comment',
],
[
'antworten',
'answer',
],
[
'({0} gefiltert)',
'({0} filtered)',
],
[
'GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.',
'GreaseMonkey function {0}() not found! Add "@grant {0}" in the script header to fix the error.',
],
[
'DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.',
'Target DOM element not found. Are you logged in? If yes, maybe the DOM has changed.',
],
[
'Warnung!\nEs wurde versucht, ein nicht serialisierbares Objekt zu speichern!\nDas Skript wird versuchen, es als einfaches Objekt zu speichern, aber die Daten könnten beschädigt werden!',
'Warning!\nTried to store non-serializable object!\nThe script will try to store it as plain object, but the data might get corrupted!',
],
[
'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden.',
'It seems like there is deprecated/invalid/corrupted comment data stored.\nUsually this should be fixed with the next page refresh.',
],
[
'Aufgetreten in {0}',
'Occurred in {0}',
],
[
'Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?',
'Failed to gather "{0}" data - maybe the DOM has changed?',
],
[
'Folgenden Benutzer zur Ignorieren-Liste hinzufügen:',
'Add the following user to the ignore list:',
],
[
'Noch keine Kommentare...',
'No comments yet...',
],
[
'Zeige {0} ältere Antworten',
'Show {0} old replies',
],
[
'Kein Kommentar entspricht den Filterkriterien',
'No comments match the filter criteria',
],
[
'Hinzufügen...',
'Add...',
],
[
'Entfernen',
'Delete',
],
[
'Blockierte Benutzer',
'Blocked users',
],
[
'NuoFlix 2.0',
'NuoFlix 2.0',
],
[
'Kommentare filtern',
'Filter comments',
],
[
'Suche:',
'Search:',
],
[
'Erweiterte Filteroptionen',
'Advanced filter options',
],
[
'Muss alle Wörter enthalten',
'Must contain all words',
],
[
'nach Datum',
'By date',
],
[
'nach Benutzer:',
'By user:',
],
[
'Einzufügendes Element:',
'Element to insert:',
],
[
'Referenz-Element:',
'Reference Element:',
],
[
'Verwendete Methode:',
'Used method:',
],
[
'Element kann nicht vor dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!',
'Cannot insert before an element without parent!',
],
[
'Element kann nicht nach dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!',
'Cannot insert after an element without parent!',
],
[
'Unbekannte Einfüge-Methode angefordert.',
'Received unknown insertion method.',
],
[
'Ein Custom-Element wurde vor der Initialisierung des globalen Registers eingefügt.\nDas Element konnte daher nicht registriert werden.',
'Injected custom element before initialization of the global register.\nThe element was therefore not registered!',
],
[
'Einstellungen',
'Settings',
],
[
'Sprache:',
'Language:',
],
[
'Ungültiger Datums-Teil in Input',
'Invalid Date part in input',
],
[
'Ungültiger Zeit-Teil in Input',
'Invalid Time part in input',
],
[
'Mehr anzeigen',
'Show more',
],
[
'Standard-Playlists',
'Default Playlists',
],
[
'Favoriten',
'Favorites',
],
[
'Für später gespeichert',
'Watch later',
],
[
'Zuletzt angesehene Videos',
'Recently viewed videos',
],
[
'Eigene Playlists',
'Custom Playlists',
],
[
'Meine Playlists',
'My Playlists',
],
[
'Erstellen',
'Create',
],
[
'Abspielen',
'Play',
],
[
'Bearbeiten',
'Edit',
],
[
'Löschen',
'Delete',
],
[
'Bestätigen',
'Confirm',
],
[
'Abbrechen',
'Cancel',
],
[
'Filter zurücksetzen',
'Reset filter',
],
    ])
  ],
  [
    'ru', new Map([
      [ '__metadata__', {
        displayName: 'Russkiy',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="1" viewBox="0 0 6 3"><path stroke="#FEFEFE" d="M0,.5H6"/><path stroke="#0032A0" d="M0,1.5H6"/><path stroke="#DA291C" d="M0,2.5H6"/></svg>',
      }],
      [
'Nur neue Kommentare',
'Tol\'ko novyye kommentarii',
],
[
'Kommentare pro Seite:',
'Kommentarii na stranitse:',
],
[
'alle',
'vse',
],
[
'Kommentare {0} .. {1} von {2}',
'Kommentarii {0} .. {1} ot {2}',
],
[
'Antwort abschicken',
'Otpravit\' otvet',
],
[
'Deine Antwort zu diesem Kommentar',
'Vash otvet na etot kommentariy',
],
[
'antworten',
'otvechat\'',
],
[
'({0} gefiltert)',
'({0} Otfil\'trovano)',
],
[
'GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.',
'Funktsiya GreaseMonkey {0}() ne naydena! Dobav\'te "@grant {0}" v zagolovok skripta, chtoby ispravit\' oshibku.',
],
[
'DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.',
'Element DOM ne nayden. Ne voshel? Yesli da, to DOM izmenilsya.',
],
[
'Warnung!\nEs wurde versucht, ein nicht serialisierbares Objekt zu speichern!\nDas Skript wird versuchen, es als einfaches Objekt zu speichern, aber die Daten könnten beschädigt werden!',
'Preduprezhdeniye!\nPytalsya sokhranit\' neserializuyemyy ob"yekt!\nSkript popytayetsya sokhranit\' yego kak prostoy ob"yekt, no dannyye mogut byt\'!',
],
[
'Aufgetreten in {0}',
'Proizoshlo v {0}',
],
[
'Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?',
'Ne udalos\' sobrat\' dannyye "{0}". Vozmozhno, izmenilsya DOM?',
],
[
'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden.',
'Pokhozhe, chto khranyatsya ustarevshiye/nedeystvitel\'nyye/povrezhdennyye dannyye kommentariyev.\nObychno eto dolzhno byt\' ispravleno pri sleduyushchem obnovlenii stranitsy.',
],
[
'Folgenden Benutzer zur Ignorieren-Liste hinzufügen:',
'Dobav\'te v spisok ignorirovaniya sleduyushchego pol\'zovatelya:',
],
[
'Noch keine Kommentare...',
'Kommentariyev poka net...',
],
[
'Zeige {0} ältere Antworten',
'Pokazany {0} starykh otvetov',
],
[
'Kein Kommentar entspricht den Filterkriterien',
'Net kommentariyev, sootvetstvuyushchikh kriteriyam fil\'tra.',
],
[
'Hinzufügen...',
'Dobavlyat\'...',
],
[
'Entfernen',
'Udalyat\'',
],
[
'Blockierte Benutzer',
'Zablokirovannyye pol\'zovateli',
],
[
'NuoFlix 2.0',
'NuoFlix 2.0',
],
[
'Kommentare filtern',
'Fil\'trovat\' kommentarii',
],
[
'Suche:',
'Poisk teksta:',
],
[
'Erweiterte Filteroptionen',
'Rasshirennyye parametry fil\'tra',
],
[
'Muss alle Wörter enthalten',
'Dolzhen soderzhat\' vse slova',
],
[
'nach Datum:',
'po date:',
],
[
'nach Benutzer:',
'pol\'zovatelem:',
],
[
'Einzufügendes Element:',
'Element dlya vstavki:',
],
[
'Referenz-Element:',
'Spravochnyy element:',
],
[
'Verwendete Methode:',
'Ispol\'zuyemyy metod',
],
[
'Element kann nicht vor dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!',
'Element ne mozhet byt\' vstavlen pered ssylochnym elementom, yesli u nego net roditel\'skogo elementa!',
],
[
'Element kann nicht nach dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!',
'Element nel\'zya vstavit\' posle ssylochnogo elementa, yesli u nego net roditel\'skogo elementa!',
],
[
'Unbekannte Einfüge-Methode angefordert.',
'Zaproshen neizvestnyy metod vstavki.',
],
[
'Ein Custom-Element wurde vor der Initialisierung des globalen Registers eingefügt.\nDas Element konnte daher nicht registriert werden.',
'Pol\'zovatel\'skiy element byl vstavlen do initsializatsii global\'nogo registra.\nPoetomu element ne udalos\' zaregistrirovat\'.',
],
[
'Einstellungen',
'Nastroyki',
],
[
'Sprache:',
'YAzyk:',
],
[
'Ungültiger Datums-Teil in Input',
'Nevernaya chast\' daty vo vkhodnykh dannykh',
],
[
'Ungültiger Zeit-Teil in Input',
'Nedopustimaya chast\' vremeni vo vkhodnykh dannykh',
],
[
'Mehr anzeigen',
'Bol\'she informatsii',
],
[
'Standard-Playlists',
'Standartnyye pleylisty',
],
[
'Favoriten',
'Izbrannoye',
],
[
'Für später gespeichert',
'Ostavit\' na potom',
],
[
'Zuletzt angesehene Videos',
'Nedavno prosmotrennyye video',
],
[
'Eigene Playlists',
'Pol\'zovatel\'skiye pleylisty',
],
[
'Meine Playlists',
'Moi pleylisty',
],
[
'Erstellen',
'Sozdavat\'',
],
[
'Abspielen',
'Igrat\'',
],
[
'Bearbeiten',
'Redaktirovat\'',
],
[
'Löschen',
'Udalit\'',
],
[
'Bestätigen',
'Podtverzhdat\'',
],
[
'Abbrechen',
'Otmena',
],
[
'Filter zurücksetzen',
'sbrosit\' fil\'tr',
],
    ])
  ],
]);
Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function(type, listener, options) {
  if (options === undefined) options = false;
  this._addEventListener(type, listener, options);
  if (!this.eventListenerList) this.eventListenerList = [];
  if (!this.eventListenerList[type]) this.eventListenerList[type] = [];
  this.eventListenerList[type].push({ listener: listener, options: options });
};
Element.prototype._removeEventListener = Element.prototype.removeEventListener;
Element.prototype.removeEventListener = function(type, listener, options) {
  if (options === undefined) options = false;
  this._removeEventListener(type, listener, options);
  if (!this.eventListenerList) this.eventListenerList = [];
  if (!this.eventListenerList[type]) this.eventListenerList[type] = [];
  const list = this.eventListenerList[type];
  for (let i = 0; i < list.length; i++) {
    if (this.eventListenerList[type][i].listener === listener && this.eventListenerList[type][i].options === options) {
      this.eventListenerList[type].splice(i, 1);
      break;
    }
  }
  if (this.eventListenerList[type].length === 0) delete this.eventListenerList[type];
};
Element.prototype.getEventListeners = function(type) {
  if (!this.eventListenerList) this.eventListenerList = [];
  const result = this.eventListenerList[type];
  return result ? result.sort() : [];
};
Element.prototype.prependEventListener = function(type, listener, options = null) {
  if (!options) options = false;
  const existingListeners = Array.from(this.getEventListeners(type));
  for (let i=0; i<existingListeners.length; i++) this.removeEventListener(type, existingListeners[i]['listener'], existingListeners[i]['options']);
  this.addEventListener(type, listener, options);
  for (let i=0; i<existingListeners.length; i++) this.addEventListener(type, existingListeners[i]['listener'], existingListeners[i]['options']);
}
Array.prototype.deleteByIndex = function(index) {
  const oldEntries = Array.from(this);
  while(this.length > 0) this.pop();
  let found = false;
  for (let i = 0; i < oldEntries.length; i++) {
    if (i === index) {
      found = true;
      continue;
    }
    this.push(oldEntries[i]);
  }
  return found;
}
Array.prototype.deleteByValue = function(value, limit = null) {
  const oldEntries = Array.from(this);
  while(this.length > 0) this.pop();
  let counter = 0;
  for (const item of oldEntries) {
    if (item === value) {
      counter++;
      if (limit) {
        if (counter <= limit) continue;
      } else {
        continue;
      }
    }
    this.push(item);
  }
  return counter !== 0;
}
String.sprintf = function(format) {
  const args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] !== typeof undefined ? args[number].toString() : match;
  });
};
String.prototype.parseHTML = function(deleteLineBreaks = true) {
  let t = document.createElement('template');
  t.innerHTML = deleteLineBreaks ? this.replaceAll(/([^"'])[\n\r\s]*[\n\r][\n\r\s]*([^"'])/g, "$1$2") : this;
  return t.content;
};
Map.prototype.deleteByValue = function(value, limit = null) {
  let deleted = 0;
  limit = parseInt(limit);
  for (const entry of this.entries()) {
    if (value === entry[1]) {
      if (typeof limit === 'number' && deleted >= limit ) return deleted;
      this.delete(entry[0]);
      deleted++;
    }
  }
  return deleted;
};
Map.prototype.hasValue = function(value) {
  for (const entry of this.entries()) {
    if (value === entry[1]) return true;
  }
  return false;
};
Map.prototype.getKeysByValue = function(value) {
  let keys = [];
  for (const entry of this.entries()) {
    if (value === entry[1]) keys.push(entry[0]);
  }
  return keys;
};
const mergeArraysDistinct = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a];
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}
function isJson(item) {
  let value = typeof item !== 'string' ? JSON.stringify(item) : item;
  try {
    value = JSON.parse(value);
  } catch (e) {
    return false;
  }
  return typeof value === 'object' && value !== null;
}
function get_value(key, global = false) {
  if (typeof GM_setValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_setValue'), 'fatal');
  if (typeof GM_getValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_getValue'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  let val = GM_getValue(key) ?? null;
  if (isJson(val)) val = JSON.parse(val);
  return val ?? '';
}
function set_value(key, value, global = false) {
  if (typeof GM_setValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_setValue'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  if (isJson(value)) {
    try {
      value = JSON.stringify(value);
    } catch (e) {
      const msg = t('Warnung!\nEs wurde versucht, ein nicht serialisierbares Objekt zu speichern!\nDas Skript wird versuchen, es als einfaches Objekt zu speichern, aber die Daten könnten beschädigt werden!');
      log(msg, 'warn', [t('Aufgetreten in {0}', 'set_value()'), this]);
    }
  }
  GM_setValue(key, value);
}
function has_value(key, global = false) {
  if (typeof GM_listValues !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_listValues'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  return GM_listValues().indexOf(key) >= 0;
}
function delete_value(key, global = false) {
  if (typeof GM_deleteValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_deleteValue'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  GM_deleteValue(key);
}
function list_values(global = false) {
  if (typeof GM_listValues !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_listValues'), 'fatal');
  if (typeof GM_getValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_getValue'), 'fatal');
  let result = [];
  for (const key of GM_listValues()) {
    let k = key;
    if (!key.startsWith(CACHE_KEY + '_')) {
      if (!global) continue;
    } else {
      if (!global) k = k.replace(CACHE_KEY + '_', '');
    }
    let value = GM_getValue(key);
    if (isJson(value)) value = JSON.parse(value);
    result.push({ key: k, value: (value ?? '') });
  }
  return result;
}
function log(msg, type = 'log', context = [], prefix = MSG_PREFIX) {
  msg = (prefix ? `[${prefix}]\n` : '') + (msg || '');
  if (context && typeof context.forEach !== 'function') context = [context];
  if (context.length) msg += '\n\nCONTEXT:';
  context.forEach( x => { msg += '\n\n' + x; } );
  if (!console && type !== 'dialog') return;
  switch (type) {
    case 'info': if (console.info) console.info(msg); return;
    case 'warn': if (console.warn) console.warn(msg); return;
    case 'debug': if (console.debug) console.debug(msg); return;
    case 'error': if (console.error) console.error(msg); return;
    case 'exception': if (console.exception) console.exception(msg); return;
    case 'dialog': if (alert) alert(msg); return;
    case 'fatal': throw msg;
    case 'log': default: if (console.log) console.log(msg);
  }
}
function t(string, ...args) {
  const lang = activeLanguage || defaultLanguage;
  if (!i18n.has(lang) || !i18n.get(lang).has(string)) return String.sprintf(string, ...args);
  return String.sprintf(i18n.get(lang).get(string), ...args);
}
function getNextSiblingCount(element) {
  let cnt = 0;
  let lastSibling = element;
  while (lastSibling.nextElementSibling) {
    lastSibling = lastSibling.nextElementSibling;
    cnt++;
  }
  return cnt;
}
function countElementLines(element) {
  return Math.floor(element.offsetHeight / parseInt(window.getComputedStyle(element).lineHeight));
}
function debounce(fnc, delay) {
  clearTimeout(fnc._tId);
  fnc._tId = setTimeout(function(){ fnc();}, delay);
}
function getActiveRoute() {
  for (const route of pageRoutes.entries()) {
    if (window.location.pathname.match(new RegExp(`^${route[0]}/*$`, 'i'))) return route[1];
  }
  return '';
}
class InsertionService {
  static AsFirstChild = new InsertionService('AsFirstChild');
  static AsLastChild = new InsertionService('AsLastChild');
  static Before = new InsertionService('Before');
  static After = new InsertionService('After');
  constructor(name = '') { this.name = name }
  static insert(element, refElement, method) {
    const buildLogContext = function() {
      return [
        t('Einzufügendes Element:'), element,
        t('Referenz-Element:'), refElement,
        t('Verwendete Methode:'), method.name
      ];
    }
    switch (method) {
      case this.AsFirstChild:
        if (refElement.hasChildNodes()) {
          refElement.insertBefore(element, refElement.childNodes[0]);
          break;
        }
        refElement.appendChild(element);
        break;
      case this.AsLastChild:
        refElement.appendChild(element);
        break;
      case this.Before:
        if (refElement.parentElement) {
          refElement.parentElement.insertBefore(element, refElement);
          break;
        }
        log(t('Element kann nicht vor dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!'), 'error', buildLogContext());
        break;
      case this.After:
        if (refElement.parentElement) {
          refElement.nextSibling
            ? refElement.parentElement.insertBefore(element, refElement.nextSibling)
            : refElement.parentElement.appendChild(element);
          break;
        }
        log(t('Element kann nicht nach dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!'), 'error', buildLogContext());
        break;
      default:
        log(t('Unbekannte Einfüge-Methode angefordert.'), 'error', buildLogContext());
    }
  }
}
function addToDOM(element, refElement, method, register = true, registerId = null) {
  if (typeof refElement === 'string' ) refElement = document.getElementById(refElement);
  let insertedElements = [];
  if (element instanceof DocumentFragment) {
    if (element.childElementCount === 0) return element.children[0];
    for (const rootElement of element.children) {
      rootElement.setAttribute('data-customElement', 'true');
      insertedElements.push(rootElement);
    }
    if (element.childElementCount === 1) insertedElements = element.children[0];
  } else if (element instanceof HTMLElement || element instanceof Node) {
    element.setAttribute('data-customElement', 'true');
    insertedElements = element;
  }
  InsertionService.insert(element, refElement, method);
  if (register) {
    if (!registerId) registerId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    if (!customElementsRegister) {
      log(t('Ein Custom-Element wurde vor der Initialisierung des globalen Registers eingefügt.\nDas Element konnte daher nicht registriert werden.'), 'warn', [ element ]);
      return insertedElements;
    }
    customElementsRegister.set(registerId, insertedElements);
  }
  return insertedElements;
}
function removeFromDOM(elementOrId) {
  const removeElement = function (elem) {
    if (elem instanceof HTMLElement || elem instanceof Node) {
      if (customElementsRegister) customElementsRegister.deleteByValue(elem, 1);
      if (disabledPrimalElementsRegister && !elem.hasAttribute('data-customElement')) {
        disabledPrimalElementsRegister.deleteByValue(elem, 1);
      }
      elem.remove();
      return true;
    }
    if (customElementsRegister && customElementsRegister.has(elem)) {
      const element = customElementsRegister.get(elem);
      if (element instanceof HTMLElement || element instanceof Node) element.remove();
      customElementsRegister.delete(elem);
      return true;
    }
    elem = document.getElementById(elem);
    if (elem) {
      if (customElementsRegister) customElementsRegister.deleteByValue(elem, 1);
      if (disabledPrimalElementsRegister && !elem.hasAttribute('data-customElement')) {
        disabledPrimalElementsRegister.deleteByValue(elem, 1);
      }
      elem.remove();
      return true;
    }
    return false;
  }
  if (elementOrId instanceof Array) {
    let hadInvalidItems = false;
    for (const item of elementOrId) {
      if (!removeElement(item)) hadInvalidItems = true;
    }
    return hadInvalidItems;
  } else if (elementOrId instanceof DocumentFragment) {
    const rootNodes = elementOrId.children;
    if (rootNodes.length === 0) {
      return false;
    } else if (rootNodes.length === 1) {
      return removeElement(rootNodes[0]);
    } else {
      let hadInvalidItems = false;
      for (const item of elementOrId) {
        if (!removeElement(item)) hadInvalidItems = true;
      }
      return hadInvalidItems;
    }
  }
  return removeElement(elementOrId);
}
function disablePrimalElement(elementOrId, registerId = null) {
  const apply = function(id, element) {
    element.classList.add('forceHidden');
    if (disabledPrimalElementsRegister) {
      if (!id) id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      disabledPrimalElementsRegister.deleteByValue(element, 1);
      disabledPrimalElementsRegister.set(id, element);
    }
    return true;
  };
  if (elementOrId instanceof HTMLElement || elementOrId instanceof Node) return apply(registerId, elementOrId);
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) return apply(registerId, elementOrId);
  if (disabledPrimalElementsRegister.has(elementOrId)) return apply(elementOrId, disabledPrimalElementsRegister.get(elementOrId));
  return false;
}
function enablePrimalElement(elementOrId) {
  if (elementOrId instanceof HTMLElement || elementOrId instanceof Node) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    elementOrId.classList.remove('forceHidden');
    return true;
  }
  if (disabledPrimalElementsRegister && disabledPrimalElementsRegister.has(elementOrId)) {
    const element =  disabledPrimalElementsRegister.get(elementOrId);
    element.classList.remove('forceHidden');
    return true;
  }
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    elementOrId.classList.remove('forceHidden');
    return true;
  }
  return false;
}
function registerStaticTranslatable(element, text = '', args = []) {
  if (!(element instanceof HTMLElement)) {
    for (const entry of element) {
      if (!staticTranslatableElements.has(entry['element'])) staticTranslatableElements.set(entry['element'], { text: entry['text'] ?? text, args: entry['args'] ?? args });
    }
    return;
  }
  if (!staticTranslatableElements.has(element)) staticTranslatableElements.set(element, { text: text, args: args });
}
function doChangeMainSwitch(toggleState = false) {
  if (toggleState) {
    mainSwitchState = !mainSwitchState;
    set_value('scriptEnabled', mainSwitchState);
  }
  for (const element of customElementsRegister.values()) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? entry.classList.remove('forceHidden') : entry.classList.add('forceHidden');
    } else {
      this.checked ? element.classList.remove('forceHidden') : element.classList.add('forceHidden');
    }
  }
  const register = Array.from(disabledPrimalElementsRegister.values());   
  for (const element of register) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? disablePrimalElement(entry) : enablePrimalElement(entry);
    } else {
      this.checked ? disablePrimalElement(element) : enablePrimalElement(element);
    }
  }
}
function updateStaticTranslations() {
  for (const element of staticTranslatableElements.entries()) element[0].innerText = t(element[1].text, element[1].args);
}
function iFrameReady(iframe, fn) {
  let timer;
  let fired = false;
  function ready() {
    if (!fired) {
      fired = true;
      clearTimeout(timer);
      fn.call(this);
    }
  }
  function readyState() {
    if (this.readyState === 'complete') ready.call(this);
  }
  function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
      return elem.addEventListener(event, fn);
    } else {
      return elem.attachEvent('on' + event, function () { return fn.call(elem, window.event); });
    }
  }
  addEvent(iframe, 'load', function () { ready.call(iframe.contentDocument || iframe.contentWindow.document); });
  function checkLoaded() {
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    if (doc.URL.indexOf('about:') !== 0) {
      if (doc.readyState === 'complete') {
        ready.call(doc);
      } else {
        addEvent(doc, 'DOMContentLoaded', ready);
        addEvent(doc, 'readystatechange', readyState);
      }
    } else {
      timer = setTimeout(checkLoaded, 1);
    }
  }
  checkLoaded();
}
function getPlaylistObjectById(playlistId) {
  if (!playlistData) return null;
  if (typeof playlistId === 'string') playlistId = parseInt(playlistId);
  for (const playlist of playlistData) {
    if (typeof playlist.id === 'string') playlist.id = parseInt(playlist.id);
    if (playlist.id === playlistId) return playlist;
  }
  return null;
}
function addVideoToPlaylist(videoObject, playlist) {
  if (typeof playlist === 'number' || typeof playlist === 'string') playlist = getPlaylistObjectById(playlist);
  if (!(playlist) || typeof videoObject !== 'object') return;
  const oldId = isVideoInPlaylist(videoObject.id, playlist);
  if (oldId !== false) playlist.items.deleteByIndex(oldId);
  playlist.items.push(videoObject);
  if (playlist.max_items !== -1 && playlist.items.length > playlist.max_items) playlist.items.shift();
  playlist.item_cnt = playlist.items.length;
  set_value('playlistData', playlistData);
}
function removeVideoFromPlaylist(video, playlist) {
  if (typeof video === 'object') video = video.id;
  if (typeof video === 'string') video = parseInt(video);
  if (typeof playlist !== 'object') playlist = getPlaylistObjectById(playlist);
  if (!(playlist) || !(video)) return;
  let index;
  for (let i = 0; i < playlist.items.length; i++) {
    if (parseInt(playlist.items[i].id) === video) {
      index = i;
      break;
    }
  }
  playlist.items.deleteByIndex(index);
  playlist.item_cnt = playlist.items.length;
  set_value('playlistData', playlistData);
}
function isVideoInPlaylist(video, playlist) {
  if (typeof video === 'object') video = video.id;
  if (typeof video === 'string') video = parseInt(video);
  if (typeof playlist !== 'object') playlist = getPlaylistObjectById(playlist);
  if (!(playlist) || !(video)) return false;
  for (let i = 0; i < playlist.items.length; i++) {
    if (parseInt(playlist.items[i].id) === video) return i;
  }
  return false;
}
function DEBUG_setSomeFakeData(commentData) {
  commentData[0].hasNewReplies = true;
  commentData[0].reply_cnt = 7;
  commentData[0].replies.push({
    id: 1,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:32",
    text: "Fake Reply 1",
    isNew: false
  });
  commentData[0].replies.push({
    id: 2,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:33",
    text: "Fake Reply 2",
    isNew: false
  });
  commentData[0].replies.push({
    id: 3,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:35",
    text: "Fake Reply 3",
    isNew: false
  });
  commentData[0].replies.push({
    id: 4,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:37",
    text: "Fake Reply 4",
    isNew: false
  });
  commentData[0].replies.push({
    id: 5,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:42",
    text: "Fake Reply 5",
    isNew: false
  });
  commentData[0].replies.push({
    id: 6,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:51",
    text: "Fake Reply 6",
    isNew: true
  });
  commentData[0].replies.push({
    id: 7,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:59",
    text: "Fake Reply 7",
    isNew: true
  });
  commentData[2].txt_id = "3532102";
  commentData[2].btn_id = "265045";
  commentData[2].isNew = true;
  commentData[21].btn_id = "34384351";
  commentData[21].txt_id = "2628524";
  commentData[21].reply_cnt = 3;
  commentData[21].isNew = true;
  commentData[21].hasNewReplies = true;
  commentData[21].replies.push({
    id: 2,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "26.10.2023 02:32",
    text: "Fake Kommentar A",
    isNew: true
  });
  commentData[21].replies.push({
    id: 3,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "27.10.2023 12:47",
    text: "Fake Kommentar B",
    isNew: true
  });
  commentData[57].btn_id = "20070645";
  commentData[57].txt_id = "2092673";
  commentData[57].isNew = true;
  commentData[58].btn_id = "19916547";
  commentData[58].txt_id = "2110215";
  commentData[58].reply_cnt = 3;
  commentData[58].isNew = true;
  commentData[58].hasNewReplies = true;
  commentData[58].replies.push({
    id: 3,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "03.01.2023 21:15",
    text: "Fake Kommentar C",
    isNew: true
  });
  commentData[69].btn_id = "17036547";
  commentData[69].txt_id = "1904231";
  commentData[69].isNew = true;
  commentData[70].btn_id = "16984123";
  commentData[70].txt_id = "1921871";
  commentData[70].isNew = true;
  commentData[70].hasNewReplies = true;
  commentData[70].replies.push({
    id: 1,
    pic: "/userpic/631291d3504cf631291cad646drosenkreuzer559x5571.png",
    user: "stuck1a",
    date: "11.10.2023 15:01",
    text: "Fake Kommentar D (hatte davor keine Replies)",
    isNew: true
  });
  return commentData;
}
function getOriginalCommentIds(which) {
    const elem = document.getElementById('originalCommentContainer').children[which-1].lastElementChild.lastElementChild.lastElementChild.lastElementChild;
    const txt_id = elem.getAttribute('data-reply');
    const btn_id = elem.getAttribute('data-id');
    const text = (elem.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerText).substring(0,50) + '...'
    return { commentNr: which, txt_id: txt_id, btn_id: btn_id, text: text };
}
  addToDOM(`<style>:root {
  --theme-color: #d53d16;
}
@-moz-keyframes spinR { 100% { -moz-transform: rotate(360deg); } }
@-webkit-keyframes spinR { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spinR { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
@-moz-keyframes spinL { 100% { -moz-transform: rotate(-360deg); } }
@-webkit-keyframes spinL { 100% { -webkit-transform: rotate(-360deg); } }
@keyframes spinL { 100% { -webkit-transform: rotate(-360deg); transform:rotate(-360deg); } }
.spinRightOnHover:hover {
  --duration: 1s;
  -webkit-animation: spinR var(--duration) linear infinite;
  -moz-animation: spinR var(--duration) linear infinite;
  animation: spinR var(--duration) linear infinite;
}
.spinLeftOnHover:hover {
  --duration: 1s;
  -webkit-animation: spinL var(--duration) linear infinite;
  -moz-animation: spinL var(--duration) linear infinite;
  animation: spinL var(--duration) linear infinite;
}
.stretchToParent {
  height: 100%;
  width: 100%;
}
.clickable {
  cursor: pointer;
}
.unselectable {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  /* For IE9- support add attribute unselectable="on" */
}
.container-fluid, .container-fluid *, .container-fluid *::before, .container-fluid *::after { box-sizing: border-box }
.container-fluid { box-sizing: border-box; width: 100%; margin-inline: auto; padding: 0 }
.row { display: flex; flex-wrap: wrap }
.row > * { flex-shrink: 0; max-width: 100%; width: 100% }
.col-auto,.col-1,.col-2,.col-3,.col-4,.col-5,.col-6,.col-7,.col-8,.col-9,.col-10,.col-11,.col-12 { flex: 0 0 auto }
.col-auto { width: auto }
.col { flex: 1 0 0 }
.col-1 { width: 8.33333333% }
.col-2 { width: 16.66666667% }
.col-3 { width: 25% }
.col-4 { width: 33.33333333% }
.col-5 { width: 41.66666667% }
.col-6 { width: 50% }
.col-7 { width: 58.33333333% }
.col-8 { width: 66.66666667% }
.col-9 { width: 75% }
.col-10 { width: 83.33333333% }
.col-11 { width: 91.66666667% }
.col-12 { width: 100% }
.forceHidden { display: none !important }
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  word-wrap: break-word;
  background-clip: border-box;
  border: 1px solid #949296;
  border-radius: .25rem;
  padding: .75rem;
}
.card-body { flex: 1 1 auto; padding: 1rem 1rem }
.card-group { margin-block: 1rem; }
.card-group > .card { margin-bottom: 1rem; }
.card-group > .card ~ .card {
  margin-left: 1rem;
}
.card legend {
  padding-inline: .5rem;
  text-align: center;
}
input[type="date"] {
  display: inline-block;
  margin: 7px 0 15px 0;
  padding: 10px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}
.btn-small {
  font-size: .75rem;
  padding: .2rem .75rem;
}
.btn:not(.disabled):hover {
  filter: brightness(1.5);
  -webkit-filter: brightness(1.5);
}
.btn[data-content]:before {
  content: attr(data-content);
}
.clearfix::after {
  content: "";
  clear: both;
  display: table;
}
.disabled {
  filter: brightness(.5) !important;
  -webkit-filter: brightness(.5) !important;
  cursor: default !important;
  pointer-events: none;
}
.customDropdown {
  --borderColor: #555;
  --borderWidth: 1px;
  --totalWidth: 8rem;
  width: var(--totalWidth);
  height: 2rem;
  margin-left: auto;
  color: var(--theme-color);
  cursor: pointer;
  border: var(--borderWidth) solid var(--borderColor);
  border-top-left-radius: 1px;
  border-bottom: 0;
}
.customDropdown:hover > .customDropdownToggler > span:last-of-type  {
  transform: rotate(90deg);
}
.customDropdownToggler {
  position: absolute;
  height: inherit;
  width: inherit;
  background: linear-gradient(to left, var(--borderColor) var(--borderWidth), var(--theme-color) var(--borderWidth), var(--theme-color) 1.75rem, #fcfcfc 1.75rem);
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: 1px;
  border-bottom: var(--borderWidth) solid var(--borderColor);
}
.customDropdownToggler:hover + .customDropdownMenu,
.customDropdownMenu:hover {
  display: block;
}
.customDropdownToggler > span {
  width: calc(100% - 1.75rem);
  display: flex;
  height: inherit;
  padding-left: .4rem;
  align-items: center;
}
.customDropdown_ActiveVal {
  border: var(--borderWidth) solid var(--borderColor);
  border-bottom-width: 0;
}
.customDropdownToggler > span:last-of-type {
  border-radius: 1px 1px 0 0;
  width: 1.5rem;
  text-align: center;
  color: #fcfcfc;
  transition: transform .15s ease-in-out;
  position: relative;
  padding-left: calc(2*var(--borderWidth));
  justify-content: center;
}
.customDropdownMenu {
  position: relative;
  top: 100%;
  border-radius: 0 0 1px 1px;
  border: var(--borderWidth) solid var(--borderColor);
  left: calc(0px - var(--borderWidth));
  max-width: unset;
  width: calc(100% + 3*var(--borderWidth));
  display: none;
}
.customDropdownMenu > div {
  background-color: #252525;
  font-weight: bold;
  padding-left: .4rem;
  padding-block: .2rem;
  display: flex;
  align-items: center;
  padding-top: .2rem;
  border-top: var(--borderWidth) solid var(--borderColor);
}
.customDropdownMenu > div:hover {
  background-color: #f0cbc2;
}
.customDropdownMenu svg {
  margin-right: .6rem;
  height: 1rem;
  width: 2rem;
}
.svgColorized { --color: var(--theme-color); }
.svgColorized .svgColoredFill { fill: var(--color) }
.svgColorized .svgColoredStroke { stroke: var(--color) }
.playlistItem {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}
.playlistItem span:first-child {
  max-width: 90%;
  overflow-x: hidden;
  text-overflow: ellipsis;
}</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>
.flipflop {
  --_width: var(--width, 3rem);
  --_speed: var(--speed, 0.4s);
  --_color-thumb: var(--color-thumb, #fff);
  --_color-on: var(--color-on, #2196f3);
  --_color-off: var(--color-off, #ccc);
  --_label-offset: var(--label-offset, 1rem);
  --padding-thumb: calc(var(--_width)*.0666666667);
  --height: calc(var(--_width)/2 + var(--padding-thumb));
  --size-thumb: calc(var(--height) - 2*var(--padding-thumb));
  display: inline-flex;
  align-items: center;
}
.flipflop > label {
  display: inline-block;
  position: relative;
  width: var(--_width);
  height: var(--height);
  padding: unset !important;
}
.flipflop > label input {
  opacity: 0;
  width: 0;
  height: 0;
}
.flipflop > label > span {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--_color-off);
  -webkit-transition: var(--_speed);
  transition: var(--_speed);
}
.flipflop > label > span:before {
  position: absolute;
  content: "";
  height: var(--size-thumb);
  width: var(--size-thumb);
  left: var(--padding-thumb);
  bottom: var(--padding-thumb);
  background-color: var(--_color-thumb);
  -webkit-transition: var(--_speed);
  transition: var(--_speed);
}
.flipflop > label > input:checked + span {
  background-color: var(--_color-on);
}
.flipflop input:focus + span {
  box-shadow: 0 0 1px var(--_color-on);
}
.flipflop > label > input:checked + span:before {
  -webkit-transform: translateX(var(--size-thumb));
  -ms-transform: translateX(var(--size-thumb));
  transform: translateX(var(--size-thumb));
}
.flipflop > label > span {
  border-radius: calc(var(--height));
}
.flipflop > label > span:before {
  border-radius: 50%;
}</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
 let mainSwitchState;
 let customElementsRegister = new Map();
 let disabledPrimalElementsRegister = new Map();
 let staticTranslatableElements = new Map();
 let playlistData = has_value('playlistData') ? get_value('playlistData') : defaultPlaylists;
 let activeLanguage = has_value('setting_language') ? get_value('setting_language') : defaultLanguage;
 let commentFilters = new Map([
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],
    [ 'filterSkipUser', { active: false, value: [] } ],
    [ 'filterTextSearch', { active: false, value: [] } ],
    [ 'filterDateRange', { active: false, value: [] } ],
  ]);
  /* add switch to header which enables/disables all features of this Userscript */
  if (has_value('scriptEnabled')) {
    mainSwitchState = get_value('scriptEnabled');
  } else {
    set_value('scriptEnabled', true);
    mainSwitchState = true;
  }
 const mainSwitch = `
    <div style="position: relative;top: -35px;left: 6rem;display: inline-flex;">
      <div class="flipflop" style="--color-on: var(--theme-color);">
        <span id="mainSwitchLabel" style="padding-right: 1rem;"></span>
        <label><input id="mainSwitch" type="checkbox" ${mainSwitchState ? 'checked="checked" ' : ''}/><span></span></label>
      </div>
    </div>
  `.parseHTML();
  addToDOM(mainSwitch, document.getElementById('header').lastElementChild, InsertionService.AsLastChild, false);
  registerStaticTranslatable(document.getElementById('mainSwitchLabel'), 'NuoFlix 2.0', []);
  document.getElementById('mainSwitch').addEventListener('change', doChangeMainSwitch);
  const route = getActiveRoute();
  if (route === 'start') {
    (function() {
execute_startPage();
function execute_startPage() {
  updateStaticTranslations()
} })();
  } else if (route === 'profile') {
    (function() {
 const maxCommentHeightBeforeCut = 250;
 let commentData;
 let storedCommentData;
 let totalComments;
 let paginationContainer, paginationContainerBottom;
 let paginationControlContainer, paginationControlContainerBottom;
 let customCommentContainer, originalCommentContainer;
 let currentStart = defaultStart;
 let currentLength = has_value('commentsPerPage') ? get_value('commentsPerPage') : defaultLength;
 let filteredCommentsCount = 0;
 let enhancedUiContainer = `<div id="enhancedUi" class="container-fluid">
    <div id="enhancedUiHeadlineHolder" class="rowHeadlineHolder">
      <div class="rowHeadlineBreakerLeft breakerHeight">&nbsp;</div>
      <div class="rowHeadlineHolderItem headerTxt">
        <h2 id="pluginHeadline"></h2>
      </div>
      <div class="rowHeadlineBreakerRight breakerHeight">&nbsp;</div>
    </div>  
    <div class="row card-group">
      <fieldset class="card col-4">
        <legend id="ignoredLabel"></legend>
        <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
        <div class="row">
          <div class="col-auto">
            <a id="addIgnoreUser" class="btn btn-small"></a>
          </div>
          <div class="col-1" style="flex-grow: 1;"></div>
          <div class="col-auto">
            <a id="deleteIgnoreUser" class="btn btn-small disabled"></a>
          </div>
        </div>
      </fieldset>
      <fieldset class="card col">
        <legend id="filterLabel"></legend>
        <div class="row">
          <label class="row col-2" for="filterByText" style="display: flex; flex-wrap: nowrap;">
              <span id="searchInputLabel"></span>
              <span id="revertFilterTextInput" class="forceHidden clickable revertBtn" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
                <svg class="svgColorized spinLeftOnHover stretchToParent" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000">
                  <path class="svgColoredStroke" fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/>
                  <path class="svgColoredFill" fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/>
                </svg>
              </span>
          </label>
          <input id="filterByText" type="text" name="filterByText" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger"></summary>
          <div class="clearfix"></div>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <div class="flipflop col-12" style="--color-on: #e86344;margin-top: 1rem;">
                <span id="useAndLogicLabel" class="col-5"></span>
                <label><input id="filterAllWords" type="checkbox" checked="checked" /><span></span></label>
              </div> 
            </li>
            <li>
              <div class="flipflop col-12" style="--color-on: #e86344;margin-top: 1rem;">
                <span id="filterOnlyNewLabel" class="col-5"></span>
                <label><input id="filterOnlyNew" type="checkbox" /><span></span></label>
              </div> 
            </li>
            <li class="row" style="margin-top: 1rem;">
              <label class="row col-5" for="filterByUser" style="display: flex; flex-wrap: nowrap;">
                <span id="searchByUserLabel"></span>
                <span id="revertFilterUserInput" class="forceHidden clickable revertBtn" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
                  <svg class="svgColorized spinLeftOnHover stretchToParent" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000">
                    <path class="svgColoredStroke" fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/>
                    <path class="svgColoredFill" fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/>
                  </svg>
                </span>
              </label>
              <div class="col">
                <input id="filterByUser" list="availableUsers" type="text" name="filterByUser" />
              </div>
              <div id="filteredUserList" class="row"></div>
            </li>
            <li class="row">
              <label class="row col-5" for="filterByDateFrom" style="display: flex; flex-wrap: nowrap;">
                <span id="searchByDateLabel"></span>
                <span id="revertDateRangeInputs" class="forceHidden clickable revertBtn" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
                  <svg class="svgColorized spinLeftOnHover stretchToParent" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000">
                    <path class="svgColoredStroke" fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/>
                    <path class="svgColoredFill" fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/>
                  </svg>
                </span>
              </label>
              <div class="col" style="justify-content: space-between;display: flex;padding-inline-end: .4rem;">
                <input id="filterByDateFrom" type="date" name="filterByDateFrom" />
                <label for="filterByDateTo" style="padding-block: .75rem;">-</label>
                <input id="filterByDateTo" type="date" name="filterByDateTo" />
              </div>
            </li>   
          </ul>
        </details>
      </fieldset>
    </div>
    <div class="row card-group">
      <fieldset id="playlistContainer" class="card col-6">
        <legend id="playlistLabel"></legend>
        <div class="row">
          <div class="col-auto"><a id="createPlaylist" class="btn btn-small playlistButton"></a></div>
          <div class="col-auto"><a id="startPlaylist" class="btn btn-small playlistButton disabled"></a></div>
          <div class="col-auto"><a id="editPlaylist" class="btn btn-small playlistButton disabled"></a></div>
          <div class="col-auto"><a id="deletePlaylist" class="btn btn-small playlistButton disabled"></a></div>       
        </div>
      </fieldset>
      <fieldset id="settingsContainer" class="card col">
        <legend id="settingsLabel"></legend>
        <div id="settingsLanguage" class="row">
          <label id="settingsLanguageLabel" class="col-5"></label>
        </div>
      </fieldset>
    </div>
  </div>`.parseHTML();
execute_profilePage();
function execute_profilePage() {
  const style_comments = `
<style id="style_newComment">
  .${cssClassNewComments} {
  background-color: ${highlightedCommentsColor};
}
</style>
<style id="style_hasNewReply">
  .${cssClassHasNewReplies} {
  background-color: ${highlightedHasNewRepliesColor};
}
</style>
<style id="style_newReply">
  .${cssClassNewReplies} {
  background-color: ${highlightedRepliesColor};
}
</style>
`.parseHTML();
  addToDOM(`<style>#ignoredUsers {
  width: 100%;
}
#paginationContainer {
  text-align: center;
  margin-top: .8rem;
}
#paginationContainerBottom {
  text-align: center;
  margin-bottom: 1rem;
}
#paginationNext {
  margin-inline: 0.2rem !important;
  padding-inline: 2rem;
  border-radius: 10% 25% 25% 10%;
}
#paginationLast {
  border-radius: 20% 50% 50% 20%;
  padding-inline: 1rem;
  padding-block: 0 !important;
  margin-inline-start: 0 !important;
}
#paginationBack {
  margin-inline: 0.2rem !important;
  padding-inline: 2rem;
  border-radius: 25% 10% 10% 25%;
}
#paginationFirst {
  border-radius: 50% 20% 20% 50%;
  padding-inline: 1rem;
  padding-block: 0 !important;
  margin-inline-start: 0 !important;
}
.paginationButtonGroup {
  display: inline-block;
}
.pageNrBtn {
  padding-inline: max(1vw, 10px);
  margin-inline: .25rem !important;
}
.pageNrBtn.activePage {
  cursor: default !important;
  font-weight: bold !important;
  background-color: var(--theme-color) !important;
  filter: brightness(.5) !important;
  -webkit-filter: brightness(.5) !important;
}
#paginationControl {
  margin-bottom: .5rem;
}
#paginationControl, #paginationControlBottom {
  display: flow-root;
}
#commentsFromToContainer, #commentsFromToContainerBottom {
  float: left;
}
#commentsPerPageContainer, #commentsPerPageContainerBottom {
  float: right;
  display: flex;
}
#commentsPerPageContainer small, #commentsPerPageContainerBottom small {
  align-self: center;
  white-space: pre;
  margin-inline-end: .75rem;
}
#commentsPerPageContainer .select, #commentsPerPageContainerBottom .select {
  background-color: #eee;
  margin-block: auto;
  padding: .4rem;
  font-size: .75rem;
  text-align: center;
  text-align-last: center;
}
.msgNoResults {
  margin-block: 2rem;
  text-align: center;
  font-style: italic;
}
.repliesCollapsed .replyContainer:nth-last-child(n+4) {
  display: none;
}
.expander {
  padding-top: 1rem;
  margin-left: 75px;
  margin-bottom: -.5rem;
  cursor: pointer;
  color: var(--theme-color);
}
.expander:hover {
  font-weight: bold;
}
#moreFilterTrigger {
  float: right;
}
#moreFilterTrigger:hover {
  font-weight: bold;
  cursor: pointer;
}
#moreFilterMenu {
  margin-inline-start: 1rem;
}
#enhancedUi label {
  padding-block: .75rem;
}
.selectedUserFilter {
  margin-right: .75rem;
  margin-bottom: .5rem;
  background-color: lightgray;
  padding: .2rem .6rem;
  color: var(--theme-color);
  border-radius: 6px;
  width: auto;
  display: flex;
}
.selectedUserFilter :first-child {
  margin-right: .4rem;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.selectedUserFilter :last-child:after {
  content: "\\2718";
  color: #f00;
}
.selectedUserFilter :last-child:hover {
  cursor: pointer;
  font-weight: bold;
}
#filteredUserList {
  justify-content: end;
}
#settingsLanguage {
  align-items: center;
}
.commentText.hasOverflow,
.replyText.hasOverflow {
  --linesBeforeCut: 10;
  overflow-y: hidden;
  max-height: ${maxCommentHeightBeforeCut}px;
  -webkit-mask-image: linear-gradient(to bottom, #000, #0000);
  mask-image: linear-gradient(to bottom, #000, #0000);
}
.showFullLength {
  padding-bottom: 1rem;
  color: #205bca;
  font-weight: bold;
  margin-top: -.5rem;
}
.showFullLength:hover {
  color: #4e7cd5;
  cursor: pointer;
}
.replyText + .showFullLength {
  padding-bottom: 0;
}
#playlists {
  width: 100%;
}
#playlists optgroup:empty {
  display: none;
}
#playlists option {
  padding-left: 1rem;
}
div:not(:last-child) > .playlistButton {
  margin-right: 1rem;
}
#watchPlaylist_Overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 999999;
}
#watchPlaylist_iframe {
  border: 0;
  height: 100%;
  width: 100%;
}</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(style_comments, document.body, InsertionService.AsLastChild, false);
  enhancedUiContainer = addToDOM(enhancedUiContainer, document.getElementsByClassName('wrapper')[1], InsertionService.AsFirstChild, true, 'enhancedUiContainer');
  registerStaticTranslatable([
    { element: document.getElementById('ignoredLabel'), text: 'Blockierte Benutzer' },
    { element: document.getElementById('addIgnoreUser'), text: 'Hinzufügen...' },
    { element: document.getElementById('deleteIgnoreUser'), text: 'Entfernen' },
    { element: document.getElementById('filterOnlyNewLabel'), text: 'Nur neue Kommentare' },
    { element: document.getElementById('pluginHeadline'), text: 'NuoFlix 2.0' },
    { element: document.getElementById('filterLabel'), text: 'Kommentare filtern' },
    { element: document.getElementById('searchInputLabel'), text: 'Suche:' },
    { element: document.getElementById('moreFilterTrigger'), text: 'Erweiterte Filteroptionen' },
    { element: document.getElementById('useAndLogicLabel'), text: 'Muss alle Wörter enthalten' },
    { element: document.getElementById('searchByUserLabel'), text: 'nach Benutzer:' },
    { element: document.getElementById('searchByDateLabel'), text: 'nach Datum:' },
    { element: document.getElementById('settingsLabel'), text: 'Einstellungen' },
    { element: document.getElementById('settingsLanguageLabel'), text: 'Sprache:' },
    { element: document.getElementById('playlistLabel'), text: 'Meine Playlists' },
    { element: document.getElementById('createPlaylist'), text: 'Erstellen' },
    { element: document.getElementById('startPlaylist'), text: 'Abspielen' },
    { element: document.getElementById('editPlaylist'), text: 'Bearbeiten' },
    { element: document.getElementById('deletePlaylist'), text: 'Löschen' },
  ]);
  for (const user of get_value('ignoredUsers')) {
    addToDOM(`<option>${user}</option>`.parseHTML(), 'ignoredUsers', InsertionService.AsLastChild, false);
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
  }
  originalCommentContainer = document.getElementsByClassName('profilContentInner')[0];
  if (!originalCommentContainer) log(t('DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.'), 'fatal');
  disablePrimalElement(originalCommentContainer, 'originalCommentContainer');
  storedCommentData = get_value('commentData');
  commentData = generateCommentObject();
  commentData = DEBUG_setSomeFakeData(commentData);   
  set_value('commentData', commentData);
  totalComments = commentData.length;
  if (currentLength === 'all') currentLength = totalComments;
  customCommentContainer = addToDOM(
    '<div id="customCommentContainer" class="profilContentInner"></div>'.parseHTML(),
    originalCommentContainer,
    InsertionService.Before,
    true, 
    'customCommentContainer'
  );
  addUserFilterAutocompletionList();
  document.getElementById('filterByUser').addEventListener('keypress', function(ev) {
    if (!ev) ev = window.event;
    let keyCode = ev.code || ev.key;
    if (keyCode === 'Enter' || keyCode === 'NumpadEnter') {
      for (const element of document.getElementById('availableUsers').children) {
        if (element.value === this.value) {
          doAddUserToFilterList(this);
          break;
        }
      }
    }
    else if (keyCode === ',' || keyCode === ' ') {
      this.value = this.value.substring(0, this.value.length - 1);
      for (const element of document.getElementById('availableUsers').children) {
        if (element.value === this.value) {
          doAddUserToFilterList(this);
          break;
        }
      }
    }
  });
  let textFilterDelayActive = false;
  document.getElementById('filterByText').addEventListener('input', function() {
    const revertFilterTextInput = document.getElementById('revertFilterTextInput');
    let textFilter = commentFilters.get('filterTextSearch');
    if (this.value) {
      revertFilterTextInput.classList.remove('forceHidden');
    } else {
      revertFilterTextInput.classList.add('forceHidden');
      textFilter.value = [];
      textFilter.active = false;
    }
    if (!textFilterDelayActive) {
      textFilterDelayActive = true;
      setTimeout(function() {
        textFilterDelayActive = false;
        textFilter.value = this.value.split(' ');
        textFilter.active = true;
        updatePage();
      }.bind(this), 150);
    }
  });
  document.getElementById('filterByDateFrom').addEventListener('input', function() {
    doUpdateDateFilter(this, document.getElementById('filterByDateTo'));
  });
  document.getElementById('filterByDateTo').addEventListener('input', function() {
    doUpdateDateFilter(document.getElementById('filterByDateFrom'), this);
  });
  document.getElementById('filterAllWords').addEventListener('change', function() {
    if (document.getElementById('filterByText').textLength > 0) updatePage();
  });
  document.getElementById('revertDateRangeInputs').addEventListener('click', function() {
    document.getElementById('filterByDateFrom').value = '';
    document.getElementById('filterByDateTo').value = '';
    let filter = commentFilters.get('filterDateRange');
    filter.active = false;
    filter.value = [];
    this.classList.add('forceHidden');
    updatePage();
  });
  document.getElementById('revertFilterUserInput').addEventListener('click', function() {
    const filteredUserList = document.getElementById('filteredUserList');
    while (filteredUserList.firstChild) filteredUserList.removeChild(filteredUserList.lastChild);
    let userFilter = commentFilters.get('filterOnlyUser');
    userFilter.value = [];
    userFilter.active = false;
    addUserFilterAutocompletionList();
    this.classList.add('forceHidden');
    updatePage();
  });
  document.getElementById('revertFilterTextInput').addEventListener('click', function() {
    document.getElementById('filterByText').value = '';
    let textFilter = commentFilters.get('filterTextSearch');
    textFilter.value = [];
    textFilter.active = false;
    this.classList.add('forceHidden');
    updatePage();
  });
  document.getElementById('addIgnoreUser').addEventListener('click', function() {
    let user = prompt(t('Folgenden Benutzer zur Ignorieren-Liste hinzufügen:'));
    if (user) user = user.trim();
    if (user === null || user === '') return;
    const selectElement = document.getElementById('ignoredUsers');
    for (const option of selectElement.children) {
      if (option.innerText === user) return;
    }
    addToDOM(`<option>${user}</option>`.parseHTML(), 'ignoredUsers', InsertionService.AsLastChild, false);
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
    set_value('ignoredUsers', ignoreFilter.value);
    for (const selectedUser of document.getElementById('filteredUserList').children) {
      if (selectedUser.firstElementChild.innerText === user) {
        removeFromDOM(selectedUser);
        break;
      }
    }
    addUserFilterAutocompletionList();
    updatePage();
  });
  document.getElementById('deleteIgnoreUser').addEventListener('click', function() {
    const selectElement = document.getElementById('ignoredUsers');
    if (selectElement.selectedOptions.length > 0) {
      const user = selectElement.selectedOptions[0].innerText.trim();
      selectElement.selectedOptions[0].remove();
      this.classList.add('disabled');
      const ignoreFilter = commentFilters.get('filterSkipUser');
      const oldIgnoreList = ignoreFilter.value;
      ignoreFilter.value = [];
      for (const entry of oldIgnoreList) {
        if (entry !== user) ignoreFilter.value.push(entry);
      }
      if (ignoreFilter.value.length === 0) ignoreFilter.active = false;
      set_value('ignoredUsers', ignoreFilter.value);
      addUserFilterAutocompletionList();
      updatePage();
    }
  });
  document.getElementById('ignoredUsers').addEventListener('change', function() {
    const deleteButton = document.getElementById('deleteIgnoreUser');
    this.selectedIndex === -1 && deleteButton
      ? deleteButton.classList.add('disabled')
      : deleteButton.classList.remove('disabled');
  });
  document.getElementById('filterOnlyNew').addEventListener('change', function() {
    changeFilter('filterOnlyNew', !commentFilters.get('filterOnlyNew').value);
    if (commentFilters.get('filterOnlyNew').active) {
      document.getElementById('style_newComment').innerText = '';
    } else {
      document.getElementById('style_newComment').innerText = `.newComment { background-color: ${highlightedCommentsColor} }`;
    }
  });
  updatePage();
  insertLanguageDropdown();
  initializePlaylistButtons();
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
  document.getElementById('pageLengthSelectBottom').addEventListener('change', doChangeLength);
}
function doUpdateDateFilter(fromInput, toInput) {
  const revertDateRangeInputs = document.getElementById('revertDateRangeInputs');
  let filterDateRange = commentFilters.get('filterDateRange');
  if (fromInput.value === '' && toInput.value === '') {
    filterDateRange.active = false;
    filterDateRange.value = [];
    revertDateRangeInputs.classList.add('forceHidden');
    return;
  } else {
    revertDateRangeInputs.classList.remove('forceHidden');
  }
  if (
    !(fromInput.valueAsDate instanceof Date) ||
    !(toInput.valueAsDate instanceof Date) ||
    (toInput.valueAsDate < fromInput.valueAsDate)
  ) return;
  filterDateRange.value = [
    fromInput.valueAsDate.setHours(0, 0, 0, 0),
    toInput.valueAsDate.setHours(23, 59, 59, 999)
  ];
  filterDateRange.active = true;
  updatePage();
}
function generateCommentObject() {
  let RawData = document.getElementsByClassName('profilContentInner')[0];
  if (!RawData) return [];
  let commentBlocksRaw = RawData.getElementsByClassName('commentItem');
  let commentDataCollection = [];
  let counter = 0;
  let tmp;
  for (const commentRaw of commentBlocksRaw) {
    let commentItemData = {};
    commentItemData.id = ++counter;
    commentItemData.form = {};
    tmp = commentRaw.getElementsByClassName('sendReplyProfil')[0];
    if (tmp) {
      commentItemData.form.txt_id = tmp.getAttribute('data-reply').toString();
      commentItemData.form.btn_id = tmp.getAttribute('data-id').toString();
      tmp = null;
    } else {
      log(t('Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', 'form'), 'error', this);
      return [];
    }
    commentItemData.video = {};
    tmp = commentRaw.children[0].children[0];
    if (tmp) {
      commentItemData.video.url = tmp.getAttribute('href');
      commentItemData.video.title = tmp.innerText;
      tmp = null;
    } else {
      log(t('Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', 'video'), 'error', this);
      return [];
    }
    commentItemData.isNew = isNewComment(commentItemData.form.btn_id, commentItemData.form.txt_id);
    commentItemData.pic = commentRaw.children[2].children[0].getAttribute('src');
    commentItemData.user = commentRaw.children[3].children[0].innerText;
    commentItemData.date = commentRaw.children[3].children[1].innerText.substring(3);
    commentItemData.text = commentRaw.children[3].children[2].innerText;
    let storedReplyCount = getReplyCount(commentItemData.form.btn_id, commentItemData.form.txt_id);
    let replyCounter = 0;
    commentItemData.replies = [];
    tmp = commentRaw.children[3].children[3];
    let repliesTotal = tmp.getElementsByClassName('spacer25').length;
    for (let i = 1; i < repliesTotal * 3; i = i + 3) {
      let replyData = {};
      replyData.id = ++replyCounter;
      replyData.pic = tmp.children[i].children[0].getAttribute('src');
      replyData.user = tmp.children[i + 1].children[0].innerText;
      replyData.date = tmp.children[i + 1].children[1].innerText.substring(3);
      replyData.text = tmp.children[i + 1].children[2].innerText;
      replyData.isNew = replyCounter > storedReplyCount;
      commentItemData.replies.push(replyData);
    }
    commentItemData.reply_cnt = replyCounter;
    commentItemData.hasNewReplies = replyCounter > storedReplyCount;
    commentDataCollection.push(commentItemData);
  }
  return commentDataCollection;
}
function addUserFilterAutocompletionList() {
  const oldList = customElementsRegister.get('availableUsersForFilter');
  if (oldList) {
    removeFromDOM(oldList);
  }
  const availableUsersForFilter = addToDOM(
    '<datalist id="availableUsers"></datalist>'.parseHTML(),
    document.body,
    InsertionService.AsLastChild,
    true,
    'availableUsersForFilter'
  );
  let alreadyInsertedUsers = [];
  const blockedUsers = commentFilters.get('filterSkipUser').value;
  for (const comment of commentData) {
    if (alreadyInsertedUsers.indexOf(comment.user) === -1 && blockedUsers.indexOf(comment.user) === -1) {
      addToDOM(`<option value="${comment.user}"></option>`.parseHTML(), availableUsersForFilter, InsertionService.AsLastChild, false);
      alreadyInsertedUsers.push(comment.user);
    }
    for (const reply of comment.replies) {
      if (alreadyInsertedUsers.indexOf(reply.user) === -1 && blockedUsers.indexOf(reply.user) === -1) {
        addToDOM(`<option value="${reply.user}"></option>`.parseHTML(), availableUsersForFilter, InsertionService.AsLastChild, false);
        alreadyInsertedUsers.push(reply.user);
      }
    }
  }
}
function buildCommentBlock(commentData) {
  if (!commentData) return;
  let cnt = 0;
  let repliesBlock = '';
  const ignoreFilter = commentFilters.get('filterSkipUser');
  outer: for (const replyData of commentData.replies) {
    if (ignoreFilter.active) {
      for (const ignoredUser of ignoreFilter.value) {
        if (ignoredUser === replyData.user) continue outer;
      }
    }
    repliesBlock += `
      <div class="replyContainer${replyData.isNew ? ' ' + cssClassNewReplies : ''}">
        <div class="spacer25" data-reply-id="${++cnt}"></div>
        <div class="profilPicSmall">
          <img src="${replyData.pic}" alt="">
        </div>
        <div class="profilName">
          <strong>${replyData.user}</strong>&nbsp;<small>am ${replyData.date}</small>
          <pre class="replyText">${replyData.text}</pre>
        </div>
      </div>
    `;
  }
  const commentBlock = `
    <div data-comment-id="${commentData.id}" class="commentItem repliesCollapsed${commentData.isNew ? ' ' + cssClassNewComments : ''}${commentData.hasNewReplies ? ' ' + cssClassHasNewReplies : ''}">
      <div><a href="${commentData.video.url}">${commentData.video.title}</a></div>
      <div class="spacer15"></div>
      <div class="profilPic"><img src="${commentData.pic}" alt=""></div>
      <div class="profilName">
        <strong>${commentData.user}</strong>&nbsp;<small>am ${commentData.date}</small>
        <pre class="commentText">${commentData.text}</pre>
        <div class="allReplys">${repliesBlock}</div>
        <div class="replyBtnHolder"><div class="replyBtn">${t('antworten')}</div></div>
        <div class="replyHolder">
          <div id="commentTxtHolder">
            <textarea id="commentTxt_${commentData.form.txt_id}" placeholder="${t('Deine Antwort zu diesem Kommentar')}"></textarea>
            <div data-id="${commentData.form.btn_id}" data-reply="${commentData.form.txt_id}" class="btn sendReplyProfil">${t('Antwort abschicken')}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  return commentBlock.parseHTML(false);
}
function isNewComment(btn_id, txt_id) {
  storedCommentData = storedCommentData || get_value('commentData');
  let msgPrinted = false;
  for (const storedComment of storedCommentData) {
    if (typeof storedComment.form === typeof undefined) {
      if (!msgPrinted) {
        const msg = t('Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden.');
        log(msg, 'error', [t('Aufgetreten in {0}', 'isNewComment') + '()', 'storedComment:', storedComment]);
        msgPrinted = true;
      }
      return false;
    }
    if (storedComment.form.btn_id === btn_id && storedComment.form.txt_id === txt_id) return false;
  }
  return true;
}
function getReplyCount(btn_id, txt_id) {
  storedCommentData = storedCommentData || get_value('commentData');
  let msgPrinted = false;
  for (const storedComment of storedCommentData) {
    if (typeof storedComment.form === typeof undefined) {
      if (!msgPrinted) {
        const msg = 'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden.';
        log(msg, 'error', [t('Aufgetreten in {0}', 'getReplyCount') + '()', 'storedComment:', storedComment]);
        msgPrinted = true;
      }
      return 0;
    }
    if (storedComment.form.btn_id === btn_id && storedComment.form.txt_id === txt_id) {
      return storedComment.reply_cnt ?? storedComment.replies.length ?? 0;
    }
  }
}
function getFilteredCount() {
  let count = 0;
  for (const comment of commentData) {
    if (!applyFilters(comment)) count++;
  }
  return count;
}
function addFadeOutEffect(textElement) {
  textElement.classList.add('hasOverflow');
  const showFullLength = addToDOM(
    `<div class="showFullLength">${t('Mehr anzeigen')}</div>`.parseHTML(),
    textElement,
    InsertionService.After,
    false
  );
  showFullLength.addEventListener('click', function() {
    this.previousElementSibling.classList.remove('hasOverflow');
    removeFromDOM(this);
  });
}
function insertPaginatedComments() {
  const currentPage = Math.ceil((currentStart + 0.00001) / currentLength);
  let insertedComments = 0;
  let counter = currentStart;
  let commentItemElement;
  let filteredComments = [];
  for (const comment of commentData) {
    if (applyFilters(comment)) filteredComments.push(comment);
  }
  while (insertedComments < currentLength) {
    if (counter > totalComments || counter / currentPage > filteredComments.length) break;
    commentItemElement = buildCommentBlock(filteredComments[currentStart + insertedComments - 1]);
    if (commentItemElement) {
      commentItemElement = addToDOM(commentItemElement, customCommentContainer, InsertionService.AsLastChild, false);
      insertedComments++;
      const commentTextElement = commentItemElement.getElementsByClassName('commentText')[0];
      if (commentTextElement && commentTextElement.scrollHeight > maxCommentHeightBeforeCut) addFadeOutEffect(commentTextElement);
      for (const replyTextElement of commentItemElement.getElementsByClassName('replyText')) {
        if (replyTextElement && replyTextElement.scrollHeight > maxCommentHeightBeforeCut) addFadeOutEffect(replyTextElement);
      }
    }
    counter++;
  }
}
function applyFilters(commentData) {
  /* show only, if the comment is new or has new replies */
  if (commentFilters.get('filterOnlyNew').active) {
    if (!commentData.isNew && !commentData.hasNewReplies) return false;
  }
  /* show only, if one of the comment or one of its replies is from a user listed in the username filter list */
  if (commentFilters.get('filterOnlyUser').active) {
    let match = false;
    for (const currentFilterEntry of commentFilters.get('filterOnlyUser').value) {
      const usersFromReplies = commentData.replies.map(function (item) { return item.user || ''; });
      const relatedUsers = mergeArraysDistinct([commentData.user], usersFromReplies);
      if (relatedUsers.indexOf(currentFilterEntry) > -1) {
        match = true;
        break;
      }
    }
    if (!match) return false;
  }
  /* show only, if author is NOT in the list of ignored users (replies are checked individually elsewhere) */
  if (commentFilters.get('filterSkipUser').active) {
    for (const author of commentFilters.get('filterSkipUser').value) {
      if (commentData.user === author) return false;
    }
  }
  /* apply text search filter */
  if (commentFilters.get('filterTextSearch').active) {
    let relatedContent = [
      commentData.text.toUpperCase(),
      commentData.user.toUpperCase(),
      commentData.date.toUpperCase(),
      commentData.video.title.toUpperCase(),
    ];
    commentData.replies.forEach( reply => {
      relatedContent.push(reply.date.toUpperCase());
      relatedContent.push(reply.text.toUpperCase());
      relatedContent.push(reply.user.toUpperCase());
    });
    let wordsFound = 0;
    if (document.getElementById('filterAllWords').checked) {
      /* AND logic - must contain ALL search words */
      outer: for (const searchTag of commentFilters.get('filterTextSearch').value) {
        for (const content of relatedContent) {
          if (content.indexOf(searchTag.toUpperCase()) !== -1) {
            wordsFound++;
            continue outer;
          }
        }
      }
      if (wordsFound < commentFilters.get('filterTextSearch').value.length) return false;
    } else {
      /* OR logic - must contain ANY search word */
      outer: for (const searchTag of commentFilters.get('filterTextSearch').value) {
        for (const content of relatedContent) {
          if (content.indexOf(searchTag.toUpperCase()) !== -1) {
            wordsFound++;
            break outer;
          }
        }
      }
      if (!wordsFound) return false;
    }
  }
  /* apply date range filter */
  if (commentFilters.get('filterDateRange').active) {
    const filterDateRangeValues = commentFilters.get('filterDateRange').value;
    const commentDate = new Date(convertGermanDate(commentData.date));
    if (filterDateRangeValues[0] > commentDate || filterDateRangeValues[1] < commentDate) return false;
  }
  return true;
}
function convertGermanDate(string) {
  const parts = string.split(' ');
  const dateParts = parts[0].split('.');
  const timeParts = parts[1] ? parts[1].split(':') : [];
  if (dateParts.length !== 3 || dateParts[0].length !== 2 || dateParts[1].length !== 2 || dateParts[2].length !== 4) {
    log('convertGermanDate():' + t('Ungültiger Datums-Teil in Input'), 'error', ['string:', string]);
    return null;
  }
  let result = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  if (timeParts.length === 0 || timeParts.length === 2 || timeParts.length === 3) {
    result += ' ';
    for (const part of timeParts) {
      if (part.length !== 2) {
        log('convertGermanDate():' + t('Ungültiger Zeit-Teil in Input'), 'error', ['string:', string, 'part:', part]);
        return null;  
      }
      result += part + ':';
    }
    if (timeParts) result = result.substring(0, result.length - 1);
  }
  return result;
}
function buildPaginationUi() {
  let _totalComments = totalComments - filteredCommentsCount;
  const totalPages = Math.ceil(_totalComments / currentLength);
  const currentPage = Math.ceil((currentStart + 0.00001) / currentLength);
  let firstPageButton = currentPage >= 4 ? currentPage - 2 : 1;
  let highestPageButton = totalPages >= 5 ? firstPageButton + 4 : totalPages;
  if (highestPageButton > totalPages) {
    firstPageButton -= (highestPageButton - totalPages);
    firstPageButton = firstPageButton < 1 ? 1 : firstPageButton;
    highestPageButton = totalPages;
  }
  highestPageButton = highestPageButton > totalPages ? totalPages : highestPageButton;
  let buttons = '';
  let buttonStart;
  for (let pageNr = firstPageButton; pageNr < highestPageButton + 1; pageNr++) {
    buttonStart = pageNr * currentLength - currentLength + 1;
    buttons += buildPageButton(pageNr, buttonStart, (pageNr === currentPage));
  }
  const BtnBack_Start = currentPage * currentLength - 2 * currentLength + 1;
  const BtnNext_Start = currentPage * currentLength + 1;
  const BtnLast_Start = totalPages * currentLength - currentLength + 1;
  return `
    <div id="paginationContainer">
      <div class="paginationButtonGroup">
        <a id="paginationFirst" class="btn${(currentPage > 1 ? '"' : ' disabled" disabled="disabled"')} data-start="1" data-length="${currentLength}" data-content="1"></a>
        <a id="paginationBack" class="btn${(currentPage > 1 ? '"' : ' disabled" disabled="disabled"')} data-start="${BtnBack_Start}" data-length="${currentLength}" data-content="<"></a>
      </div>
      <div id="pageNrBtnContainer" class="paginationButtonGroup">${buttons}</div>
      <div class="paginationButtonGroup">
        <a id="paginationNext" class="btn${(currentPage < totalPages ? '"' : ' disabled" disabled="disabled"')} data-start="${BtnNext_Start}" data-length="${currentLength}" data-content=">"></a>
        <a id="paginationLast" class="btn${(currentPage < totalPages ? '"' : ' disabled" disabled="disabled"')} data-start="${BtnLast_Start}" data-length="${currentLength}" data-content="${totalPages}"></a>
      </div>
    </div>
  `;
}
function addPlaylistContainer() {
  const oldPlaylist = customElementsRegister.get('playlists');
  if (oldPlaylist) removeFromDOM(oldPlaylist);
  const playlists = `
    <select id="playlists" name="playlists" size="5">
      <optgroup id="optgroup_defaultPlaylists" label="${t('Standard-Playlists')}"></optgroup>
      <optgroup id="optgroup_customPlaylists" label="${t('Eigene Playlists')}"></optgroup>
    </select>
  `.parseHTML().firstElementChild;
  addToDOM(playlists, document.getElementById('playlistContainer'), InsertionService.AsFirstChild, true, 'playlists');
  document.getElementById('startPlaylist').classList.add('disabled');
  document.getElementById('editPlaylist').classList.add('disabled');
  document.getElementById('deletePlaylist').classList.add('disabled');
  playlists.addEventListener('change', function() {
    if (this.selectedIndex === -1) {
      document.getElementById('startPlaylist').classList.add('disabled');
      document.getElementById('editPlaylist').classList.add('disabled');
      document.getElementById('deletePlaylist').classList.add('disabled');
    } else {
      const playlistId = parseInt(this.selectedOptions[0].getAttribute('data-playlist-id'));
      const playlist = getPlaylistObjectById(playlistId);
      playlist.item_cnt > 0
        ? document.getElementById('startPlaylist').classList.remove('disabled')
        : document.getElementById('startPlaylist').classList.add('disabled');
      if (playlist.is_custom || playlist.id === 2) {
        document.getElementById('editPlaylist').classList.remove('disabled');
        if (playlist.id !== 2) document.getElementById('deletePlaylist').classList.remove('disabled');
      } else {
        document.getElementById('editPlaylist').classList.add('disabled');
        document.getElementById('deletePlaylist').classList.add('disabled');
      }
    }
  });
  const defaultContainer = document.getElementById('optgroup_defaultPlaylists');
  const customContainer = document.getElementById('optgroup_customPlaylists'); 
  for (const listData of playlistData) {
    addToDOM(buildPlaylistItem(listData), (listData.is_custom ? customContainer : defaultContainer), InsertionService.AsLastChild, false);
  }
}
function initializePlaylistButtons() {
  document.getElementById('createPlaylist').addEventListener('click', function() {
    const name = prompt('Name der neuen Playlist:', '');
    if (!name) return;
    const playlistObj = {
      id: playlistData[playlistData.length - 1].id + 1,
      is_custom: true,
      max_items: -1,
      name: name,
      item_cnt: 0,
      items: [],
    };
    playlistData.push(playlistObj);
    const customContainer = document.getElementById('optgroup_customPlaylists')
    addToDOM(buildPlaylistItem(playlistObj), customContainer, InsertionService.AsLastChild, false);
    set_value('playlistData', playlistData);
  });
  document.getElementById('startPlaylist').addEventListener('click', function() {
    openWatchPlaylistFrame();
  });
  document.getElementById('editPlaylist').addEventListener('click', function() {
    addEditPlaylistDialog();
  });
  document.getElementById('deletePlaylist').addEventListener('click', function() {
    const playlist = getPlaylistObjectById(parseInt(document.getElementById('playlists').selectedOptions[0].getAttribute('data-playlist-id')));
    if (playlist.is_custom) {
      playlistData.deleteByValue(playlist);
      set_value('playlistData', playlistData);
    }
    updatePage();
  });
}
function openWatchPlaylistFrame() {
  const playlist = getPlaylistObjectById(parseInt(document.getElementById('playlists').selectedOptions[0].getAttribute('data-playlist-id')));
  if (!playlist.items[playlist.items.length - 1]) return;   
  const videoUrl = window.location.origin + playlist.items[playlist.items.length - 1].url;
  const overlay = `<div id="watchPlaylist_Overlay"></div>`.parseHTML(false).firstElementChild;
  const iframe = `<iframe id="watchPlaylist_iframe" src="${videoUrl}"></iframe>`.parseHTML(false).firstElementChild;
  overlay.appendChild(iframe);
  addToDOM(overlay, document.body, InsertionService.AsLastChild, true, 'watchPlaylist_Overlay');
  iFrameReady(iframe, function() {
    const iframe_document = iframe.contentDocument || iframe.contentWindow.document;
    let playlistRow = `
        <div id="playlistRow" class="row" data-playlist-id="${playlist.id}">
          <div id="loadPreviousVideo"><- vorheriges Video</div>
          <div class="col-auto activeVideo" style="height: 100%; margin: auto;filter: brightness(1.5);">Video Tile 1</div>
          <div class="col-auto" style="height: 100%;margin: auto;">Video Tile 2</div>
          <div class="col-auto" style="height: 100%;margin: auto;">Video Tile 3</div>
          <div id="loadNextVideo">nächstes Video -></div>
        </div>
      `;
    let backToProfileButton = `
        <div>
          <a id="backToProfileBtn" class="btn btn-small">Zurück zur Profil-Seite</a>
        </div>
      `;
    playlistRow = addToDOM(playlistRow.parseHTML(), iframe_document.getElementById('cmsFramework'), InsertionService.Before, false);
    backToProfileButton = addToDOM(backToProfileButton.parseHTML(), playlistRow, InsertionService.After, false);
    const realUrl = window.location.toString();
    window.history.replaceState(null,'', videoUrl);
    backToProfileButton.addEventListener('click', function() {
      removeFromDOM(overlay);
      window.history.replaceState(null, '', realUrl);
      updatePage();
    });
  });
}
function addEditPlaylistDialog() {
  const playlist = getPlaylistObjectById(parseInt(document.getElementById('playlists').selectedOptions[0].getAttribute('data-playlist-id')));
 const editPlaylistDialog = `
  <div id="playlistDialog_middleLayer"></div>
  <div id="editPlaylistDialog">
    <div id="playlistNameWrapper" class="row">
      <input id="playlistName" class="col" type="text" maxlength="100" value="${playlist.name}" readonly="readonly">
      <span id="changePlaylistName" class="col-auto" data-playlist-id="${playlist.id}">
        <svg xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" class="svgColorized" viewBox="0 0 512 512">
          <path class="svgColoredFill" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
        </svg>
      </span>
    </div>   
    <ul id="videoList"></ul>
    <div id="playlistDialogButtons" class="row">
      <a id="playlistDialogConfirmBtn" class="btn btn-small col-auto disabled" data-playlist-id="${playlist.id}">${t('Bestätigen')}</a>
      <a id="playlistDialogCancelBtn" class="btn btn-small col-auto">${t('Abbrechen')}</a>
    </div>
  </div>
  <style>
    #playlistDialog_middleLayer {
      position: fixed;
      z-index: 999998;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: #0008;
    }
    #editPlaylistDialog {
      display: flex;
      flex-direction: column;
      position: fixed;
      width: min(max(30%, 14rem), max(80%, 20rem));   /* Target: 20rem, but min 30% (or at least 14rem) and max 80% */
      min-height: 14rem;
      max-height:  80%;
      background-color: #252525;
      border-radius: 5px;
      border: 2px solid var(--theme-color);
      z-index: 999999;
      /* top and left are calculated and set in the script (and updated in lazy resize handler) */
    }
    #playlistNameWrapper {
      display: flex;
      justify-content: space-between;
      padding: .75rem 1rem;
    }
    #playlistName {
      color: var(--theme-color);
      font-size: 1rem;
      font-weight: bold;
      margin: 0;
      background-color: inherit;
      cursor: default;
      text-overflow: ellipsis;
    }
    #changePlaylistName:hover .svgColoredFill {
      filter: brightness(2);
    }
    #changePlaylistName {
      margin: auto 0 auto 1rem;
      cursor: pointer;
    }
    #videoList {
      -ms-overflow-y: scroll;
      overflow-y: scroll;
      max-height: 80%;
      border: 1px solid #373434;
      margin: 0 .5rem .5rem .5rem;
      border-radius: 5px;
      padding: .3rem;
    }
    .videoListEntry_NameRow {
      display: flex;
      flex-wrap: nowrap
      cursor: default;
    }
    .videoListEntry_id {
      padding-right: 2rem;
    }
    .videoListEntry_name {
      white-space: nowrap;
      text-overflow: ellipsis;
      -ms-overflow-x:  hidden;
      -ms-overflow-y:  hidden;
      overflow: hidden;
    }
    .videoListEntry_delete {
      margin-inline: 1rem;
    }
    .videoListEntry_delete:hover {
      color: red;
      cursor: pointer;
    }
    #playlistDialogButtons .btn {
      margin-inline: 1rem;
    }
    #playlistDialogButtons {
      justify-content: center;
      margin-block: auto .75rem;
    }
    #noVideosInfo {
      margin-inline: auto;
    }
  </style>
`.parseHTML();   
  addToDOM(editPlaylistDialog, document.body, InsertionService.AsLastChild, true, 'editPlaylistDialog');
  if (!playlist.is_custom) document.getElementById('changePlaylistName').classList.add('forceHidden');
  const videoList = document.getElementById('videoList');
  for (const video of playlist.items) {
    const listEntry = `
        <li class="videoListEntry" data-video-id="${video.id}">
          <div class="videoListEntry_NameRow">
            <span class="videoListEntry_id col-auto">${video.id}</span>
            <span class="videoListEntry_name col">${video.title}</span>
            <span class="videoListEntry_delete col-auto unselectable" unselectable data-video-id="${video.id}" data-playlist-id="${playlist.id}">&cross;</span>
          </div>
        </li>
      `.parseHTML();
    videoList.appendChild(listEntry);
  }
  if (!playlist.items.length) {
    videoList.classList.add('forceHidden');
    const info = `<div id="noVideosInfo">Keine Videos in der Playlist</div>`.parseHTML();
    addToDOM(info, videoList, InsertionService.After, false);
  }
  const resizer = function() {
    const editPlaylistDialog = document.getElementById('editPlaylistDialog');
    const style = window.getComputedStyle(editPlaylistDialog);
    editPlaylistDialog.clientLeft = 100;
    editPlaylistDialog.style.left = `calc(50% - ${style.width}/2)`;
    editPlaylistDialog.style.top = `calc(50% - ${style.height}/2)`;
  };
  const lazyResizer = function() { debounce(resizer, 50); };
  window.addEventListener('resize', lazyResizer);
  resizer();
  document.getElementById('changePlaylistName').addEventListener('click', function() {
    const input = document.getElementById('playlistName');
    if (input.hasAttribute('readonly')) {
      input.removeAttribute('readonly');
      input.style.cursor = 'auto';
      input.style.backgroundColor = 'revert';
      input.style.textOverflow = 'unset';
      input.scrollLeft = 0;
      input.focus();
      input.select();
    } else {
      input.setAttribute('readonly', 'readonly');
      input.style.cursor = 'default';
      input.style.backgroundColor = 'inherit';
      input.style.textOverflow = 'ellipsis';
      input.scrollLeft = 0;
      document.getElementById('playlistDialogConfirmBtn').classList.remove('disabled');
    }
  });
  document.getElementById('playlistName').addEventListener('keypress', function(ev) {
    if (this.hasAttribute('readonly')) return;
    if (!ev) ev = window.event;
    let keyCode = ev.code || ev.key;
    if (keyCode === 'Enter' || keyCode === 'NumpadEnter') {
      this.setAttribute('readonly', 'readonly');
      this.style.cursor = 'default';
      this.style.backgroundColor = 'inherit';
      this.style.textOverflow = 'ellipsis';
      this.scrollLeft = 0;
      document.getElementById('playlistDialogConfirmBtn').classList.remove('disabled');
    }
  });
  for (const entry of document.getElementsByClassName('videoListEntry_delete')) {
    entry.addEventListener('click', function() {
      let targetEntry;
      for (const videoListEntry of document.getElementsByClassName('videoListEntry')) {
        if (videoListEntry.getAttribute('data-video-id') === this.getAttribute('data-video-id')) {
          targetEntry = videoListEntry;
          break;
        }
      }
      if (targetEntry) {
        if (targetEntry.parentElement.childElementCount === 1) {
          videoList.classList.add('forceHidden');
          const info = `<div id="noVideosInfo">Keine Videos in der Playlist</div>`.parseHTML();
          addToDOM(info, videoList, InsertionService.After, false);
        }
        targetEntry.remove();
        document.getElementById('playlistDialogConfirmBtn').classList.remove('disabled');
      }
    });
  }
  document.getElementById('playlistDialogConfirmBtn').addEventListener('click', function() {
    const playlistId = parseInt(this.getAttribute('data-playlist-id'));
    const playlist = getPlaylistObjectById(playlistId);
    let newName;
    if (!playlist.is_custom) {
      newName = document.getElementById('playlistName').value;
      if (newName.length > 0) playlist.name = newName;
    }
    let newVideoItems = [];
    for (const listedEntry of document.getElementById('videoList').children) {
      const listedEntryId = parseInt(listedEntry.getAttribute('data-video-id'));
      for (const storedEntry of playlist.items) {
        if (storedEntry.id === listedEntryId) {
          newVideoItems.push(storedEntry);
          break;
        }
      }
    }
    playlist.item_cnt = newVideoItems.length;
    playlist.items = newVideoItems;
    set_value('playlistData', playlistData);
    window.removeEventListener('resize', lazyResizer);
    removeFromDOM(customElementsRegister.get('editPlaylistDialog'));
  });
  document.getElementById('playlistDialogCancelBtn').addEventListener('click', function() {
    window.removeEventListener('resize', lazyResizer);
    removeFromDOM(customElementsRegister.get('editPlaylistDialog'));
  });
  document.getElementById('playlistDialog_middleLayer').addEventListener('click', function(ev) {
    window.removeEventListener('resize', lazyResizer);
    removeFromDOM(customElementsRegister.get('editPlaylistDialog'));
    ev.preventDefault();
    ev.stopImmediatePropagation();
  });
}
function buildPlaylistItem(data) {
  if (!data) return ''.parseHTML();
  return `<option class="playlistItem ${data.is_custom ? 'customPlaylist' : 'fixedPlaylist'}" data-playlist-id="${data.id}"><span>${data.is_custom ? data.name : t(data.name)}</span><span>${data.item_cnt}</span></option>`.parseHTML();
}
function buildPageButton(pageNr, buttonStart, isActivePage = false) {
  return `<a class="btn pageNrBtn${(isActivePage ? ' activePage" disabled="disabled"' : '"')} data-start="${buttonStart}" data-length="${currentLength}" data-content="${pageNr}"></a>`;
}
function buildPaginationControl(suffix= '') {
  const _totalComments = totalComments - filteredCommentsCount;
  const to = currentStart + currentLength > _totalComments ? _totalComments : currentStart + currentLength - 1;
  const from = to === 0 ? 0 : currentStart;
  let filtered = '';
  for (const filter of commentFilters.entries()) {
    if (filter[1].active) {
      filtered = ' ' + t('({0} gefiltert)', filteredCommentsCount);
      break;
    }
  }
  return `
    <div id="paginationControl${suffix}">
      <div id="commentsFromToContainer${suffix}">
        <small>${t('Kommentare {0} .. {1} von {2}', from, to, _totalComments)}${filtered}</small>
      </div>
      <div id="commentsPerPageContainer${suffix}">
        <small>${t('Kommentare pro Seite:')}</small>
        <select id="pageLengthSelect${suffix}" class="select">
          <option value="5"${(currentLength === 5 ? 'selected="selected"' : '')}>5</option>
          <option value="25"${(currentLength === 25 ? 'selected="selected"' : '')}>25</option>
          <option value="50"${(currentLength === 50 ? 'selected="selected"' : '')}>50</option>
          <option value="100"${(currentLength === 100 ? 'selected="selected"' : '')}>100</option>
          <option value="${totalComments}"${(currentLength === totalComments ? 'selected="selected"' : '')}>${t('alle')}</option>
        </select>
      </div>
    </div>
  `;
}
function insertLanguageDropdown() {
  const languageContainerHtml = `
    <div id="language_container" class="row customDropdown">
      <div class="customDropdownToggler">
        <span id="activeLanguage" class="customDropdown_ActiveVal">${i18n.get(activeLanguage).get('__metadata__').displayName}</span>
        <span class="unselectable" unselectable="on">&gt;</span>
      </div>
      <div class="customDropdownMenu"></div>
    </div>
  `.parseHTML();
  const settingsLanguageLabel = document.getElementById('settingsLanguageLabel');
  enhancedUiContainer = customElementsRegister.get('enhancedUiContainer');
  const languageContainer = addToDOM(languageContainerHtml, settingsLanguageLabel, InsertionService.After, true, 'language_container');
  for (const language of i18n.entries()) {
    const metadata = language[1].get('__metadata__');
    const langEntryHtml = `<div id="lang_${language[0]}" data-lang="${language[0]}">${metadata.icon}<span>${metadata.displayName}</span></div>`;
    addToDOM(langEntryHtml.parseHTML(), languageContainer.lastElementChild, InsertionService.AsLastChild, false);
  }
  for (const langItem of languageContainer.lastElementChild.children) {
    langItem.addEventListener('click', function() {
      const langId = this.getAttribute('data-lang');
      if (i18n.has(langId)) {
        activeLanguage = langId;
        set_value('setting_language', activeLanguage);
        updatePage();
      }
      languageContainer.remove();
      insertLanguageDropdown();
    });
  }
}
function insertSortingMenu() {
  const sortingContainerHtml = `
    <div id="sorting_container" class="row customDropdown" style="position: relative;top: 2rem;margin-top: -2rem;">
      <div class="customDropdownToggler">
        <span id="activeSorting" class="customDropdown_ActiveVal">${t('Neueste zuerst')}</span>
        <span>&gt;</span>
      </div>
      <div class="customDropdownMenu">
        <div id="sortByActivity">${t('Neueste zuerst')}</div>
        <div id="sortByUserOption">${t('Nach User')}</div>
        <div id="sortByVideo">${t('Nach Video')}</div>
        <div id="sortByReplyCnt">${t('Nach Antwortzahl')}</div>
      </div>
    </div>
  `.parseHTML();
  addToDOM(sortingContainerHtml, paginationContainer, InsertionService.Before, true, 'sortingController');
}
function doChangeLength(ev) {
  currentLength = parseInt(this.value) || currentLength;
  const currentPage = Math.ceil((currentStart + 0.000001) / currentLength);
  currentStart = currentLength * currentPage - currentLength + 1;
  if (currentStart > totalComments - getFilteredCount()) currentStart = 1;
  this.selectedOptions[0].innerText === t('alle')
    ? set_value('commentsPerPage', 'all')
    : set_value('commentsPerPage', currentLength);
  updatePage();
}
function doClickedPagination(ev, clickedBtn) {
  if (!clickedBtn || clickedBtn.hasAttribute('disabled')) return;
  currentStart = parseInt(clickedBtn.getAttribute('data-start')) || currentStart || defaultStart;
  currentLength = parseInt(clickedBtn.getAttribute('data-length')) || currentLength || defaultLength;
  updatePage();
  paginationContainer.previousElementSibling.scrollIntoView()
}
function doAddUserToFilterList(input) {
  let userElement = `<span class="selectedUserFilter"><span>${input.value}</span><span title="${t('Entfernen')}"></span></span>`.parseHTML();
  const filterOnlyUser = commentFilters.get('filterOnlyUser');
  userElement = addToDOM(userElement, document.getElementById('filteredUserList'), InsertionService.AsLastChild, false);
  const availableUsersForFilter = customElementsRegister.get('availableUsersForFilter');
  for (const entry of availableUsersForFilter.children) {
    if (entry.value === input.value) {
      removeFromDOM(entry);
      break;
    }
  }
  document.getElementById('revertFilterUserInput').classList.remove('forceHidden');
  userElement.lastElementChild.addEventListener('click', function() {
    const targetUsername = this.previousElementSibling.innerText;
    const datalistEntry = `<option value="${targetUsername}"></option>`.parseHTML();
    addToDOM(datalistEntry, availableUsersForFilter, InsertionService.AsLastChild, false);
    const oldFilterUserList = filterOnlyUser.value;
    filterOnlyUser.value = [];
    for (const entry of oldFilterUserList) {
      if (entry !== targetUsername) {
        filterOnlyUser.value.push(entry);
      } 
    }
    if (filterOnlyUser.value.length === 0) {
      filterOnlyUser.active = false;
      document.getElementById('revertFilterUserInput').classList.add('forceHidden');
    }
    removeFromDOM(this.parentElement);
    updatePage();
  });
  let currentFilterList = filterOnlyUser.value;
  currentFilterList.push(input.value);
  input.value = '';
  changeFilter('filterOnlyUser', currentFilterList);
}
function changeFilter(filterName, newValue) {
  currentStart = 1;
  if (commentFilters.has(filterName)) {
    const filter = commentFilters.get(filterName);
    filter.value = newValue;
    commentFilters.get(filterName).active = typeof filter.value === 'boolean' ? filter.value : filter.value.length > 0;
  }
  updatePage();
}
function updatePaginationUI() {
  if (typeof paginationContainer !== typeof undefined && paginationContainer instanceof HTMLElement) paginationContainer.remove();
  if (typeof paginationContainerBottom !== typeof undefined && paginationContainerBottom instanceof HTMLElement) paginationContainerBottom.remove();
  if (typeof paginationControlContainer !== typeof undefined && paginationControlContainer instanceof HTMLElement) paginationControlContainer.remove();
  if (typeof paginationControlContainerBottom !== typeof undefined && paginationControlContainerBottom instanceof HTMLElement) paginationControlContainerBottom.remove();
  paginationContainer = addToDOM(
    buildPaginationUi().parseHTML(),
    document.getElementsByClassName('rowHeadlineHolder')[1],
    InsertionService.After,
    true,
    'paginationContainer'
  );
  const paginationButtons = paginationContainer.getElementsByClassName('btn');
  for (const paginationBtn of paginationButtons) {
    paginationBtn.addEventListener('click', function (e) {
      doClickedPagination(e, this);
    });
  }
  paginationContainerBottom = paginationContainer.cloneNode(true);
  paginationContainerBottom.id = paginationContainerBottom.id + 'Bottom';
  paginationContainerBottom = addToDOM(
    paginationContainerBottom,
    originalCommentContainer,
    InsertionService.Before,
    true,
    'paginationContainerBottom'
  );
  const paginationButtonsBottom = paginationContainerBottom.getElementsByClassName('btn');
  for (const paginationBtn of paginationButtonsBottom) {
    paginationBtn.addEventListener('click', function (e) {
      doClickedPagination(e, this);
    });
  }
  paginationControlContainer = addToDOM(
    buildPaginationControl().parseHTML(),
    paginationContainer,
    InsertionService.After,
    true,
    'paginationControlContainer'
  );
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
  paginationControlContainerBottom = addToDOM(
    buildPaginationControl('Bottom').parseHTML(),
    paginationContainerBottom,
    InsertionService.Before,
    true,
    'paginationControlContainerBottom'
  );
  document.getElementById('pageLengthSelectBottom').addEventListener('change', doChangeLength);
  if (totalComments === 0 || totalComments === filteredCommentsCount) {
    paginationContainer.classList.add('forceHidden');
    paginationContainerBottom.classList.add('forceHidden');
  }
}
function updateComments() {
  if (customCommentContainer instanceof HTMLElement) {
    customCommentContainer.innerHTML = '';
  } else {
    customCommentContainer = document.getElementById('customCommentContainer');
    if (!customCommentContainer) {
      customCommentContainer = document.getElementsByClassName('profilContentInner')[0];
      customCommentContainer.id = 'customCommentContainer';
    }
  }
  insertPaginatedComments();
  customCommentContainer = document.getElementsByClassName('profilContentInner')[0];
  if (totalComments === 0) {
    const msg = `<div class="msgNoResults">${t('Noch keine Kommentare...')}</div>`.parseHTML();
    addToDOM(msg, customCommentContainer, InsertionService.AsLastChild, false);
  } else if (totalComments === filteredCommentsCount) {
    const msg = `<div class="msgNoResults">${t('Kein Kommentar entspricht den Filterkriterien')}</div>`.parseHTML();
    addToDOM(msg, customCommentContainer, InsertionService.AsLastChild, false);
  }
  for (const commentElement of customCommentContainer.children) {
    let repliesWrapper = commentElement.getElementsByClassName('allReplys')[0];
    if (!repliesWrapper) continue;
    let replies = repliesWrapper;
    if (replies) replies = replies.children;
    if (replies.length > expandedReplyCount) {
      addToDOM(
        `<div class="expander">${t('Zeige {0} ältere Antworten', replies.length - expandedReplyCount)}</div>`.parseHTML(),
        repliesWrapper,
        InsertionService.Before,
        false
      );
    }
  }
  const expanderElements = document.getElementsByClassName('expander');
  for (const expander of expanderElements) {
    expander.addEventListener('click', function() {
      if (!this) return;
      this.parentElement.parentElement.classList.remove('repliesCollapsed');
      for (const reply of expander.nextElementSibling.children) {
        const replyTextElement = reply.getElementsByClassName('replyText')[0];
        if (!replyTextElement.classList.contains('hasOverflow') && replyTextElement.scrollHeight > maxCommentHeightBeforeCut) addFadeOutEffect(replyTextElement);
      }
      this.remove();
    })
  }
}
function doOrderCommentData(orderType = 'activity') {
  if (orderType === 'user') {
    commentData.sort((a, b) => {
      const valA = a.user.toUpperCase();
      const valB = b.user.toUpperCase();
      if (valA === '') return 1;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  } else if (orderType === 'activity') {
    commentData.sort((a, b) => {
      const valA = a.id;
      const valB = b.id;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  } else if (orderType === 'video') {
    commentData.sort((a, b) => {
      const valA = a.video.title.toUpperCase();
      const valB = b.video.title.toUpperCase();
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  } else if (orderType === 'relevance') {
    if (!commentData[0].matchValue) {
      log(t('Es wurde versucht, nach Suchergebnis-Relevanz zu sortieren, die Kommentardaten enthalten jedoch keine "matchValue"-Werte!'), 'warn');
      return;
    }
    commentData.sort((a, b) => {
      const valA = a.matchValue;
      const valB = b.matchValue;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
   } else if (orderType === 'replyCount') {
    commentData.sort((a, b) => {
      const valA = a.reply_cnt;
      const valB = b.reply_cnt;
      if (valA < valB) return 1;
      if (valA > valB) return -1;
      return 0;
    });
  }
}
function updatePage() {
  filteredCommentsCount = getFilteredCount();
  updateComments();
  updatePaginationUI();
  updateStaticTranslations();
  addPlaylistContainer();
  for (const element of document.getElementsByClassName('selectedUserFilter')) {
    element.lastElementChild.setAttribute('title', t('Entfernen'));
  }
  for (const element of document.getElementsByClassName('revertBtn')) {
    element.setAttribute('title', t('Filter zurücksetzen'));
  }
}
 })();
  } else if (route === 'video') {
    (function() {
      if (!document.getElementsByClassName('reloadComment')[0]) {
        updateStaticTranslations();
        return;
      }
// set up route-scoped fields and start the execution flow for this route
 const searchComments_maxRetries = 5;
 const searchComments_delayBeforeRetry = 250;
 let searchComments_retryCounter = 0;
 let storedIgnoreList;
 let commentContainer;
 let currentVideoObj;
execute_genericPage()
function execute_genericPage() {
  addToDOM(`<style>#favoriteIcon:hover path, #favoriteIcon.isFavorite path {
  fill: var(--theme-color);
}
#addToPlaylistIcon:hover path {
  stroke: lightgreen;
}
#addToPlaylistWrapper {
  display: inline-block;
  position: relative;
}
#playlistModal {
  width: 12rem;
  position: absolute;
  background-color: #606060;
  padding: 1rem;
  text-align: center;
  border-radius: 5px;
  border: 1px solid var(--theme-color);
}
.checkboxListItemWrapper {
  display: flex;
}
.checkboxListItemWrapper:hover {
  filter: brightness(1.5);
}
.checkboxListItem {
  margin-right: .75rem;
}
/* Specification of the global .playlistItem */
.playlistItem {
  width: 85%;
  cursor: pointer;
  white-space: nowrap;
}
.playlistItem :last-child {
  margin-left: auto;
  display: inline-flex;
}</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  replaceSuggestedVideoTiles();
  replaceReloadButton();
  hideCommentsOfBlockedUsers(true);
  updateStaticTranslations();
  addAdditionalVideoButtons();
  const favoriteButton = document.getElementById('favoriteIcon');
  favoriteButton.addEventListener('click', function() {
    const obj = getVideoItemObject();
    if (isVideoInFavorites(obj.id)) {
      removeVideoFromPlaylist(obj, favoritesID);
      this.classList.remove('isFavorite');
      console.log('Video wurde von Playlist "Favoriten" entfernt');   
    } else {
      addVideoToPlaylist(obj, favoritesID);
      this.classList.add('isFavorite');
      console.log('Video wurde zur Playlist "Favoriten" hinzugefügt');   
    }
  });
  const opener = function () {
    openAddToPlaylistMenu(document.getElementById('addToPlaylistWrapper'));
    document.getElementById('addToPlaylistIcon').removeEventListener('click', opener);
  }
  document.getElementById('addToPlaylistIcon').addEventListener('click', opener);
  const onReadyTasks = function() {
    const currentVideoId = document.getElementById('sendcomment').getAttribute('data-id');
    if (isVideoInFavorites(parseInt(currentVideoId))) favoriteButton.classList.add('isFavorite');
    const playlistRow = document.getElementById('playlistRow');
    if (!playlistRow) {
      addVideoToPlaylist(getVideoItemObject(), lastWatchedID);
    } else if (parseInt(playlistRow.getAttribute('data-playlist-id')) === watchLaterID) {
      removeVideoFromPlaylist(getVideoItemObject(), watchLaterID);
    }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onReadyTasks) : onReadyTasks();
}
function replaceSuggestedVideoTiles() {
  let foundSuggestedVideos = false;
  const tiles = Array.from(document.getElementsByClassName('folgenItem'));
  for (const i in tiles) {
    const originalTile = tiles[i];
    if (originalTile instanceof HTMLElement) {
      let uri = originalTile.getAttribute('onClick').replace("folgenItem('", '');
      uri = window.location.origin + '/' + uri.substr(0, uri.length - 2);
      const customTile = originalTile.cloneNode(true);
      customTile.removeAttribute('onClick');
      customTile.appendChild(`<a href="${uri}" class="overlayLink" style="position:absolute;left:0;top:0;height:100%;width:100%"></a>`.parseHTML());
      addToDOM(customTile, originalTile, InsertionService.Before);
      disablePrimalElement(originalTile);
      foundSuggestedVideos = true;
    }
  }
  if (foundSuggestedVideos) {
    window.addEventListener('beforeunload', function(ev) {
      const originalTarget = ev.originalTarget || ev.srcElement;
      const callee = originalTarget.activeElement;
      if (callee.classList.contains('overlayLink')) {
        let permalink = originalTarget.activeElement.getAttribute('href').replace(window.location.origin, '');
        permalink = permalink.substring(1, permalink.length);
        if (permalink) {
          window.onbeforeunload = null;   
          folgenItem(permalink);
        }
      }
    });
  }
}
function replaceReloadButton() {
  const originalButton = document.getElementsByClassName('reloadComment')[0];
  const modifiedButton = originalButton.cloneNode(true);
  modifiedButton.addEventListener('click', function() {
    hideCommentsOfBlockedUsers(true);
  });
  addToDOM(modifiedButton, originalButton, InsertionService.Before, true, 'customReloadButton');
  disablePrimalElement(originalButton, 'originalReloadButton');
}
function hideCommentsOfBlockedUsers(delayed = false) {
  if (delayed) {
    const tryToApply = function() {
      setTimeout(function() {
        if (commentContainer.childElementCount > 0) {
          for (const user of storedIgnoreList) hideCommentsOfUser(user);
        } else {
          if (searchComments_retryCounter < searchComments_maxRetries - 1) {
            searchComments_retryCounter++;
            tryToApply();
          }
        }
      }, searchComments_delayBeforeRetry);
    }
    if (document.getElementById('commentContent')) {
      storedIgnoreList = get_value('ignoredUsers');
      commentContainer = document.getElementById('commentContent');
      tryToApply();
    }
  } else {
    if (document.getElementById('commentContent')) {
      storedIgnoreList = get_value('ignoredUsers');
      for (const user of storedIgnoreList) hideCommentsOfUser(user);
    }
  }
}
function hideCommentsOfUser(username) {
  const allComments = document.querySelectorAll('.profilName');
  for (let i = allComments.length - 1; i >= 0; i--) {
    const comment = allComments[i];
    if (comment.firstElementChild && comment.firstElementChild.innerText === username) {
      if (comment.id.startsWith('comment_')) {
        if (comment.previousElementSibling) disablePrimalElement(comment.previousElementSibling);
      }
      if (comment.parentElement.classList.contains('commentItem')) {
        disablePrimalElement(comment.parentElement);
      } else {
        disablePrimalElement(comment);
      }
    }
  }
}
function addAdditionalVideoButtons() {
  const addToPlaylistButton = `
    <div id="addToPlaylistWrapper">
      <div title="${('Zu Playlist hinzufügen')}" class="thumbChooseHolder">
        <svg id="addToPlaylistIcon" class="svgColorized" xmlns="http://www.w3.org/2000/svg" stroke-width="20" style="height: 1.25rem;vertical-align: middle;" viewBox="0 0 250 250">
          <path class="svgColoredStroke" fill="none" d="M0,125 H250 M125,0 V250" />
        </svg>  
      </div>
    </div>
  `.parseHTML().firstElementChild;
  const favoriteButton = `
    <div title="${('Zu Favoriten hinzufügen')}" class="thumbChooseHolder">
      <svg id="favoriteIcon" class="svgColorized" xmlns="http://www.w3.org/2000/svg" stroke-width="20" style="height: 1.5rem;vertical-align: middle;" viewBox="0 0 250 250">
        <path class="svgColoredStroke" fill="none" d="M125.53,243.6a1.48,1.48,0,0,1-2.17,0C95.62,212.7,26.6,134.43,19.43,124.75c-20-27-20-77,5-105,41-45.9,100,30,100,30s59-75.9,100-30c25,28,25,78,5,105-7.17,9.68-76.19,87.95-103.94,118.82a1.48,1.48,0,0,1-2.17,0" />
      </svg>  
    </div>
  `.parseHTML().firstElementChild;
  addToDOM(favoriteButton, document.getElementById('thumb-up'), InsertionService.Before);
  addToDOM(addToPlaylistButton, favoriteButton, InsertionService.Before);
}
function isVideoInFavorites(videoId) {
  return isVideoInPlaylist(videoId, favoritesID) !== false;
}
function getPlaylistsContainingVideo(video) {
  if (typeof video === 'object') video = video.id;
  if (!(playlistData) || typeof video !== 'number') return [];
  let matches = []
  outer: for (const playlist of playlistData) {
    for (const member of playlist.items) {
      if (member.id === video) {
        matches.push();
        continue outer;
      }
    }
  }
  return matches;
}
function getVideoItemObject() {
  if (currentVideoObj) return currentVideoObj;
  const id = document.getElementById('sendcomment');
  const title = document.getElementById('cmsFramework').getElementsByTagName('h2')[0];
  let missing = '';
  if (!id) {
    missing = 'id';
  } else if (!title) {
    missing = 'title';
  } else {
    currentVideoObj = {
      id: id.getAttribute('data-id'),
      unavailable: false,
      url: window.location.pathname,
      title: title.innerText,
    };
    return currentVideoObj;
  }
  const msg = t('Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', missing);
  log(msg, 'error', [ t('Aufgetreten in {0}', 'getVideoItemObject') ]);
}
function openAddToPlaylistMenu(refElement) {
  if (!playlistData) return;
  const modal = `<div id="playlistModal"><div id="checkboxList"></div></div>`.parseHTML().firstElementChild;
  const checkboxList = modal.firstElementChild;
  const videoObj = getVideoItemObject();
  for (const playlist of playlistData) {
    if (playlist.id === 1 || playlist.id === 3) continue;
    const entry = `
      <div class="checkboxListItemWrapper">
        <input id="checkboxListItem-${playlist.id}" class="checkboxListItem" type="checkbox" ${isVideoInPlaylist(videoObj.id, playlist.id) !== false ? 'checked="checked" ' : ''} data-playlist-id="${playlist.id}">
        <label for="checkboxListItem-${playlist.id}" class="playlistItem">
          <span>${playlist.is_custom ? playlist.name : t(playlist.name)}</span>
          <span>${playlist.item_cnt}</span>
        </label>   
      </div>
    `.parseHTML();
    addToDOM(entry, checkboxList, InsertionService.AsLastChild, false);
  }
  const opener = function () {
    openAddToPlaylistMenu(document.getElementById('addToPlaylistWrapper'));
    document.getElementById('addToPlaylistIcon').removeEventListener('click', opener);
  }
  const confirmButton = addToDOM(`<div style="margin-top: 1rem;"><a class="btn btn-small">${t('Bestätigen')}</a></div>`.parseHTML(), modal, InsertionService.AsLastChild, false).firstElementChild;
  confirmButton.addEventListener('click', function() {
    const videoObj = getVideoItemObject();
    for (const input of document.getElementsByClassName('checkboxListItem')) {
      const playlistId = parseInt(input.getAttribute('data-playlist-id'));
      if (input.checked) {
        if (!isVideoInPlaylist(videoObj.id, playlistId)) {
          addVideoToPlaylist(videoObj, playlistId);
          console.log(`Video wurde zur Playlist mit der ID ${playlistId} hinzugefügt`);   
        }
      } else {
        removeVideoFromPlaylist(videoObj, playlistId);
        console.log(`Video wurde von Playlist mit der ID ${playlistId} entfernt`);   
      }
    }
    removeFromDOM(modal);
    document.getElementById('addToPlaylistIcon').addEventListener('click', opener);
  });
  const cancelButton = addToDOM(`<div><a class="btn btn-small">${t('Abbrechen')}</a></div>`.parseHTML(), modal, InsertionService.AsLastChild, false).firstElementChild;
  cancelButton.addEventListener('click', function() {
    removeFromDOM(modal);
    document.getElementById('addToPlaylistIcon').addEventListener('click', opener);
  });
  addToDOM(modal, refElement, InsertionService.AsLastChild, true, 'playlistModal');
}
    })();
  }
  for (const flipflop of document.getElementsByClassName('flipflop')) {
    flipflop.prependEventListener('change', function() {
      const input = this.getElementsByTagName('input')[0];
      input.hasAttribute('checked') ? input.removeAttribute('checked') : input.setAttribute('checked', 'checked');
    });
  }
  if (!mainSwitchState) doChangeMainSwitch( false);
})();
