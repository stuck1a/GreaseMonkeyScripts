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
// @updateURL       https://raw.githubusercontent.com/stuck1a/GreaseMonkeyScripts/main/NuoFlix/EnhancedNuoFlix.js
// @downloadURL     https://raw.githubusercontent.com/stuck1a/GreaseMonkeyScripts/main/NuoFlix/EnhancedNuoFlix.js
// @supportURL      mailto:dev@stuck1a.de?subject=Meldung zum Skript 'Enhanced NuoFlix'&body=Problembeschreibung, Frage oder Feedback:
// ==/UserScript==


(function() {
  
  // Unique key used for the GM data storage to avoid naming conflicts across scripts
/**@global*/ const CACHE_KEY = 's1a/enhancednuoflix';

// Logger prefix
/**@global*/ const MSG_PREFIX = 'Enhanced NuoFlix';

// Fixed configs
/**@global*/ const highlightedCommentsColor = '#4A4A20';
/**@global*/ const highlightedRepliesColor = '#373434';
/**@global*/ const highlightedHasNewRepliesColor = '#52522a';
/**@global*/ const cssClassNewComments = 'newComment';
/**@global*/ const cssClassHasNewReplies = 'hasNewReply';
/**@global*/ const cssClassNewReplies = 'newReply';
/**@global*/ const expandedReplyCount = 3;

// Defaults
/**@global*/ const defaultStart = 1;
/**@global*/ const defaultLength = 5;
/**@global*/ const defaultLanguage = 'de';

// Map execution flows to pages
/**@global*/ const pageRoutes = new Map([
  // path       route name
  [ '/',        'start'   ],
  [ '/profil',  'profile' ],
  [ '/.+',      'video'   ],
]);
  /**@global*/ const i18n = new Map([
  
  [
    // German (base strings are german, so we need only the metadata here)
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
    ])
  ],
  
  [
    // Russian
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
    ])
  ],
  
]);
  


/**
 * Works like sprintf in PHP. Use {n} as placeholder, where
 * n is zero-indexed. Excepts n additional arguments of
 * any type.
 *
 * @param {string} format  - String to format
 *
 * @return {string}
 */
String.sprintf = function(format) {
  const args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] !== typeof undefined ? args[number].toString() : match;
  });
};



/**
 * @return {DocumentFragment}
 */
String.prototype.parseHTML = function() {
  let t = document.createElement('template');
  t.innerHTML = this;
  return t.content;
};



/**
 * Delete entries with a given value.
 * 
 * @param {any} value  - Target value
 * @param {?int|string} [limit=null]  - Limit amount of deleted entries, if multiple matches
 * 
 * @return {int}  - Amount of deleted entries
 */
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



/**
 * Search the Map for an given value.
 * 
 * @param {any} value  - Target value
 * 
 * @return {boolean}  - True, if the value was found at least once.
 */
Map.prototype.hasValue = function(value) {
  for (const entry of this.entries()) {
    if (value === entry[1]) return true;
  }
  return false;
};



/**
 * Returns an array of keys whose values equals the target value.
 * 
 * @param {any} value  - Target value
 * 
 * @return {any[]}
 */
Map.prototype.getKeysByValue = function(value) {
  let keys = [];
  for (const entry of this.entries()) {
    if (value === entry[1]) keys.push(entry[0]);
  }
  return keys;
};



/**
 * Robust and distinct merge of two arrays. The original arrays are not affected.
 * Note, that the distinction only targets the second array! If the first array
 * already included duplicates in itself, these duplicates will appear in the
 * result as well. To avoid this, use a nested call with an empty array:
 * mergeArraysDistinct(mergeArraysDistinct([], a), b)
 *
 * @param {Array} a
 * @param {Array} b
 * @param predicate
 *
 * @return {Array}
 */
const mergeArraysDistinct = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a];
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}



/**
 * Robust JSON parseable checker.
 *
 * @param {any} item  - Object to validate
 *
 * @return {boolean}  - True, if parseable to well-formatted JSON
 */
function isJson(item) {
  let value = typeof item !== 'string' ? JSON.stringify(item) : item;
  try {
    value = JSON.parse(value);
  } catch (e) {
    return false;
  }
  return typeof value === 'object' && value !== null;
}



/**
 * Returns the value stored under given key from the persistent data storage.
 * If the key does not exist, an empty string is returned instead.
 *
 * @param {string} key  - Target storage key
 * @param {boolean} [global=false]  - Omit script specific cache key
 *
 * @return {any}  - Value stored under given key
 */
