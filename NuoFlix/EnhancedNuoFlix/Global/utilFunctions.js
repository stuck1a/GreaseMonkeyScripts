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
      log(msg, 'warn', [t('Occurred in {0}', 'set_value()'), this]);
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
