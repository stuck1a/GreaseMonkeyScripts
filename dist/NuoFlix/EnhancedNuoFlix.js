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

// Map execution flows to pages
const pageRoutes = new Map([
  // path       route name
  [ '/',        'start'   ],
  [ '/profil',  'profile' ],
  [ '/.+',      'video'   ],
]);
  // Translations
const i18n = new Map([
  
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
'Enhanced NuoFlix',
],
[
'Kommentare filtern',
'Filter comments',
],
[
'Suche',
'Search',
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
'nach Benutzer',
'By user',
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
'Uluchshennyy NuoFlix',
],
[
'Kommentare filtern',
'Fil\'trovat\' kommentarii',
],
[
'Suche',
'Poisk teksta',
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
'nach Datum',
'po date',
],
[
'nach Benutzer',
'pol\'zovatelem',
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
 * @return {HTMLElement|HTMLElement[]}  - Reference (or list of references) of inserted element(s) or the input itself, if something went wrong.
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
 * @param {HTMLElement|string} elementOrId  - Target element or its id
 * @param {?string} registerId  - ID under which the element is added to the register.
 *                                If omitted or null, an unique ID will be created.
 *
 * @return {boolean}  - False, if the target is not found or tagged as custom element, true otherwise.
 */
function disablePrimalElement(elementOrId, registerId = null) {
  const apply = function(id, element) {
    if (element.hasAttribute('data-customElement')) return false;
    element.classList.add('hidden');    // TODO: Use display=getAttribute('data-originalDisplayValue') after full implementation
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
  
  return false;
}



/**
 * Restores hidden original page content and removes it from the register of disabled original element.
 *
 * @requires disabledPrimalElementsRegister
 * @requires Map.prototype.deleteByValue
 * 
 * @param {HTMLElement|string} elementOrId  - Target element, its element id or register id
 *
 * @return {boolean}  - Whether the operation succeeded or failed (will fail if the target is not found)
 */
function enablePrimalElement(elementOrId) {
  // if we got an element
  if (elementOrId instanceof HTMLElement) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    if (disabledPrimalElementsRegister) disabledPrimalElementsRegister.deleteByValue(elementOrId, 1);
    elementOrId.classList.remove('hidden');    // TODO: Use display=none after full implementation
    return true;
  }
  
  // if we got an register id
  if (disabledPrimalElementsRegister && disabledPrimalElementsRegister.has(elementOrId)) {
    const element =  disabledPrimalElementsRegister.get(elementOrId);
    disabledPrimalElementsRegister.delete(elementOrId);
    element.classList.remove('hidden');    // TODO: Use display=none after full implementation
    return true;
  }
  
  // if we got an element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    if (disabledPrimalElementsRegister) disabledPrimalElementsRegister.deleteByValue(elementOrId, 1);
    elementOrId.classList.remove('hidden');    // TODO: Use display=none after full implementation
    return true;
  }
  
  return false;
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

  document.body.appendChild(`<style>
.realisticSwitch {
  --width: 5rem;
}
.realisticSwitch span {
  --edge-radius: calc(.1*var(--width));
  position :relative;
  display: inline-block;
  width: var(--width);
  height: calc(1.5*var(--width));
  background-color: #bbb;
  -webkit-border-radius: var(--edge-radius);
  -moz-border-radius: var(--edge-radius);
  border-radius: var(--edge-radius);
  text-align: center;
}
.realisticSwitch input {
  width: 100%;
  height: 100%;
  margin: 0 0;
  padding: 0 0;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  cursor: pointer;
  opacity: 0;
  filter: alpha(opacity=0);
}
.realisticSwitch label {
  display: block;
  position: absolute;
  top: 1px;
  right: 1px;
  bottom: 1px;
  left: 1px;
  background-image: -webkit-linear-gradient(top, #fff 0%, #ddd 50%, #fff 50%, #eee 100%);
  background-image: -moz-linear-gradient(top, #fff 0%, #ddd 50%, #fff 50%, #eee 100%);
  background-image: -ms-linear-gradient(top, #fff 0%, #ddd 50%, #fff 50%, #eee 100%);
  background-image: -o-linear-gradient(top, #fff 0%, #ddd 50%, #fff 50%, #eee 100%);
  background-image: linear-gradient(top, #fff 0%, #ddd 50%, #fff 50%, #eee 100%);
  -webkit-box-shadow: 0 2px 3px rgba(0, 0, 0 , 0.4), inset 0 -1px 1px #888, inset 0 -5px 1px #bbb, inset 0 -6px 0 white;
  -moz-box-shadow:0 2px 3px rgba(0, 0, 0, 0.4), inset 0 -1px 1px #888, inset 0 -5px 1px #bbb, inset 0 -6px 0 white;
  box-shadow:0 2px 3px rgba(0, 0, 0, 0.4), inset 0 -1px 1px #888, inset 0 -5px 1px #bbb, inset 0 -6px 0 white;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
  font: normal 11px Arial, Sans-Serif;
  color: #666;
  text-shadow: 0 1px 0 white;
  cursor: pointer;
}
/* Oberes Zeichen (OFF) */
.realisticSwitch label:before {
  content: attr(data-off);
  position: absolute;
  top: 6px;    /* Ausrichtung (Abstand von oben, berechnet aus Höhe und Fontgröße) */
  right: 0;
  left: 0;
  z-index: 4;
}
/* Unteres Zeichen (ON) */
.realisticSwitch label:after {
  content: attr(data-on);
  position: absolute;
  right: 0;
  bottom: 11px; /* Ausrichtung (Abstand von unten, berechnet aus Höhe und Fontgröße) */
  left: 0;
  color: gray;  /* Basisfarbe (im ausgeschalteten Zustand) */
  text-shadow: 0 -1px 0 #eee; /* Fix, um den Kontrast zu erhöhen */
}
/* Oberer Schalter im ausgeschalteten Zustand */
.realisticSwitch input:checked + label {
  /* Abdunkeln der Fläche */
  background-image: -webkit-linear-gradient(top, #eee 0%, #ccc 50%, #fff 50%, #eee 100%);
  background-image: -moz-linear-gradient(top, #eee 0%, #ccc 50%, #fff 50%, #eee 100%);
  background-image: -ms-linear-gradient(top, #eee 0%, #ccc 50%, #fff 50%, #eee 100%);
  background-image: -o-linear-gradient(top, #eee 0%, #ccc 50%, #fff 50%, #eee 100%);
  background-image: linear-gradient(top, #eee 0%, #ccc 50%, #fff 50%, #eee 100%);
  /* Obere Kante durch Abdunkeln erzeugen (3D-Effekt) - Werte berechnet aus Größe/Höhe */
  -webkit-box-shadow: 0 0 1px rgba(0, 0, 0, 0.4), inset 0 1px 7px -1px #ccc, inset 0 5px 1px #fafafa, inset 0 6px 0 white;
  -moz-box-shadow: 0 0 1px rgba(0, 0, 0, 0.4), inset 0 1px 7px -1px #ccc, inset 0 5px 1px #fafafa, inset 0 6px 0 white;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.4), inset 0 1px 7px -1px #ccc, inset 0 5px 1px #fafafa, inset 0 6px 0 white;
}
/* Versetzen des oberen Symbols im eingeschalten Zustand (3D-Effekt) */
.realisticSwitch input:checked + label:before {
  z-index: 1;
  top: 11px;   /* Ausgangshöhe + y-Versatz von Oberkante */
}
/* Versetzen des oberen Symbols im eingeschalten Zustand (3D-Effekt) */
.realisticSwitch input:checked + label:after {
  z-index: 4;
  color: #aaa; /* Farbe auch etwas abdunkeln, verstärkt den Kippeffekt */
  text-shadow: none;
  bottom: 9px;   /* Ausgangshöhe + y-Versatz von Unterkante */
}</style>`.parseHTML());
  
  let totalComments;
  let paginationContainer, paginationContainerBottom, paginationControlContainer;
  let customCommentContainer, originalCommentContainer;

  let customElementsRegister = new Map();
  let disabledPrimalElementsRegister = new Map();
  
  let currentStart = defaultStart;
  let currentLength = defaultLength;
  let activeLanguage = defaultLanguage;
  let filteredCommentsCount = 0;
  
  let commentFilters = new Map([
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],
    [ 'filterSkipUser', { active: false, value: [] } ],
    [ 'filterTextSearch', { active: false, value: [] } ],
  ]);

  // hand over execution flow depending on the route (literally the current page)
  const route = getActiveRoute();
  if (route === 'index') {
    (function() { 
// set up route-scoped fields and start the execution flow fo this route
execute_startPage();
/**
 * Main function of this route
 */
function execute_startPage() {
  
} })();
  } else if (route === 'profile') {
    (function() { 
// set up route-scoped fields and start the execution flow fo this route
let commentData;
let storedCommentData;
let enhancedUiContainer = `<div id="enhancedUi" class="container-fluid">
    <div id="enhancedUiHeadlineHolder" class="rowHeadlineHolder">
      <div class="rowHeadlineBreakerLeft breakerHeight">&nbsp;</div>
      <div class="rowHeadlineHolderItem headerTxt">
        <h2 id="pluginHeadline">${t('NuoFlix 2.0')}</h2>
      </div>
      <div class="rowHeadlineBreakerRight breakerHeight">&nbsp;</div>
    </div>  
    <div class="row card-group">
    
      <fieldset class="card">
        <legend id="ignoredLabel">${t('Blockierte Benutzer')}:</legend>
        <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
        <div class="row">
          <div class="col-auto">
            <a id="addIgnoreUser" class="btn btn-small">${t('Hinzufügen...')}</a>
          </div>
          <div class="col-1" style="flex-grow: 1;"></div>
          <div class="col-auto">
            <a id="deleteIgnoreUser" class="btn btn-small">${t('Entfernen')}</a>
          </div>
        </div>
      </fieldset>
      
      <fieldset class="card col">
        <legend id="filterLabel">${t('Kommentare filtern')}</legend>
        <div class="row">
          <label id="searchInputLabel" class="col-auto" for="filterByText" style="margin-right: 2rem;">${t('Suche')}&colon;</label>
          <input id="filterByText" type="text" name="filterByText" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger" style="text-align: right;">${t('Erweiterte Filteroptionen')}</summary>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <div class="flipflop" style="--color-on: #e86344;">
                <span id="useAndLogicLabel">${t('Muss alle Wörter enthalten')}</span>
                <label><input id="filterNewOnly" type="checkbox" checked="checked" /><span></span></label>
              </div> 
            </li>
            <li class="row">
              <label id="searchByUserLabel" class="col-4" for="filterByUser">${t('nach Benutzer')}&colon;</label>
              <div class="col">
                <input id="filterByUser" type="text" name="filterByUser" />
              </div>
            </li>
            <li class="row">
              <label id="searchByDateLabel" class="row col-4" for="filterByDateFrom">${t('nach Datum')}&colon;</label>
              <div class="col" style="justify-content: space-between;display: flex;padding-inline-end: 0.4rem;">
                <input id="filterByDateFrom" name="filterByDateFrom" type="date" />
                <label style="padding-block: .75rem;" for="filterByDateTo">-</label>
                <input id="filterByDateTo" name="filterByDateTo" type="date" />
              </div>
            </li>
            <li>
              <a id="btnFilterNew" class="btn">${t('Nur neue Kommentare')}</a>
            </li>   
          </ul>
        </details>
      </fieldset>
      
    </div>
  </div>`.parseHTML();

execute_profilePage();



/**
 * Main function of this route
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
  let enhancedUiContainer = `<div id="enhancedUi" class="container-fluid">
    <div id="enhancedUiHeadlineHolder" class="rowHeadlineHolder">
      <div class="rowHeadlineBreakerLeft breakerHeight">&nbsp;</div>
      <div class="rowHeadlineHolderItem headerTxt">
        <h2 id="pluginHeadline">${t('NuoFlix 2.0')}</h2>
      </div>
      <div class="rowHeadlineBreakerRight breakerHeight">&nbsp;</div>
    </div>  
    <div class="row card-group">
    
      <fieldset class="card">
        <legend id="ignoredLabel">${t('Blockierte Benutzer')}:</legend>
        <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
        <div class="row">
          <div class="col-auto">
            <a id="addIgnoreUser" class="btn btn-small">${t('Hinzufügen...')}</a>
          </div>
          <div class="col-1" style="flex-grow: 1;"></div>
          <div class="col-auto">
            <a id="deleteIgnoreUser" class="btn btn-small">${t('Entfernen')}</a>
          </div>
        </div>
      </fieldset>
      
      <fieldset class="card col">
        <legend id="filterLabel">${t('Kommentare filtern')}</legend>
        <div class="row">
          <label id="searchInputLabel" class="col-auto" for="filterByText" style="margin-right: 2rem;">${t('Suche')}&colon;</label>
          <input id="filterByText" type="text" name="filterByText" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger" style="text-align: right;">${t('Erweiterte Filteroptionen')}</summary>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <div class="flipflop" style="--color-on: #e86344;">
                <span id="useAndLogicLabel">${t('Muss alle Wörter enthalten')}</span>
                <label><input id="filterNewOnly" type="checkbox" checked="checked" /><span></span></label>
              </div> 
            </li>
            <li class="row">
              <label id="searchByUserLabel" class="col-4" for="filterByUser">${t('nach Benutzer')}&colon;</label>
              <div class="col">
                <input id="filterByUser" type="text" name="filterByUser" />
              </div>
            </li>
            <li class="row">
              <label id="searchByDateLabel" class="row col-4" for="filterByDateFrom">${t('nach Datum')}&colon;</label>
              <div class="col" style="justify-content: space-between;display: flex;padding-inline-end: 0.4rem;">
                <input id="filterByDateFrom" name="filterByDateFrom" type="date" />
                <label style="padding-block: .75rem;" for="filterByDateTo">-</label>
                <input id="filterByDateTo" name="filterByDateTo" type="date" />
              </div>
            </li>
            <li>
              <a id="btnFilterNew" class="btn">${t('Nur neue Kommentare')}</a>
            </li>   
          </ul>
        </details>
      </fieldset>
      
    </div>
  </div>`.parseHTML();
  
  // insert all style sheets used in this route
  addToDOM(`<style>:root {
  --svg-checked: url('data:image/svg+xml;utf8,<svg height="1em" width="1em" fill="%2332CD32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>');
  --svg-unchecked: url('data:image/svg+xml;utf8,<svg height="1em" width="1em" fill="%23FF0000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>');
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
  max-width: 30rem;
  padding: .75rem;
  width: 30%;
}

.card-body { flex: 1 1 auto; padding: 1rem 1rem }
.card-group { margin-block: 1rem; }
.card-group > .card { margin-bottom: 1rem; }
.card-group > .card ~ .card {
  margin-left: 1rem;
}

#ignoredUsers {
  width: 100%;
}

#paginationContainer .btn.disabled {
  background-color: darkgray !important;
  color: lightgray !important;
  cursor: default !important;
}

#paginationContainer .btn:not(.disabled):hover {
  font-weight: bold;
  background-color: #bd8656;
}

#paginationContainer, #paginationContainerBottom {
  text-align: center;
  margin-block: .8rem;
}

.buttonGroup {
  display: inline-block;
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
  display: flow-root;
}

#commentsFromToContainer {
  float: left;
}

#commentsPerPageContainer {
  float: right;
  display: flex;
}

#commentsPerPageContainer small {
  align-self: center;
  white-space: pre;
  margin-inline-end: .75rem;
}

#commentsPerPageContainer .select {
  background-color: #eee;
  margin-block: auto;
  padding: .4rem;
  font-size: .75rem;
  text-align: center;
  text-align-last: center;
}

#btnFilterNew:after {
  content: "\\00a0\\00a0\\00a0" var(--svg-unchecked);
  vertical-align: -10%;
}

#btnFilterNew.filterIsActive:after {
  content: "\\00a0\\00a0\\00a0" var(--svg-checked);
}

.btn-small {
  font-size: .75rem;
  padding: .2rem .75rem;
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
  cursor: pointer;
  color: #d53d16;
}

.expander:hover {
  font-weight: bold;
}

#language_container {
  --borderColor: #555;
  --borderWidth: 1px;
  --totalWidth: 8rem;
  width: var(--totalWidth);
  height: 2rem;
  margin-left: auto;
  color: #d53d16;
  cursor: pointer;
  border: var(--borderWidth) solid var(--borderColor);
  border-top-left-radius: 1px;
  border-bottom: 0;
}

#language_container:hover > #language_dropdown_toggler > span:last-of-type  {
  transform: rotate(90deg);
}

#language_dropdown_toggler {
  position: absolute;
  height: inherit;
  width: inherit;
  background: linear-gradient(to left, var(--borderColor) var(--borderWidth), #d53d16 var(--borderWidth), #d53d16 1.75rem, #fcfcfc 1.75rem);
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: 1px;
  border-bottom: var(--borderWidth) solid var(--borderColor);
}

#language_dropdown_toggler:hover + #language_dropdown_menu,
#language_dropdown_menu:hover {
  display: block;
}

#language_dropdown_toggler > span {
  width: calc(100% - 1.75rem);
  display: flex;
  height: inherit;
  padding-left: .4rem;
  align-items: center;
}

#activeLanguage {
  border: var(--borderWidth) solid var(--borderColor);
  border-bottom-width: 0;
}

#language_dropdown_toggler > span:last-of-type {
  border-radius: 1px 1px 0 0;
  width: 1.5rem;
  text-align: center;
  color: #fcfcfc;
  transition: transform .15s ease-in-out;
  position: relative;
  padding-left: calc(2*var(--borderWidth));
  justify-content: center;
}

#language_dropdown_menu {
  position: relative;
  top: 100%;
  border-radius: 0 0 1px 1px;
  border: var(--borderWidth) solid var(--borderColor);
  left: calc(0px - var(--borderWidth));
  max-width: unset;
  width: calc(100% + 3*var(--borderWidth));
  display: none;
}

#language_dropdown_menu > div {
  background-color: #252525;
  font-weight: bold;
  padding-left: .4rem;
  padding-block: .2rem;
  display: flex;
  align-items: center;
  padding-top: .2rem;
  border-top: var(--borderWidth) solid var(--borderColor);
}

#language_dropdown_menu > div:hover {
  background-color: #f0cbc2;
}

#language_dropdown_menu svg {
  margin-right: .6rem;
  height: 1rem;
  width: 2rem;
}

#moreFilterTrigger:hover {
  font-weight: bold;
}

#moreFilterMenu {
  margin-inline-start: 1rem;
}

.card legend {
  padding-inline: .5rem;
  text-align: center;
}

#enhancedUi label {
  padding-block: .75rem;
}

input[type="date"] {
    display: inline-block;
    margin: 7px 0 15px 0;
    padding: 10px;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
}</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>
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
.flipflop > span {
  margin-right: var(--_label-offset);
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
  addToDOM(style_comments, document.body, InsertionService.AsLastChild, false);
  
  // insert the additional UI section
  enhancedUiContainer = addToDOM(enhancedUiContainer, document.getElementsByClassName('wrapper')[1], InsertionService.AsFirstChild, true, 'enhancedUiContainer');

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
    '<div class="profilContentInner"></div>'.parseHTML(),
    originalCommentContainer,
    InsertionService.Before,
    true, 
    'customCommentContainer'
  );

  // mount handlers for user block feature
  document.getElementById('addIgnoreUser').addEventListener('click', function() {
    const user = prompt(t('Folgenden Benutzer zur Ignorieren-Liste hinzufügen:')).trim();
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
    updatePage();
  });

  document.getElementById('deleteIgnoreUser').addEventListener('click', function() {
    const selectElement = document.getElementById('ignoredUsers');
    if (selectElement.selectedOptions.length > 0) {
      const user = selectElement.selectedOptions[0].innerText.trim();
      selectElement.selectedOptions[0].remove();
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
      updatePage();
    }
  });

  // insert the main switch to disable EnhancedNuoFlix
  const mainSwitchContainer = `
    <div class="realisticSwitch">
      <span><input id="mainSwitch" type="checkbox" checked="checked" />
        <label data-off="&#10006;" data-on="&#10004;"></label>
      </span>
    </div>
  `.parseHTML();
  
  addToDOM(mainSwitchContainer, enhancedUiContainer, InsertionService.Before);
  document.getElementById('mainSwitch').addEventListener('change', doChangeMainSwitch);

  // mount handler for the "new only" filter button
  // TODO: Use flip flop switch
  document.getElementById('btnFilterNew').addEventListener('click', function() {
    changeFilter('filterOnlyNew', !commentFilters.get('filterOnlyNew').value);
    if (commentFilters.get('filterOnlyNew').active) {
      // this will change the cross to a hook in the filter button
      this.classList.add('filterIsActive');
      // no need to highlight new comments if we filter all not new
      document.getElementById('style_newComment').innerText = '';
    } else {
      this.classList.remove('filterIsActive');
      document.getElementById('style_newComment').innerText = `.newComment { background-color: ${highlightedCommentsColor} }`;
    }
  });

  // mount handlers for flip flop switches
  for (const flipflop of document.getElementsByClassName('flipflop')) {
    flipflop.addEventListener('change', function() {
      const input = this.getElementsByTagName('input')[0];
      input.hasAttribute('checked') ? input.removeAttribute('checked') : input.setAttribute('checked', 'checked');
    });
  }
  
  // initially generate and insert all dynamic components
  updatePage();
  insertLanguageDropdown();  // TODO: Can we move this into updatePage, too ?

  // mount handler for selecting another length value
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
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
 * Uses the data of a single comment including all
 * its replies to generate an HTML comment with
 * the original structure which can be appended
 * to the page's comment blocks section.
 *
 * @param  {object} commentData  - Comment data
 * @param  {int}  [counter=1]  - Current number of generated comment
 *
 * @return {void|DocumentFragment}  - Prepared comment block
 */
function buildCommentBlock(commentData, counter = 1) {
  if (!commentData) return;

  // generate replies
  let cnt = 0;
  let repliesBlock = '';
  const ignoreFilter = commentFilters.get('filterSkipUser');
  outer: for (const replyData of commentData.replies) {
    // skip if reply is from an ignored user
    // TODO: Really skip instead of just hiding them? Hide would allow to outsource this logic to applyFilter
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
          <pre>${replyData.text}</pre>
        </div>
      </div>
    `;
  }

  // generate comment including the pre-generated replies
  const commentBlock = `
    <div data-comment-id="${counter}" class="commentItem repliesCollapsed${commentData.isNew ? ' ' + cssClassNewComments : ''}${commentData.hasNewReplies ? ' ' + cssClassHasNewReplies : ''}">
      <div><a href="${commentData.video.url}">${commentData.video.title}</a></div>
      <div class="spacer15"></div>
      <div class="profilPic"><img src="${commentData.pic}" alt=""></div>
      <div class="profilName">
        <strong>${commentData.user}</strong>&nbsp;<small>am ${commentData.date}</small>
        <pre>${commentData.text}</pre>
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
  return true;
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
    commentItemElement = buildCommentBlock(filteredComments[currentStart + insertedComments - 1], insertedComments);
    if (commentItemElement) {
      addToDOM(commentItemElement, customCommentContainer, InsertionService.AsLastChild, false);
      insertedComments++;
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


  /* show only, if one of the comment/replies authors is listed in the username filter list */
  if (commentFilters.get('filterOnlyUser').active) {
    let match = false;
    for (const author of commentFilters.get('filterOnlyUser').value) {
      // get a list of all related users (comment author and all replies authors)
      const usersFromReplies = commentData.replies.map(function (item) { return item.user || ''; });
      const relatedUsers = mergeArraysDistinct([author], usersFromReplies);
      // check if the current user from filter list is in the author list
      if (relatedUsers.indexOf(commentData.user) > -1) {
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


  /* show only, if ALL search words are found somewhere in the related properties of the comment */
  if (commentFilters.get('filterTextSearch').active) {
    // collect all string to search in
    let relatedContent = [
      commentData.text,
      commentData.user,
      commentData.date,
      commentData.video.title,
    ];
    commentData.replies.forEach( reply => {
      relatedContent.push(reply.date);
      relatedContent.push(reply.text);
      relatedContent.push(reply.user);
    });
    // check whether all words are at least once somewhere in the related data
    let wordsFound = 0;
    outer: for (const searchTag of commentFilters.get('filterTextSearch').value) {
      for (const content of relatedContent) {
        if (content.contains(searchTag)) {
          wordsFound++;
          continue outer;
        }
      }
    }
    // do we have a match for each given word?
    if (wordsFound < commentFilters.get('filterTextSearch').value.length) return false;
  }

  return true;
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




function buildPaginationControl() {
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
    <div id="paginationControl">
      <div id="commentsFromToContainer">
        <small>${t('Kommentare {0} .. {1} von {2}', from, to, _totalComments)}${filtered}</small>
      </div>
      <div id="commentsPerPageContainer">
        <small>${t('Kommentare pro Seite:')}</small>
        <select id="pageLengthSelect" class="select">
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
    <div id="language_container" class="row">
      <div id="language_dropdown_toggler">
        <span id="activeLanguage">${i18n.get(activeLanguage).get('__metadata__').displayName}</span>
        <span>&gt;</span>
      </div>
      <div id="language_dropdown_menu"></div>
    </div>
  `.parseHTML();

  // insert as first element after the section headline
  const headlineHolder = document.getElementById('enhancedUiHeadlineHolder');

  // Some weird side effect causes that we have the Fragment again here so lets simply get the element from the register again
  enhancedUiContainer = customElementsRegister.get('enhancedUiContainer');
  const languageContainer = addToDOM(languageContainerHtml, headlineHolder, InsertionService.After, true, 'language_container');

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
 * TODO: Build a facade for inserting elements to the dom, then we can auto-generate
 *       those lists and generalize this function. We will need it at every route if
 *       the switch were moved to the header
 *
 * Click event handler for the global switch which
 * turns all of this UserScripts features on/off.
 *
 * @param {Event} ev
 */
function doChangeMainSwitch(ev) {
  const addedCustomElements = [
    enhancedUiContainer,
    paginationContainer,
    paginationContainerBottom,
    paginationControlContainer,
    customCommentContainer,
  ];
  const disabledOriginalElements = [
    originalCommentContainer,
  ];
  for (const element of addedCustomElements) {
    this.checked ? element.classList.remove('hidden') : element.classList.add('hidden');
  }
  for (const element of disabledOriginalElements) {
    this.checked ? element.classList.add('hidden') : element.classList.remove('hidden');
  }
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
  paginationControlContainer.scrollIntoView();
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
  paginationContainer = buildPaginationUi().parseHTML();
  const commentHeadlineElement = document.getElementsByClassName('rowHeadlineHolder')[1];


  // XXX
  //paginationContainer = addToDOM(paginationContainer, commentHeadlineElement, InsertionService.Before, false);
  
  
  commentHeadlineElement.parentElement.insertBefore(paginationContainer, commentHeadlineElement.nextElementSibling);
  paginationContainer = document.getElementById('paginationContainer');


  const paginationButtons = paginationContainer.getElementsByClassName('btn');
  for (const paginationBtn of paginationButtons) {
    paginationBtn.addEventListener('click', function (e) {
      doClickedPagination(e, this);
    });
  }
  // insert a second pagination after the comments
  paginationContainerBottom = paginationContainer.cloneNode(true);
  paginationContainerBottom.id = paginationContainerBottom.id + 'Bottom';
  originalCommentContainer.parentElement.insertBefore(paginationContainerBottom, originalCommentContainer);
  paginationContainerBottom = document.getElementById(paginationContainerBottom.id);
  // handlers won't get cloned
  const paginationButtonsBottom = paginationContainerBottom.getElementsByClassName('btn');
  for (const paginationBtn of paginationButtonsBottom) {
    paginationBtn.addEventListener('click', function (e) {
      doClickedPagination(e, this);
    });
  }
  // insert pagination control (displays from..to, length selection and such)
  paginationContainer.parentElement.insertBefore(buildPaginationControl().parseHTML(), paginationContainer);
  paginationControlContainer = document.getElementById('paginationControl');
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
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
    let replies = repliesWrapper;
    if (replies) replies = replies.children;
    if (replies.length > expandedReplyCount) {
      const hiddenCount = replies.length - expandedReplyCount;
      const expander = `<div class="expander">${t('Zeige {0} ältere Antworten', hiddenCount)}</div>`.parseHTML();
      repliesWrapper.insertBefore(expander, repliesWrapper.firstElementChild);
    }
  }
  // mount expand handler function
  const expanderElements = document.getElementsByClassName('expander');
  for (const expander of expanderElements) {
    expander.addEventListener('click', function() {
      if (!this) return;
      this.parentElement.parentElement.parentElement.classList.remove('repliesCollapsed');
      this.remove();
    })
  }
}



/**
 * This function is responsible for update all strings of elements,
 * which aren't rebuild when updatePage() is called which applies to
 * the most elements of the base menu, because those elements are
 * required for the update process itself. All those elements which
 * need such a manual update must be registered in the register
 * inside this function.
 */
function updateStaticTranslations() {
  const staticElementsToUpdate = [
    { elementId: 'ignoredLabel', text: 'Blockierte Benutzer', args: [] },
    { elementId: 'addIgnoreUser', text: 'Hinzufügen...', args: [] },
    { elementId: 'deleteIgnoreUser', text: 'Entfernen', args: [] },
    { elementId: 'btnFilterNew', text: 'Nur neue Kommentare', args: [] },
    { elementId: 'pluginHeadline', text: 'NuoFlix 2.0', args: [] },
    { elementId: 'filterLabel', text: 'Kommentare filtern', args: [] },
    { elementId: 'searchInputLabel', text: 'Suche', args: [] },
    { elementId: 'moreFilterTrigger', text: 'Erweiterte Filteroptionen', args: [] },
    { elementId: 'useAndLogicLabel', text: 'Muss alle Wörter enthalten', args: [] },
    { elementId: 'searchByUserLabel', text: 'nach Benutzer', args: [] },
    { elementId: 'searchByDateLabel', text: 'nach Datum', args: [] },
  ];
  for (const element of staticElementsToUpdate) {
    const target = document.getElementById(element.elementId);
    if (target) target.innerText = t(element.text, element.args);
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
// set up route-scoped fields and start the execution flow fo this route

execute_genericPage()


// TODO: Innere Funktionen rausholen, jetzt wo alles schön scoped ist :-)



/**
 * Main function of this route
 */
function execute_genericPage() {
  if (document.getElementById('commentContent')) {
    // function to delete comments and replies of a given user
    const removeCommentsFrom = function(username) {
      const allComments = document.querySelectorAll('.profilName');
      for (let i = allComments.length - 1; i >= 0; i--) {
        const comment = allComments[i];
        if (comment.firstElementChild && comment.firstElementChild.innerText === username) {
          if (comment.id.startsWith('comment_')) {
            // also remove spacer if its a reply
            if (comment.previousElementSibling) comment.previousElementSibling.remove();
          }
          if (comment.parentElement.classList.contains('commentItem')) {
            comment.parentElement.remove();
          } else {
            comment.remove();
          }
        }
      }
    }
    // we need some delay for the comments to load
    function tryToApply() {
      setTimeout(function() {
        if (comments.childElementCount > 0) {
          for (const user of storedIgnoreList) removeCommentsFrom(user);
        } else {
          // retry it up to 3 times after waiting one second after each try
          if (retries < 2) {
            retries++;
            tryToApply();
          }
        }
      }, 1000);
    }
    // load list of ignored users and try to apply them
    const storedIgnoreList = get_value('ignoredUsers');
    const comments = document.getElementById('commentContent');
    let retries = 0;
    tryToApply();
  }
} })();
  }
})();