function get_value(key, global = false) {
  if (typeof GM_setValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_setValue'), 'fatal');
  if (typeof GM_getValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_getValue'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  let val = GM_getValue(key) ?? null;
  if (isJson(val)) val = JSON.parse(val);
  return val ?? '';
}



/**
 * Adds a value to the persistence data storage under the given key.
 *
 * @param {string} key  - Target key
 * @param {any} value  - Value to store
 * @param {boolean} [global=false]  - Omit script specific cache key
 */
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


/**
 * Checks, whether the persistent data storage contains the given key.
 * Note, that this will only check for the key existence itself and will
 * therefore return true if the stored value itself is empty, null or
 * undefined as well.
 *
 * @param {string} key  - Target key
 * @param {boolean} [global=false]  - Omit script specific cache key
 *
 * @return {boolean}  - Whether the target key exists
 */
function has_value(key, global = false) {
  if (typeof GM_listValues !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_listValues'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  return GM_listValues().indexOf(key) >= 0;
}


/**
 * Deletes value stored under given key from the persistent data storage.
 *
 * @param {string} key  - Target key
 * @param {boolean} [global=false]  - Omit script specific cache key
 */
function delete_value(key, global = false) {
  if (typeof GM_deleteValue !== 'function') log(t('GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'GM_deleteValue'), 'fatal');
  if (!global) key = CACHE_KEY + '_' + key;
  GM_deleteValue(key);
}


/**
 * Returns an array with all stored key-value-pairs.
 * If no value is stored, an empty array is returned instead.
 * If you request global keys, you will get the real keys
 * (with the cache key prefix), otherwise the cache key
 * will be hidden.
 *
 * @param {boolean} [global=false]  - Omit script specific cache key
 *
 * @return {Object[{key: string, value: any}]}  - List of key-value-objects
 */
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



/**
 * Robust logger.
 * <br />Valid values for type are:<ul>
 *   <li>log</li>
 *   <li>info</li>
 *   <li>warn</li>
 *   <li>debug</li>
 *   <li>error</li>
 *   <li>exception</li>
 *   <li>dialog</li>
 *   <li>fatal</li>
 * </ul>
 *
 * <strong>Important:<br />Type <i>fatal</i> will throw an exception and stop the execution!</strong>
 *
 * @param {any} msg  - Log message or object
 * @param {string} [type='log']  - Message type
 * @param {any[]} [context=[]]  - Logging context (like function, args, etc)
 * @param {string} [prefix=${MSG_PREFIX}]  - Message prefix
 */
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



/**
 * Translates the given string to the active language.
 * If no corresponding translation exist, the input string is returned instead.
 *
 * @param {string} string  - Input string
 * @param {?any} [args=]  - Substitution strings for {n} formatter
 */
function t(string, ...args) {
  const lang = activeLanguage || defaultLanguage;
  if (!i18n.has(lang) || !i18n.get(lang).has(string)) return String.sprintf(string, ...args);
  return String.sprintf(i18n.get(lang).get(string), ...args);
}




/**
 * Count the amount of next siblings an element has.
 * @param {HTMLElement|DocumentFragment} element  - Target element
 * @return {number}  - Amount of next siblings
 */
function getNextSiblingCount(element) {
  let cnt = 0;
  let lastSibling = element;
  while (lastSibling.nextElementSibling) {
    lastSibling = lastSibling.nextElementSibling;
    cnt++;
  }
  return cnt;
}



/**
 * Calculates the line count of an given text element.
 * Note, that this will only return correct values if the element contains only text nodes
 * or elements which have no impact on the elements total height.
 * 
 * @param {HTMLElement} element  - Target element
 * 
 * @return {int}  - Line count
 */
function countElementLines(element) {
  return Math.floor(element.offsetHeight / parseInt(window.getComputedStyle(element).lineHeight));
}
  
/**
 * Uses the predefined route mappings to determine the route name
 * to decide the path of the further execution flow.
 * 
 * @return {string}  - Route name
 */
function getActiveRoute() {
  for (const route of pageRoutes.entries()) {
    if (window.location.pathname.match(new RegExp(`^${route[0]}/*$`, 'i'))) return route[1];
  }
  return '';
}



/**
 * @class InsertionService
 * @description Injects new elements to the DOM. Use {@link addToDOM} to access this service.
 * 
 * @requires log
 */
class InsertionService {
  /** Insert like <code>ref.prependChild(elem)</code> */
  static AsFirstChild = new InsertionService('AsFirstChild');
  /** Insert like <code>ref.appendChild(elem)</code> */
  static AsLastChild = new InsertionService('AsLastChild');
  /** Insert like <code>ref.parentElement.insertBefore(elem, ref)</code> */
  static Before = new InsertionService('Before');
  /** Insert like <code>ref.parentElement.insertAfter(elem, ref)</code> */
  static After = new InsertionService('After');

  constructor(name = '') { this.name = name }
  
  /**
   * Applies the insertion.
   * 
   * @param {HTMLElement} element
   * @param {HTMLElement} refElement
   * @param {InsertionService} method
   */
  static insert(element, refElement, method) {
    const buildLogContext = function() {
      return [
        t('Einzufügendes Element:'), element,
        t('Referenz-Element:'), refElement,
        t('Verwendete Methode:'), method.name
      ];
    }
    
    switch (method) {
      // as first child
      case this.AsFirstChild:
        if (refElement.hasChildNodes()) {
          refElement.insertBefore(element, refElement.childNodes[0]);
          break;
        }
        refElement.appendChild(element);
        break;
      // as last child
      case this.AsLastChild:
        refElement.appendChild(element);
        break;
      // before
      case this.Before:
        if (refElement.parentElement) {
          refElement.parentElement.insertBefore(element, refElement);
          break;
        }
        log(t('Element kann nicht vor dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!'), 'error', buildLogContext());
        break;
     // after
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



/**
 * Insert a custom element to the DOM and add its reference to the global register of custom elements.
 * 
 * @requires InsertionService
 * @requires customElementsRegister
 * @requires log
 * @requires t
 * 
 * @param {DocumentFragment|HTMLElement} element  - Element to insert
 * @param {HTMLElement|string} refElement  - Reference element for the placement (can be an element id as well)
 * @param {InsertionService} method  - Insertion logic to use
 * @param {boolean} [register=true]  - Whether the element shall be added to the register of custom elements
 * @param {?string} registerId  - ID under which the element is added to the register. 
 *                                If no access is needed later on, can be omitted or set to null (will use random ID).
 *
 * @return {HTMLElement|HTMLElement[]|DocumentFragment}  - Reference (or list of references) of inserted element(s) or
 *   the input itself, if something went wrong.
 */
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
  } else if (element instanceof HTMLElement) {
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



/**
 * Deletes a custom element from the DOM and from the register, if it was a registered element.
 * 
 * @requires customElementsRegister
 * @requires disabledPrimalElementsRegister
 * @requires Map.prototype.deleteByValue
 * 
 * @param {HTMLElement|string} elementOrId  - Can be the element itself, its id or the register id
 * @param {boolean} [force=false]  - Remove element, even if it is no custom element
 * @return {boolean}  - Whether the removal succeeded or not
 */
function removeFromDOM(elementOrId, force = false) {
  // if we got the element itself
  if (elementOrId instanceof HTMLElement) {
    if (customElementsRegister) customElementsRegister.deleteByValue(elementOrId, 1);
    if (force || elementOrId.hasAttribute('data-customElement')) {
      if (disabledPrimalElementsRegister && !elementOrId.hasAttribute('data-customElement')) {
        disabledPrimalElementsRegister.deleteByValue(elementOrId, 1);
      }
      elementOrId.remove();
      return true;
    }
    return false;
  }
  
  // if we got the register id
  if (customElementsRegister && customElementsRegister.has(elementOrId)) {
    const element = customElementsRegister.get(elementOrId);
    if (element instanceof HTMLElement) element.remove();
    customElementsRegister.delete(elementOrId);
    return true;
  }
  
  // if we got the element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) {
    if (customElementsRegister) customElementsRegister.deleteByValue(elementOrId, 1);
    if (force || elementOrId.hasAttribute('data-customElement')) {
      if (disabledPrimalElementsRegister && !elementOrId.hasAttribute('data-customElement')) {
        disabledPrimalElementsRegister.deleteByValue(elementOrId, 1);
      }
      elementOrId.remove();
      return true;
    }
    return false;
  }
  
  return false;
}



/**
 * Hides original content of the page and registers the hidden element, so we
 * always know all disabled primal content to allow features like disabling the user script.
 * 
 * <br><br><i><strong>Important note:</strong><br>
 * The register is distinct, which means if the given element is already registered, it will only
 * update the register id instead of adding a duplicate entry!</i>
 * 
 * @requires disabledPrimalElementsRegister
 * @requires Map.prototype.deleteByValue
 * 
 * @param {HTMLElement|string} elementOrId  - Target element, its id or register id
 * @param {?string} registerId  - ID under which the element is added to the register.
 *                                If omitted or null, an unique ID will be created.
 *
 * @return {boolean}  - False, if the target is not found or tagged as custom element, true otherwise.
 */
function disablePrimalElement(elementOrId, registerId = null) {
  const apply = function(id, element) {
    element.classList.add('hidden');
    if (disabledPrimalElementsRegister) {
      if (!id) id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      // if this element is already stored, then just update the register id
      disabledPrimalElementsRegister.deleteByValue(element, 1);
      disabledPrimalElementsRegister.set(id, element);
    }
    return true;
  };
  
  // if we got an element
  if (elementOrId instanceof HTMLElement) return apply(registerId, elementOrId);
  
  // if we got an element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) return apply(registerId, elementOrId);
  
  // if we got an register id
  if (disabledPrimalElementsRegister.has(elementOrId)) return apply(elementOrId, disabledPrimalElementsRegister.get(elementOrId));
  
  return false;
}



/**
 * Restores hidden original page content.
 *
 * @requires disabledPrimalElementsRegister
 * 
 * @param {HTMLElement|string} elementOrId  - Target element, its element id or register id
 *
 * @return {boolean}  - Whether the operation succeeded or failed (will fail if the target is not found)
 */
function enablePrimalElement(elementOrId) {
  // if we got an element
  if (elementOrId instanceof HTMLElement) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    elementOrId.classList.remove('hidden');
    return true;
  }
  
  // if we got an register id
  if (disabledPrimalElementsRegister && disabledPrimalElementsRegister.has(elementOrId)) {
    const element =  disabledPrimalElementsRegister.get(elementOrId);
    element.classList.remove('hidden');
    return true;
  }
  
  // if we got an element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    elementOrId.classList.remove('hidden');
    return true;
  }
  
  return false;
}



/**
 * Adds a new element to the list of elements which aren't rebuilt on updates
 * but contains text which need to translated when the active language is changed.
 * As entry key the element itself is used.
 * The value is an object with property text and property args which is an array
 * holding all arguments for sending to t().
 * 
 * @requires staticTranslatableElements
 * 
 * @param {HTMLElement} element  - Target element
 * @param {string} text  - The text which will be send to t()
 * @param {string[]} [args=[]]  - The argument list for the formatters send to t()
 */
function registerStaticTranslatable(element, text, args = []) {
  if (!staticTranslatableElements.has(element)) {
    staticTranslatableElements.set(element, { text: text, args: args });
  }
}



/**
 * Click event handler for the global switch which
 * turns all of this UserScripts features on/off.
 *
 * @param {Event} ev
 */
function doChangeMainSwitch(ev) {
  // store new state
  mainSwitchState = !mainSwitchState;
  set_value('scriptEnabled', mainSwitchState);
    
  // toggle visibility of custom elements
  for (const element of customElementsRegister.values()) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? entry.classList.remove('hidden') : entry.classList.add('hidden');
    } else {
      this.checked ? element.classList.remove('hidden') : element.classList.add('hidden');
    }
  }
  // toggle visibility of original elements
  const register = Array.from(disabledPrimalElementsRegister.values());    // avoid infinity loop
  for (const element of register) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? disablePrimalElement(entry) : enablePrimalElement(entry);
    } else {
      this.checked ? disablePrimalElement(element) : enablePrimalElement(element);
    }
  }
}



/**
 * This function is responsible for update all i18n content.
 * All those elements which need such a manual update must be registered with {@link registerStaticTranslatable} once.
 */
function updateStaticTranslations() {
  for (const element of staticTranslatableElements.entries()) element[0].innerText = t(element[1].text, element[1].args);
}

  
/**
 * Marks some comments as new and inserts some fake replies here and there
 */
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



/**
 * Get txt_id, btn_id and the text from an original comment block
 *
 * @param {int} which  - One-indexed id of the target comment (positive integer)
 * @returns {{commentNr, txt_id: string, text: string, btn_id: string}}  - The two server-side ids which describe each comment/reply uniquely
 */
function getOriginalCommentIds(which) {
    const elem = document.getElementById('originalCommentContainer').children[which-1].lastElementChild.lastElementChild.lastElementChild.lastElementChild;
    const txt_id = elem.getAttribute('data-reply');
    const btn_id = elem.getAttribute('data-id');
    const text = (elem.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerText).substring(0,50) + '...'
    return { commentNr: which, txt_id: txt_id, btn_id: btn_id, text: text };
}
  
/**
 * Generates and opens an element as pop-up.
 * 
 * @param {HTMLElement} element  - Element which contains the the modal content
 * @param {?string} [id=null]  - If set, the value will be used as modal element id and register id
 */
function openModal(element, id = null) {
  // wrap the content to ensure correct displaying no matter of the elements display value
  const wrapper = document.createElement('div');
  wrapper.classList.add('customModal');
  wrapper.append(element);
  
  // middle-layer to darken the background
  const background = document.createElement('div');
  background.classList.add('customModal_middlelayer');
  
  
  addToDOM(background, document.body, InsertionService.AsLastChild, false);
  addToDOM(wrapper, document.body, InsertionService.AsLastChild, true, id);
}
// style sheet for modals
addToDOM(`
  <style>
    .customModal {
      position: fixed;
      min-height: max(10%, 3rem);
      max-height: 70%;
      min-width: max(10%, 3rem);
      max-width: 70%;
      margin: auto;
    }
    .customModal_middlelayer {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: #0004; /* 25% transparency */
    }
  </style>
`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  
  addToDOM(`<style>:root {
  --svg-checked: url('data:image/svg+xml;utf8,<svg height="1rem" width="1rem" fill="%2332CD32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>');
  --svg-unchecked: url('data:image/svg+xml;utf8,<svg height="1rem" width="1rem" fill="%23FF0000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>');
  --svg-revert: url('data:image/svg+xml;utf8,<svg height="1rem" width="1rem" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000"><path fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/><path fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/></svg>');
  --theme-color: #d53d16;
  --theme-color-brigthen: #bd8656;
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
.hidden { display: none !important }
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
.buttonGroup {
  display: inline-block;
}
.btn:not(.disabled):hover {
  font-weight: bold;
  background-color: var(--theme-color-brigthen);
}
.clearfix::after {
  content: "";
  clear: both;
  display: table;
}
.disabled {
  background-color: darkgray !important;
  color: lightgray !important;
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
.svgColorized .svgColoredStroke { stroke: var(--color) }</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>/*<SKIP>
  Styles for FlipFlop-Switch
  To insert one, use:
  <div class="flipflop">
    <span>Caption</span>
    <label><input type="checkbox" checked="checked" /><span></span></label>
  </div>
  
  To adjust configuration, following css-vars can be set to any element with the .flipflop class.
  If a variable is not set, it will get a default value.
  
  --width
  --speed
  --color-thumb
  --color-on
  --color-off
  --label-offset
<SKIP>*/
.flipflop {
  /* set defaults for unset variables */
  --_width: var(--width, 3rem);
  --_speed: var(--speed, 0.4s);
  --_color-thumb: var(--color-thumb, #fff);
  --_color-on: var(--color-on, #2196F3);
  --_color-off: var(--color-off, #ccc);
  --_label-offset: var(--label-offset, 1rem);
  /* mandatory */
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


  /**@global*/ let mainSwitchState;
  /**@global*/ let customElementsRegister = new Map();
  /**@global*/ let disabledPrimalElementsRegister = new Map();
  /**@global*/ let staticTranslatableElements = new Map();
  
  // set up script-wide variables (used in all/multiple routes)
  /**@global*/ let totalComments;
  /**@global*/ let paginationContainer, paginationContainerBottom, paginationControlContainer, paginationControlContainerBottom;
  /**@global*/ let customCommentContainer,originalCommentContainer



  // TODO: Should be profile page specific
  /**@global*/ let currentStart = defaultStart;
  /**@global*/ let currentLength = defaultLength;
  /**@global*/ let activeLanguage = defaultLanguage;
  /**@global*/ let filteredCommentsCount = 0;

  /**@global*/ let commentFilters = new Map([
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],
    [ 'filterSkipUser', { active: false, value: [] } ],
    [ 'filterTextSearch', { active: false, value: [] } ],
    [ 'filterDateRange', { active: false, value: [] } ],
  ]);

  
  
  /* add switch to header which enables/disables all features of this Userscript */
  // get stored state or initialize it
  if (has_value('scriptEnabled')) {
    mainSwitchState = get_value('scriptEnabled');
  } else {
    set_value('scriptEnabled', true);
    mainSwitchState = true;
  }
  
  // insert switch
  /**@global*/ const mainSwitch = `
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


  
  // hand over execution flow depending on the route (literally the current page)
  const route = getActiveRoute();
  if (route === 'start') {
    (function() { // set up route-scoped fields and start the execution flow fo this route
execute_startPage();
/**
 * Main function of this route
 */
function execute_startPage() {
  // ... do stuff ...
  
  // initialize i18n strings
  updateStaticTranslations()
} })();
  } else if (route === 'profile') {
    (function() { // set up route-scoped fields and configs, then start the execution flow fo this route
let commentData;
let storedCommentData;
const maxCommentHeightBeforeCut = 250;  // in pixel

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
              <span id="revertFilterTextInput" class="hidden clickable" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
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
                <span id="revertFilterUserInput" class="hidden clickable" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
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
                <span id="revertDateRangeInputs" class="hidden clickable" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
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
      <fieldset id="settingsContainer" class="card col-5">
        <legend id="settingsLabel"></legend>
        <div id="settingsLanguage" class="row">
          <label id="settingsLanguageLabel" class="col-5"></label>
        </div>
      </fieldset>
    </div>
  </div>`.parseHTML();

execute_profilePage();



/**
 * Main function of this route
 * 
 * @use module:Base~originalCommentContainer
 * 
 */
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
    
  // insert all style sheets used in this route
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
  margin-inline: 0 !important;
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
  margin-inline: 0 !important;
  padding-inline: 2rem;
  border-radius: 25% 10% 10% 25%;
}

#paginationFirst {
  border-radius: 50% 20% 20% 50%;
  padding-inline: 1rem;
  padding-block: 0 !important;
  margin-inline-start: 0 !important;
}

.pageNrBtn {
  padding-inline: max(1vw, 10px);
  margin-inline: .25rem !important;
}

.pageNrBtn.activePage {
  cursor: default !important;
  font-weight: bold !important;
  background-color: #c86852 !important;
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
  color: #f00;
  content: var(--svg-unchecked);
  vertical-align: middle;
  display: inline-flex;
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
}</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(style_comments, document.body, InsertionService.AsLastChild, false);
  
  // insert the additional UI section
  enhancedUiContainer = addToDOM(enhancedUiContainer, document.getElementsByClassName('wrapper')[1], InsertionService.AsFirstChild, true, 'enhancedUiContainer');
  
  // register all static elements from enhancedUiContainer with text to translate
  registerStaticTranslatable(document.getElementById('ignoredLabel'), 'Blockierte Benutzer');
  registerStaticTranslatable(document.getElementById('addIgnoreUser'), 'Hinzufügen...');
  registerStaticTranslatable(document.getElementById('deleteIgnoreUser'), 'Entfernen');
  registerStaticTranslatable(document.getElementById('filterOnlyNewLabel'), 'Nur neue Kommentare');
  registerStaticTranslatable(document.getElementById('pluginHeadline'), 'NuoFlix 2.0');
  registerStaticTranslatable(document.getElementById('filterLabel'), 'Kommentare filtern');
  registerStaticTranslatable(document.getElementById('searchInputLabel'), 'Suche:');
  registerStaticTranslatable(document.getElementById('moreFilterTrigger'), 'Erweiterte Filteroptionen');
  registerStaticTranslatable(document.getElementById('useAndLogicLabel'), 'Muss alle Wörter enthalten');
  registerStaticTranslatable(document.getElementById('searchByUserLabel'), 'nach Benutzer:');
  registerStaticTranslatable(document.getElementById('searchByDateLabel'), 'nach Datum:');
  registerStaticTranslatable(document.getElementById('settingsLabel'), 'Einstellungen');
  registerStaticTranslatable(document.getElementById('settingsLanguageLabel'), 'Sprache:');
  
  // restore list of blocked users
  for (const user of get_value('ignoredUsers')) {
    addToDOM(`<option>${user}</option>`.parseHTML(), 'ignoredUsers', InsertionService.AsLastChild, false);
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
  }
  
  // disable the original comment container
  originalCommentContainer = document.getElementsByClassName('profilContentInner')[0];
  if (!originalCommentContainer) log(t('DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.'), 'fatal');
  disablePrimalElement(originalCommentContainer, 'originalCommentContainer');
  
  // get last state of stored comments (to identify new comments), then update the storage
  storedCommentData = get_value('commentData');
  commentData = generateCommentObject();
  commentData = DEBUG_setSomeFakeData(commentData);    // TODO: Remove debug data
  set_value('commentData', commentData);

  // count comments
  totalComments = commentData.length;
  
  // build and insert our own comment container
  customCommentContainer = addToDOM(
    '<div id="customCommentContainer" class="profilContentInner"></div>'.parseHTML(),
    originalCommentContainer,
    InsertionService.Before,
    true, 
    'customCommentContainer'
  );

  // generate datalist for autocompletion of user filter input
  addUserFilterAutocompletionList();
  
  
  // mount handler for adding a user to the list of users to search for
  document.getElementById('filterByUser').onkeypress = function(ev) {
    if (!ev) ev = window.event;
    let keyCode = ev.code || ev.key;
    // if user pressed enter
    if (keyCode === 'Enter' || keyCode === 'NumpadEnter') {
      // add only if user is found
      for (const element of document.getElementById('availableUsers').children) {
        if (element.value === this.value) {
          doAddUserToFilterList(this);
          break;
        }
      }
    }
    // if user has entered a comma or space
    else if (keyCode === ',' || keyCode === ' ') {
      // remove the comma/space
      this.value = this.value.substring(0, this.value.length - 1);
      // add only if user is found
      for (const element of document.getElementById('availableUsers').children) {
        if (element.value === this.value) {
          doAddUserToFilterList(this);
          break;
        }
      }
    }
  };
  
  
  // mount handler for the text search filter
  let textFilterDelayActive = false;
  document.getElementById('filterByText').oninput = function(ev) {
    const revertFilterTextInput = document.getElementById('revertFilterTextInput');
    let textFilter = commentFilters.get('filterTextSearch');
    if (this.value) {
      revertFilterTextInput.classList.remove('hidden');
    } else {
      revertFilterTextInput.classList.add('hidden');
      textFilter.value = [];
      textFilter.active = false;
    }
    // add delay before updating the page to reduce performance impact
    if (!textFilterDelayActive) {
      textFilterDelayActive = true;
      setTimeout(function() {
        // reset execution delayer
        textFilterDelayActive = false;
        // update filter
        textFilter.value = this.value.split(' ');
        textFilter.active = true;
        // update page
        updatePage();
      }.bind(this), 150);
    }
  };
  
  
  // mount handlers for the date search filter
  document.getElementById('filterByDateFrom').oninput = function(ev) {
    doUpdateDateFilter(this, document.getElementById('filterByDateTo'));
  };
  document.getElementById('filterByDateTo').oninput = function(ev) {
    doUpdateDateFilter(document.getElementById('filterByDateFrom'), this);
  };

  
  // mount handler for changing the text search logic
  document.getElementById('filterAllWords').addEventListener('change', function() {
    if (document.getElementById('filterByText').textLength > 0) updatePage();
  });
  
  
  // mount handler for the reset button of the date range filter
  document.getElementById('revertDateRangeInputs').addEventListener('click', function() {
    document.getElementById('filterByDateFrom').value = '';
    document.getElementById('filterByDateTo').value = '';
    let filter = commentFilters.get('filterDateRange');
    filter.active = false;
    filter.value = [];
    this.classList.add('hidden');
    updatePage();
  });

  
  // mount handler for the reset button of the user filter
  document.getElementById('revertFilterUserInput').addEventListener('click', function(ev) {
    // clear the displayed filter values
    const filteredUserList = document.getElementById('filteredUserList');
    while (filteredUserList.firstChild) filteredUserList.removeChild(filteredUserList.lastChild);
    // clear the filter
    let userFilter = commentFilters.get('filterOnlyUser');
    userFilter.value = [];
    userFilter.active = false;
    // restore the autocompletion list
    addUserFilterAutocompletionList();
    this.classList.add('hidden');
    updatePage();
  });

  
  // mount handler for the reset button of the text filter
  document.getElementById('revertFilterTextInput').addEventListener('click', function(ev) {
    // clear the displayed filter values
    document.getElementById('filterByText').value = '';
    // clear the filter
    let textFilter = commentFilters.get('filterTextSearch');
    textFilter.value = [];
    textFilter.active = false;
    this.classList.add('hidden');
    updatePage();
  });


  // mount handlers for user block feature
  document.getElementById('addIgnoreUser').addEventListener('click', function() {
    let user = prompt(t('Folgenden Benutzer zur Ignorieren-Liste hinzufügen:'));
    if (user) user = user.trim();
    if (user === null || user === '') return;
    const selectElement = document.getElementById('ignoredUsers');
    for (const option of selectElement.children) {
      if (option.innerText === user) return;
    }
    addToDOM(`<option>${user}</option>`.parseHTML(), 'ignoredUsers', InsertionService.AsLastChild, false);
    // update filter
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
    // update storage
    set_value('ignoredUsers', ignoreFilter.value);
    // if the blocked user is on the filter list of users to search for, then remove it from that list
    for (const selectedUser of document.getElementById('filteredUserList').children) {
      if (selectedUser.firstElementChild.innerText === user) {
        removeFromDOM(selectedUser);
        break;
      }
    }
    // update autocompletion list
    addUserFilterAutocompletionList();
    // update page
    updatePage();
  });

  document.getElementById('deleteIgnoreUser').addEventListener('click', function() {
    const selectElement = document.getElementById('ignoredUsers');
    if (selectElement.selectedOptions.length > 0) {
      const user = selectElement.selectedOptions[0].innerText.trim();
      selectElement.selectedOptions[0].remove();
      this.classList.add('disabled');
      const ignoreFilter = commentFilters.get('filterSkipUser');
      // update filter
      const oldIgnoreList = ignoreFilter.value;
      ignoreFilter.value = [];
      for (const entry of oldIgnoreList) {
        if (entry !== user) ignoreFilter.value.push(entry);
      }
      if (ignoreFilter.value.length === 0) ignoreFilter.active = false;
      // update storage
      set_value('ignoredUsers', ignoreFilter.value);
      // update autocompletion list
      addUserFilterAutocompletionList();
      // update page
      updatePage();
    }
  });

  // only enable the button for deleting users from block list if an entry is selected
  document.getElementById('ignoredUsers').addEventListener('change', function() {
    const deleteButton = document.getElementById('deleteIgnoreUser');
    this.selectedIndex === -1 && deleteButton
      ? deleteButton.classList.add('disabled')
      : deleteButton.classList.remove('disabled');
  });
  
  // mount handler for the "new only" filter button
  document.getElementById('filterOnlyNew').addEventListener('change', function() {
    changeFilter('filterOnlyNew', !commentFilters.get('filterOnlyNew').value);
    if (commentFilters.get('filterOnlyNew').active) {
      // no need to highlight new comments if we filter all not new
      document.getElementById('style_newComment').innerText = '';
    } else {
      document.getElementById('style_newComment').innerText = `.newComment { background-color: ${highlightedCommentsColor} }`;
    }
  });
  
  // initially generate and insert all dynamic components
  updatePage();
  insertLanguageDropdown();

  // mount handler for selecting another length value
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
  document.getElementById('pageLengthSelectBottom').addEventListener('change', doChangeLength);
}




/**
 * Event handler hooked to the input event on both date inputs.
 * 
 * @param {HTMLInputElement} fromInput
 * @param {HTMLInputElement} toInput
 */
function doUpdateDateFilter(fromInput, toInput) {
  const revertDateRangeInputs = document.getElementById('revertDateRangeInputs');
  let filterDateRange = commentFilters.get('filterDateRange');
  // show/hide reset button
  if (fromInput.value === '' && toInput.value === '') {
    filterDateRange.active = false;
    filterDateRange.value = [];
    revertDateRangeInputs.classList.add('hidden');
    return;
  } else {
    revertDateRangeInputs.classList.remove('hidden');
  }
  // do nothing until we have a valid, positive date range
  if (
    !(fromInput.valueAsDate instanceof Date) ||
    !(toInput.valueAsDate instanceof Date) ||
    (toInput.valueAsDate < fromInput.valueAsDate)
  ) return;
  // adjust the time parts to include the entered days and update the filter values
  filterDateRange.value = [
    fromInput.valueAsDate.setHours(0, 0, 0, 0),
    toInput.valueAsDate.setHours(23, 59, 59, 999)
  ];
  filterDateRange.active = true;
  // update page
  updatePage();
}




/**
 * Generates the data object for storing existing comments
 * by parsing the container holding which contains all the
 * comments.
 *
 * @return {Object[]}  - Comment data collection
 */
function generateCommentObject() {
  // get raw data
  let RawData = document.getElementsByClassName('profilContentInner')[0];
  if (!RawData) return [];
  let commentBlocksRaw = RawData.getElementsByClassName('commentItem');

  // generate data array for each raw comment
  let commentDataCollection = [];
  let counter = 0;
  let tmp;
  for (const commentRaw of commentBlocksRaw) {
    let commentItemData = {};
    commentItemData.id = ++counter;

    // section 'form'
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
    // section 'video'
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

    // section 'replies'
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




/**
 * (Re-)creates and inserts the datalist element which will be used for autocompletion of the user filter input.
 */
function addUserFilterAutocompletionList() {
  // remove the current list, if available
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
    // prevent duplicates and blocked users
    if (alreadyInsertedUsers.indexOf(comment.user) === -1 && blockedUsers.indexOf(comment.user) === -1) {
      addToDOM(`<option value="${comment.user}"></option>`.parseHTML(), availableUsersForFilter, InsertionService.AsLastChild, false);
      alreadyInsertedUsers.push(comment.user);
    }
    // check replies of each comment, too
    for (const reply of comment.replies) {
      if (alreadyInsertedUsers.indexOf(reply.user) === -1 && blockedUsers.indexOf(reply.user) === -1) {
        addToDOM(`<option value="${reply.user}"></option>`.parseHTML(), availableUsersForFilter, InsertionService.AsLastChild, false);
        alreadyInsertedUsers.push(reply.user);
      }
    }
  }
}




/**
 * Uses the data of a single comment including all
 * its replies to generate an HTML comment with
 * the original structure which can be appended
 * to the page's comment blocks section.
 *
 * @param {object} commentData  - Comment data
 *
 * @return {void|DocumentFragment}  - Prepared comment block
 */
function buildCommentBlock(commentData) {
  if (!commentData) return;

  // generate replies
  let cnt = 0;
  let repliesBlock = '';
  const ignoreFilter = commentFilters.get('filterSkipUser');
  outer: for (const replyData of commentData.replies) {
    // skip if reply is from an ignored user
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

  // generate comment including the pre-generated replies
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

  return commentBlock.parseHTML();
}




/**
 * Search in the stored comment data for the comment matching
 * both given id's checks, whether it's a new comment or not.
 *
 * <strong>Note: For now, we compare both ids, since it's not known what
 * they exactly mean and if both are unique by themselves or not.</strong>
 *
 * @param {string|int} btn_id  - The first server-side comment id
 * @param {string|int} txt_id  - The second serve-side comment id
 *
 * @return {boolean}  - Value of stored comments "isNew" property
 */
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



/**
 * Search in the stored comment data for the comment matching
 * both given id's and count its replies, if found.
 *
 * <strong>Note: For now, we compare both ids, since it's not known what
 * they exactly mean and if both are unique by themselves or not.</strong>
 *
 * @param {string|int} btn_id  - The first server-side comment id
 * @param {string|int} txt_id  - The second serve-side comment id
 * @return {int}  - Reply count (0 if comment not found)
 */
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



/**
 * Count how many comments are filtered overall
 *
 * @return {int}
 */
function getFilteredCount() {
  let count = 0;
  for (const comment of commentData) {
    if (!applyFilters(comment)) count++;
  }
  return count;
}



/**
 * Adds fade out effect to a comment or reply text element and adds a "Show More" button next to it
 *  
 * @param {HTMLPreElement} textElement  - Target text element
 */
function addFadeOutEffect(textElement) {
  // add class which will fade out the text
  textElement.classList.add('hasOverflow');
  // add the "Show more" button
  const showFullLength = addToDOM(
    `<div class="showFullLength">${t('Mehr anzeigen')}</div>`.parseHTML(),
    textElement,
    InsertionService.After,
    false
  );
  // mount handler of the "Show more" button
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
  // collect all filtered comments (on-the-fly would invalidate the counter)
  let filteredComments = [];
  for (const comment of commentData) {
    if (applyFilters(comment)) filteredComments.push(comment);
  }
  while (insertedComments < currentLength) {
    // stop if we have filtered as many comments as we even have in total
    if (counter > totalComments || counter / currentPage > filteredComments.length) break;
    // add comment to page
    commentItemElement = buildCommentBlock(filteredComments[currentStart + insertedComments - 1]);
    if (commentItemElement) {
      commentItemElement = addToDOM(commentItemElement, customCommentContainer, InsertionService.AsLastChild, false);
      insertedComments++;
      // add fade out effect to comment text if text is longer than the limit
      const commentTextElement = commentItemElement.getElementsByClassName('commentText')[0];
      if (commentTextElement && commentTextElement.scrollHeight > maxCommentHeightBeforeCut) addFadeOutEffect(commentTextElement);
      // do the same for all replies of the comment
      for (const replyTextElement of commentItemElement.getElementsByClassName('replyText')) {
        if (replyTextElement && replyTextElement.scrollHeight > maxCommentHeightBeforeCut) addFadeOutEffect(replyTextElement);
      }
    }
    counter++;
  }
}




/**
 * @param {object} commentData
 *
 * @return {boolean} True, if the comment shall be displayed, false if not
 */
function applyFilters(commentData) {
  /* show only, if the comment is new or has new replies */
  if (commentFilters.get('filterOnlyNew').active) {
    if (!commentData.isNew && !commentData.hasNewReplies) return false;
  }
  /* show only, if one of the comment or one of its replies is from a user listed in the username filter list */
  if (commentFilters.get('filterOnlyUser').active) {
    let match = false;
    for (const currentFilterEntry of commentFilters.get('filterOnlyUser').value) {
      // get a list of all related users (comment author and all replies authors)
      const usersFromReplies = commentData.replies.map(function (item) { return item.user || ''; });
      const relatedUsers = mergeArraysDistinct([commentData.user], usersFromReplies);
      // check if the current user from filter list is in the author list
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
  // NICE2HAVE: Highlight matches
  //            One possibility for that would be wrap the matches here in span's and store a deep copy of the comment
  //            in the comment data itself. Then when printing the comments check, whether the text filter is active and
  //            if so, use this copy instead of the normal data. Would require to rebuild the copy data here each time.
  if (commentFilters.get('filterTextSearch').active) {
    // collect all string to search in (uppercase to make the search case-insensitive)
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
      // check whether all words are at least once somewhere in the related data
      outer: for (const searchTag of commentFilters.get('filterTextSearch').value) {
        for (const content of relatedContent) {
          if (content.indexOf(searchTag.toUpperCase()) !== -1) {
            wordsFound++;
            continue outer;
          }
        }
      }
      // do we have a match for each given word?
      if (wordsFound < commentFilters.get('filterTextSearch').value.length) return false;
    } else {
      /* OR logic - must contain ANY search word */
      // NICE2HAVE: Count matches and add the match count in percentage to the comment data, then sort them after when in callee.
      //            But it probably makes sense to wait with that feature until a general
      //            sort feature is implemented so we can use those functions for this sorting as well
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


/**
 * Reorders a date string formatted as dd.mm.yyyy [hh:mm][:ss] into JS standard date format.
 * 
 * @param {string} string  - Target date string
 * 
 * @return {?string}  - JS date object compatible date string or null if input string is invalid
 */
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
  // use local copy to adjust the value after filter were applied
  let _totalComments = totalComments - filteredCommentsCount;
  const totalPages = Math.ceil(_totalComments / currentLength);
  const currentPage = Math.ceil((currentStart + 0.00001) / currentLength);
  let firstPageButton = currentPage >= 4 ? currentPage - 2 : 1;
  let highestPageButton = totalPages >= 5 ? firstPageButton + 4 : totalPages;

  // adjust if upper bound reached
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
      <div class="buttonGroup">
        <a id="paginationFirst" class="btn${(currentPage > 1 ? '"' : ' disabled" disabled="disabled"')} data-start="1" data-length="${currentLength}">1</a>
        <a id="paginationBack" class="btn${(currentPage > 1 ? '"' : ' disabled" disabled="disabled"')} data-start="${BtnBack_Start}" data-length="${currentLength}"><</a>
      </div>
      <div id="pageNrBtnContainer" class="buttonGroup">${buttons}</div>
      <div class="buttonGroup">
        <a id="paginationNext" class="btn${(currentPage < totalPages ? '"' : ' disabled" disabled="disabled"')} data-start="${BtnNext_Start}" data-length="${currentLength}">></a>
        <a id="paginationLast" class="btn${(currentPage < totalPages ? '"' : ' disabled" disabled="disabled"')} data-start="${BtnLast_Start}" data-length="${currentLength}">${totalPages}</a>
      </div>
    </div>
  `;
}




/**
 * Generates a single page button (a numbered one, none
 * of the jumps buttons like "next" or "first")
 *
 * @param {int|string} pageNr  - Becomes Buttons caption
 * @param {int|string} buttonStart  - ID of the first comment to display if this button is clicked
 * @param {boolean} isActivePage  - If true, button will get class "activePage" and attribute "disabled"
 *
 * @return {string}  Parseable string representation of the button
 */
function buildPageButton(pageNr, buttonStart, isActivePage = false) {
  return `<a class="btn pageNrBtn${(isActivePage ? ' activePage" disabled="disabled"' : '"')} data-start="${buttonStart}" data-length="${currentLength}">${pageNr}</a>`;
}



/**
 * @param {string} suffix  - If set, appends this string to all element IDs
 * @return {string}
 */
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
        <span>&gt;</span>
      </div>
      <div class="customDropdownMenu"></div>
    </div>
  `.parseHTML();

  // insert as first element after the section headline
  const settingsLanguageLabel = document.getElementById('settingsLanguageLabel');

  // Some weird side effect causes that we have the DocumentFragment here so lets simply get the element from the register again
  enhancedUiContainer = customElementsRegister.get('enhancedUiContainer');
  const languageContainer = addToDOM(languageContainerHtml, settingsLanguageLabel, InsertionService.After, true, 'language_container');

  // insert an entry for each language defined in global var i18n
  for (const language of i18n.entries()) {
    const metadata = language[1].get('__metadata__');
    const langEntryHtml = `<div id="lang_${language[0]}" data-lang="${language[0]}">${metadata.icon}<span>${metadata.displayName}</span></div>`;
    addToDOM(langEntryHtml.parseHTML(), languageContainer.lastElementChild, InsertionService.AsLastChild, false);
  }
  // mount handler for all language entries
  for (const langItem of languageContainer.lastElementChild.children) {
    langItem.addEventListener('click', function(ev) {
      const langId = this.getAttribute('data-lang');
      if (i18n.has(langId)) {
        activeLanguage = langId;
        updatePage();
      }

      // rebuild the language menu so the hover effect loses its effect causing the menu to close
      languageContainer.remove();
      insertLanguageDropdown();
    });
  }
}



/**
 * Generates the comment sorting dropdown in default state (no "relevance" option) and adds it to the DOM.
 * Must be inserted after the pagination container since it uses it as reference for the insert location.
 */
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

  // TODO: option handlers + click (rebuild menu) handler (see language menu)
  
  
  
  
  addToDOM(sortingContainerHtml, paginationContainer, InsertionService.Before, true, 'sortingController');
}




/**
 * Click event handler for the "comments per page"
 * select box of the pagination control.
 *
 * @param {MouseEvent} ev
 */
function doChangeLength(ev) {
  currentLength = parseInt(this.value) || currentLength;
  const currentPage = Math.ceil((currentStart + 0.000001) / currentLength);
  currentStart = currentLength * currentPage - currentLength + 1;

  // This will fix the edge case where filtered total is smaller than current start
  if (currentStart > totalComments - getFilteredCount()) currentStart = 1;

  updatePage();
}









/**
 * Event handler for all buttons within the pagination.
 * Excepts attributes 'data-start' and 'data-length' in the received element.
 *
 * @param {Event} ev  - Left click event
 * @param {HTMLElement} clickedBtn  - Clicked button
 */
function doClickedPagination(ev, clickedBtn) {
  if (!clickedBtn || clickedBtn.hasAttribute('disabled')) return;
  currentStart = parseInt(clickedBtn.getAttribute('data-start')) || currentStart || defaultStart;
  currentLength = parseInt(clickedBtn.getAttribute('data-length')) || currentLength || defaultLength;
  updatePage();
  paginationContainer.previousElementSibling.scrollIntoView()
}




/**
 * Event handler that is called whenever a new user is added to the list of users whose comments shall be searched for.
 * The current input value is cut out of the input field and added as new element to the div which shows all selected
 * users. This allows to use the autocompletion for adding another user and it looks super fancy as well.
 * 
 * @param {HTMLInputElement} input  - The input which fired the event
 */
function doAddUserToFilterList(input) {
  let userElement = `<span class="selectedUserFilter"><span>${input.value}</span><span></span></span>`.parseHTML();
  const filterOnlyUser = commentFilters.get('filterOnlyUser');
  userElement = addToDOM(userElement, document.getElementById('filteredUserList'), InsertionService.AsLastChild, false);
  
  // remove this username from autocompletion list
  const availableUsersForFilter = customElementsRegister.get('availableUsersForFilter');
  for (const entry of availableUsersForFilter.children) {
    if (entry.value === input.value) {
      removeFromDOM(entry, true);
      break;
    }
  }
  
  // show revert button
  document.getElementById('revertFilterUserInput').classList.remove('hidden');
  
  // mount event handler for removing this user from the filter list again
  userElement.lastElementChild.addEventListener('click', function() {
    const targetUsername = this.previousElementSibling.innerText;
    // make this user available for autocompletion again
    const datalistEntry = `<option value="${targetUsername}"></option>`.parseHTML();
    addToDOM(datalistEntry, availableUsersForFilter, InsertionService.AsLastChild, false);
    // remove the username from the filter values and disable the filter if this was the last entry
    const oldFilterUserList = filterOnlyUser.value;
    filterOnlyUser.value = [];
    for (const entry of oldFilterUserList) {
      if (entry !== targetUsername) {
        filterOnlyUser.value.push(entry);
      } 
    }
    if (filterOnlyUser.value.length === 0) {
      filterOnlyUser.active = false;
      // also hide the revert filter button
      document.getElementById('revertFilterUserInput').classList.add('hidden');
    }
    // remove user from the list which shows all selected users
    removeFromDOM(this.parentElement, true);
    // update comments
    updatePage();
  });
  
  // add the username to the filter values
  let currentFilterList = filterOnlyUser.value;
  currentFilterList.push(input.value);
  // clear the input, so the user can enter another user
  input.value = '';
  // apply filter and update comments
  changeFilter('filterOnlyUser', currentFilterList);
}




/**
 * Transformer for values from filter UI elements to filter data.
 * Used by all event handlers invoked through changing a filter value.
 *
 * @param {string} filterName
 * @param {boolean|string|Array} newValue
 */
function changeFilter(filterName, newValue) {
  // to simplify the calculation we will jump to page 1 if a filter has changed
  currentStart = 1;
  if (commentFilters.has(filterName)) {
    const filter = commentFilters.get(filterName);
    filter.value = newValue;
    commentFilters.get(filterName).active = typeof filter.value === 'boolean' ? filter.value : filter.value.length > 0;
  }
  updatePage();
}








/**
 * Deletes the pagination UI from DOM, if exists. Then rebuild + insert it again,
 * based on the values from the global variables currentStart and currentLength.
 */
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
  // insert a second pagination after the comments
  paginationContainerBottom = paginationContainer.cloneNode(true);
  paginationContainerBottom.id = paginationContainerBottom.id + 'Bottom';
  paginationContainerBottom = addToDOM(
    paginationContainerBottom,
    originalCommentContainer,
    InsertionService.Before,
    true,
    'paginationContainerBottom'
  );
  // handlers won't get cloned
  const paginationButtonsBottom = paginationContainerBottom.getElementsByClassName('btn');
  for (const paginationBtn of paginationButtonsBottom) {
    paginationBtn.addEventListener('click', function (e) {
      doClickedPagination(e, this);
    });
  }
  // insert pagination control (displays from..to, length selection and such)
  paginationControlContainer = addToDOM(
    buildPaginationControl().parseHTML(),
    paginationContainer,
    InsertionService.After,
    true,
    'paginationControlContainer'
  );
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
  
  // insert a second pagination control after the comments
  paginationControlContainerBottom = addToDOM(
    buildPaginationControl('Bottom').parseHTML(),
    paginationContainerBottom,
    InsertionService.Before,
    true,
    'paginationControlContainerBottom'
  );
  document.getElementById('pageLengthSelectBottom').addEventListener('change', doChangeLength);
  
  // if no comments to display, hide pagination buttons
  if (totalComments === 0 || totalComments === filteredCommentsCount) {
    paginationContainer.classList.add('hidden');
    paginationContainerBottom.classList.add('hidden');
  }
}




/**
 * Deletes all comments from DOM and rebuild + insert them again based
 * on the values from the global variables currentStart and currentLength.
 */
function updateComments() {
  if (customCommentContainer instanceof HTMLElement) {
    customCommentContainer.innerHTML = '';
  } else {
    // on very first build
    customCommentContainer = document.getElementById('customCommentContainer');
    if (!customCommentContainer) {
      customCommentContainer = document.getElementsByClassName('profilContentInner')[0];
      customCommentContainer.id = 'customCommentContainer';
    }
  }
  insertPaginatedComments();
  customCommentContainer = document.getElementsByClassName('profilContentInner')[0];
  // if no comments to display, display message instead
  if (totalComments === 0) {
    const msg = `<div class="msgNoResults">${t('Noch keine Kommentare...')}</div>`.parseHTML();
    addToDOM(msg, customCommentContainer, InsertionService.AsLastChild, false);
  } else if (totalComments === filteredCommentsCount) {
    const msg = `<div class="msgNoResults">${t('Kein Kommentar entspricht den Filterkriterien')}</div>`.parseHTML();
    addToDOM(msg, customCommentContainer, InsertionService.AsLastChild, false);
  }
  // insert expand button if some replies were hidden by style rule
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
  // mount expand handler function
  const expanderElements = document.getElementsByClassName('expander');
  for (const expander of expanderElements) {
    expander.addEventListener('click', function() {
      if (!this) return;
      this.parentElement.parentElement.classList.remove('repliesCollapsed');
      // add fadeout effect to now visible replies, if necessary
      for (const reply of expander.nextElementSibling.children) {
        // skip already processed replies
        const replyTextElement = reply.getElementsByClassName('replyText')[0];
        if (!replyTextElement.classList.contains('hasOverflow') && replyTextElement.scrollHeight > maxCommentHeightBeforeCut) addFadeOutEffect(replyTextElement);
      }
      this.remove();
    })
  }
}




/**
 * Applies a defined order function on the comment data. The default order is 'activity' which orders the comments
 * by date in descending order (it also takes the reply dates into account)
 * 
 * @param {string} [orderType='activity']  - One of the predefined order keywords: activity, user, video, replyCount, relevance
 */
function doOrderCommentData(orderType = 'activity') {
  if (orderType === 'user') {
    // compares the comment authors (no replies) and orders from A to Z
    commentData.sort((a, b) => {
      const valA = a.user.toUpperCase();
      const valB = b.user.toUpperCase();
      if (valA === '') return 1; // set empty user names to the end
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  } else if (orderType === 'activity') {
    // this is the original order so we can simply compare the comment id's to restore that order
    commentData.sort((a, b) => {
      const valA = a.id;
      const valB = b.id;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  } else if (orderType === 'video') {
    // compares the video titles and orders from A to Z (case-insensitive)
    commentData.sort((a, b) => {
      const valA = a.video.title.toUpperCase();
      const valB = b.video.title.toUpperCase();
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  } else if (orderType === 'relevance') {
    // special order type only after a text search with OR logic was done - will compare the match values (orders from best matches to worst)
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



/**
 * Wrapper which will update all custom stuff
 */
function updatePage() {
  filteredCommentsCount = getFilteredCount();
  updateComments();
  updatePaginationUI();
  updateStaticTranslations();
}

 })();
  } else if (route === 'video') {
    (function() {
      // make sure, that it's really a video page (they all have a reload button in all possible states)
      if (!document.getElementsByClassName('reloadComment')[0]) {
        updateStaticTranslations();
        return;
      }
      // set up route-scoped fields and start the execution flow fo this route
const maxRetries = 5;
const delay = 250;
let retries = 0;
let storedIgnoreList;
let comments;
execute_genericPage()




/**
 * Main function of this route
 */
function execute_genericPage() {
  // add link overlays over suggested videos to enable "open in new tab" function
  let foundSuggestedVideos = false;
  for (const suggestion of document.getElementsByClassName('folgenItem')) {
    // generate full URI
    let uri = suggestion.getAttribute('onClick').replace("folgenItem('", '');
    uri = window.location.origin + '/' + uri.substr(0, uri.length-2);
    const overlay = `<a href="${uri}" class="overlayLink" style="position: absolute;left: 0;top: 0;height: 100%;width: 100%;"></a>`;
    suggestion.removeAttribute('onClick');
    suggestion.appendChild(overlay.parseHTML());
    foundSuggestedVideos = true;
  }
  // call the original function before leaving, maybe NuoFlix use it to collect video statistics with it or so
  if (foundSuggestedVideos) {
    window.addEventListener('beforeunload', function(ev) {
      // get the permalink from the event to pass it to folgenItem(permalink) if the overlay link was used
      const callee = ev.originalTarget.activeElement;
      if (callee.classList.contains('overlayLink')) {
        let permalink = ev.originalTarget.activeElement.getAttribute('href').replace(window.location.origin, '');
        permalink = permalink.substring(1, permalink.length);
        if (permalink) {
          window.onbeforeunload = null;  // prevent infinity loop
          folgenItem(permalink);
        }
      }
    });
  }

  // Try to find content of blocked users and hide them
  hideCommentsOfBlockedUsers(true);
  
  // add handler to the reload button, otherwise it would display hidden content again
  document.getElementsByClassName('reloadComment')[0].addEventListener('click', function(ev) {
    hideCommentsOfBlockedUsers(true);
  });
  
  // initialize i18n strings
  updateStaticTranslations()
}




/**
 * Loads the list of blocked users and hide all their comment texts and replies.
 * 
 * @param {boolean} [delayed=true]  - Wait some time before searching for the comments (required for the initial call)
 */
function hideCommentsOfBlockedUsers(delayed = false) {
  if (delayed) {
    const tryToApply = function() {
      setTimeout(function() {
        if (comments.childElementCount > 0) {
          for (const user of storedIgnoreList) hideCommentsOfUser(user);
        } else {
          // retry it up to 3 times after waiting one second after each try
          if (retries < maxRetries - 1) {
            retries++;
            tryToApply();
          }
        }
      }, delay);
    }

    if (document.getElementById('commentContent')) {
      storedIgnoreList = get_value('ignoredUsers');
      comments = document.getElementById('commentContent');
      tryToApply();
    }
  } else {
    if (document.getElementById('commentContent')) {
      storedIgnoreList = get_value('ignoredUsers');
      for (const user of storedIgnoreList) hideCommentsOfUser(user);
    }
  }
}


/**
 * Deletes all comments and replies of a given user
 * 
 * @param username
 */
const hideCommentsOfUser = function(username) {
  const allComments = document.querySelectorAll('.profilName');
  for (let i = allComments.length - 1; i >= 0; i--) {
    const comment = allComments[i];
    if (comment.firstElementChild && comment.firstElementChild.innerText === username) {
      if (comment.id.startsWith('comment_')) {
        // also remove spacer if its a reply
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
    })();
  }

  // mount handlers for setting the checked attribute of flip flop switches
  for (const flipflop of document.getElementsByClassName('flipflop')) {
    // execute before all other handlers
    let existingChangeHandlers = flipflop.onChange;
    flipflop.onChange = function() {
      // toggle checked attribute
      const input = this.getElementsByTagName('input')[0];
      input.hasAttribute('checked') ? input.removeAttribute('checked') : input.setAttribute('checked', 'checked');
      // execute all other handler
      existingChangeHandlers.apply(this, arguments);
    }
  }
})();
