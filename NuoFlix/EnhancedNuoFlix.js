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

// Unique key uses in the GM data storage to avoid naming conflicts across scripts
const CACHE_KEY = 's1a/enhancednuoflix';
const MSG_PREFIX = 'Enhanced NuoFlix';

// Fixed configs
const highlightedCommentsColor = '#4A4A20';
const highlightedRepliesColor = '#373434';
const cssClassNewComments = 'newComment';
const cssClassHasNewReplies = 'hasNewReply';
const cssClassNewReplies = 'newReply';
const expandedReplyCount = 3;

// Defaults
const defaultStart = 1;
const defaultLength = 5;
const defaultLanguage = 'de';

// Translations
const i18n = new Map([
  [
    // Englisch
    'en', new Map([
      [ 'Nur neue Kommentare', 'New comments only' ],
      [ 'Kommentare pro Seite:', 'Comments per Page:' ],
      [ 'alle', 'all' ],
      [ 'Kommentare {0} .. {1} von {2}', 'Comments {0} .. {1} of {2}' ],
      [ 'Antwort abschicken', 'Send reply' ],
      [ 'Deine Antwort zu diesem Kommentar', 'Your reply to this comment' ],
      [ 'antworten', 'answer' ],
      [ '({1} gefiltert)', '({1} filtered)' ],
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
    ])
  ],
  [
    // Russian
    'ru', new Map([
      [ 'Nur neue Kommentare', 'Tol\'ko novyye kommentarii' ],
      [ 'Kommentare pro Seite:', 'Kommentarii na stranitse:' ],
      [ 'alle', 'vse' ],
      [ 'Kommentare {0} .. {1} von {2}', 'Kommentarii {0} .. {1} ot {2}' ],
      [ 'Antwort abschicken', 'Otpravit\' otvet' ],
      [ 'Deine Antwort zu diesem Kommentar', 'Vash otvet na etot kommentariy' ],
      [ 'antworten', 'otvechat\'' ],
      [ '({1} gefiltert)', '({1} Otfil\'trovano)' ],
      [ 'GreaseMonkey-Funktion {0}() nicht gefunden! Füge "@grant {0}" in den Skript-Header ein, um den Fehler zu beheben.', 'Funktsiya GreaseMonkey {0}() ne naydena! Dobav\'te «@grant {0}» v zagolovok skripta, chtoby ispravit\' oshibku.' ],
      [ 'DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.', 'Element DOM ne nayden. Ne voshel? Yesli da, to DOM izmenilsya.'],
      [ 'Warnung!\nEs wurde versucht, ein nicht serialisierbares Objekt zu speichern!\nDas Skript wird versuchen, es als einfaches Objekt zu speichern, aber die Daten könnten beschädigt werden!', 'Preduprezhdeniye!\nPytalsya sokhranit\' neserializuyemyy ob"yekt!\nSkript popytayetsya sokhranit\' yego kak prostoy ob"yekt, no dannyye mogut byt\' ' ],
      [ 'Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', 'Ne udalos\' sobrat\' dannyye "{0}". Vozmozhno, izmenilsya DOM?' ],
      [ 'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden', 'Pokhozhe, chto khranyatsya ustarevshiye/nedeystvitel\'nyye/povrezhdennyye dannyye kommentariyev.\nObychno eto dolzhno byt\' ispravleno pri sleduyushchem obnovlenii stranitsy.' ],
      [ 'Folgenden Benutzer zur Ignorieren-Liste hinzufügen:', 'Dobav\'te v spisok ignorirovaniya sleduyushchego pol\'zovatelya:' ],
      [ 'Noch keine Kommentare...', 'Kommentariyev poka net...' ],
      [ 'Zeige {0} ältere Antworten', 'Показаны {0} старых ответов' ],
      [ 'Kein Kommentar entspricht den Filterkriterien', 'Net kommentariyev, sootvetstvuyushchikh kriteriyam fil\'tra.' ],
      [ 'Hinzufügen...', 'Dobavlyat\'...' ],
      [ 'Entfernen', 'Udalyat\'' ],
    ])
  ],
]);
  

  
// ###########################################################
// ###                      UTILITIES                      ###
// ###########################################################

String.sprintf = function(format) {
  const args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] !== typeof undefined ? args[number].toString() : match;
  });
};



/**
 * @return {DocumentFragment}
 */
String.prototype.parseHTML = function () {
  let t = document.createElement('template');
  t.innerHTML = this;
  return t.content;
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
 * @return {boolean}  - Value stored under given key
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
      const msg = t('Warning!\nTried to store non-serializable object!\nThe script will try to store it as plain object, but the data might get corrupted!');
      log(msg, 'warn', ['Occurred in set_value()', this]);
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



// ###########################################################
// ###                 SCRIPT FUNCTIONS                    ###
// ###########################################################

/**
 * Adds this scripts central control panel to the DOM.
 *
 * @param {any} menu
 */
function addCommentMenuToPage(menu) {
  let targetParent = document.getElementsByClassName('profilContent');
  if (targetParent && targetParent[0] && targetParent[0].firstElementChild) {
    targetParent = targetParent[0].firstElementChild;
  } else {
    log(t('Target DOM element not found. Are you logged in? If yes, maybe the DOM has changed.'), 'error', this);
    return;
  }
  targetParent.insertBefore(menu, targetParent.firstChild);
}



/**
 * Appends the given comment block to the pages comment section.
 *
 * @param {DocumentFragment|HTMLElement|HTMLCollection} obj  - Comment object
 * @param {HTMLElement} [parent=null]  - Container to insert to
 * @param {string[]} [addClasses=[]]  - Additional CSS classes to add
 */
function addCommentToPage(obj, parent = null, addClasses = []) {
  // Find the correct container if none was submitted
  if (!parent) parent = document.getElementsByClassName('profilContentInner')[0];
  if (!obj) return;
  parent.appendChild(obj);
  // get live node
  obj = parent.lastElementChild;
  // add all given css classes
  for (const className of addClasses) obj.classList.add(className);
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
    // id
    commentItemData.id = ++counter;
    // section "form"
    commentItemData.form = {};
    tmp = commentRaw.getElementsByClassName('sendReplyProfil')[0];
    if (tmp) {
      commentItemData.form.txt_id = tmp.getAttribute('data-reply').toString();
      commentItemData.form.btn_id = tmp.getAttribute('data-id').toString();
      tmp = null;
    } else {
      log(t('Failed to gather "{0}" data - maybe the DOM has changed?', 'form'), 'error', this);
      return [];
    }
    // section "video"
    commentItemData.video = {};
    tmp = commentRaw.children[0].children[0];
    if (tmp) {
      commentItemData.video.url = tmp.getAttribute('href');
      commentItemData.video.title = tmp.innerText;
      tmp = null;
    } else {
      log(t('Failed to gather "{0}" data - maybe the DOM has changed?', 'video'), 'error', this);
      return [];
    }
    // isNew
    commentItemData.isNew = isNewComment(commentItemData.form.btn_id, commentItemData.form.txt_id);
    // pic
    commentItemData.pic = commentRaw.children[2].children[0].getAttribute('src');
    // user
    commentItemData.user = commentRaw.children[3].children[0].innerText;
    // date
    commentItemData.date = commentRaw.children[3].children[1].innerText.substring(3);
    // text
    commentItemData.text = commentRaw.children[3].children[2].innerText;
    // section "replies"
    let storedReplyCount = getReplyCount(commentItemData.form.btn_id, commentItemData.form.txt_id);
    let replyCounter = 0;
    commentItemData.replies = [];
    tmp = commentRaw.children[3].children[3];
    let repliesTotal = tmp.getElementsByClassName('spacer25').length;
    for (let i = 1; i < repliesTotal * 3; i = i + 3) {
      let replyData = {};
      // reply id
      replyData.id = ++replyCounter;
      // reply pic
      replyData.pic = tmp.children[i].children[0].getAttribute('src');
      // reply user
      replyData.user = tmp.children[i + 1].children[0].innerText;
      // reply date
      replyData.date = tmp.children[i + 1].children[1].innerText.substring(3);
      // reply text
      replyData.text = tmp.children[i + 1].children[2].innerText;
      // reply isNew
      replyData.isNew = replyCounter > storedReplyCount;
      // add reply to the comment object
      commentItemData.replies.push(replyData);
    }
    // reply_cnt
    commentItemData.reply_cnt = replyCounter;
    // hasNewReplies
    commentItemData.hasNewReplies = replyCounter > storedReplyCount;
    // add to collection
    commentDataCollection.push(commentItemData);
  }
  return commentDataCollection;
}



/**
 * Uses the data of a single comment including all
 * its replies to generate a HTML comment with
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
  // Generate replies
  let cnt = 0;
  let repliesBlock = '';
  const ignoreFilter = commentFilters.get('filterSkipUser');
  outer: for (const replyData of commentData.replies) {
      // skip if reply is from ignored user
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
  // Generate full comment
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
                      <div data-id="${commentData.form.btn_id}" data-reply="${commentData.form.txt_id}" class="btn sendReplyProfil">${'Antwort abschicken'}</div>
                  </div>
              </div>
          </div>
      </div>
  `;
  return commentBlock.parseHTML();
}



/**
 * Search in the stored comment data for the comment matching
 * both given id's checks, whether its a new comment or not.
 *
 * <strong>Note: For now, we compare both ids, since its not known what
 * they exactly mean and if both are unique by themself or not.</strong>
 *
 * @param {string|int} btn_id  - The first server-side comment id
 * @param {string|int} txt_id  - The second serve-side comment id
 * 
 * @return {boolean}  - Value of stored comments "isNew" property 
 */
function isNewComment(btn_id, txt_id) {
  storedData = storedData || get_value('commentData');
  let msgPrinted = false;
  for (const storedComment of storedData) {
    if (typeof storedComment.form === typeof undefined) {
      if (!msgPrinted) {
        const msg = 'It seems like there is deprecated/invalid/corrupted comment data stored.\nUsually this should be fixed with the next page refresh.';
        log(msg, 'warn', ['Occurred in isNewComment()', 'storedComment = \n' + storedComment]);
        msgPrinted = true;
      }
      return false;
    }
    if (storedComment.form.btn_id === btn_id && storedComment.form.txt_id === txt_id) {
      return false;
    }
  }
  return true;
}



/**
 * Search in the stored comment data for the comment matching
 * both given id's and count its replies, if found.
 * 
 * <strong>Note: For now, we compare both ids, since its not known what
 * they exactly mean and if both are unique by themself or not.</strong>
 * 
 * @param {string|int} btn_id  - The first server-side comment id
 * @param {string|int} txt_id  - The second serve-side comment id
 * @return {boolean|int}  - Reply count or 0 if comment not found
 */
function getReplyCount(btn_id, txt_id) {
  storedData = storedData || get_value('commentData');
  let msgPrinted = false;
  for (const storedComment of storedData) {
    if (typeof storedComment.form === typeof undefined) {
      if (!msgPrinted) {
        const msg = 'Gespeicherte Kommentardaten sind veraltet, ungültig oder beschädigt.\nNormalerweise sollte das mit der nächsten Seitenaktualisierung behoben werden';
        log(msg, 'warn', ['Occurred in getReplyCount()', 'storedComment = \n' + storedComment]);
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
    // stop if we have filtered as much comments as we even have in total
    if (counter > totalComments || counter / currentPage > filteredComments.length) break;
    // add comment to page
    commentItemElement = buildCommentBlock(filteredComments[currentStart + insertedComments - 1], insertedComments);
    addCommentToPage(commentItemElement, customCommentContainer, []);
    insertedComments++;
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
      // check if the the current user from filter list is in the author list
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
    if (wordsFound < commentFilters.get('filterTextSearch').value.length) {
      return false;
    }
  }
  
  return true;
}



function buildPaginationUi() {
  // localize globals to adjust values for filter
  let _totalComments = totalComments - filteredCommentsCount;
  //let _currentStart = currentStart;
  
  
  
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
 * @param {int|string} buttonStart  - Id of the first comment to display if this button is clicked
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
              <small>
                ${t('Kommentare {0} .. {1} von {2}', from, to, _totalComments)}${filtered}</small>
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



/**
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
 * Event handler for all buttons of the pagination
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
 * Sub function used by all filter event handler.
 * Transfers the new filter values in to the global variables triggers a page update.
 * The values of each specific filter are transformed as needed through the related handler
 * before passed to this function.
 * 
 * Currently supported value types: boolean, string, Array
 * 
 * @param {string} filterName
 * @param {any} newValue
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
 * Checks, whether we are currently on the page "My Profile" or not.
 *
 * @return {boolean}
 */
function onProfilePage() {
  return window.location.toString().startsWith('nuoflix.de/profil/')
      || window.location.toString().startsWith('http://nuoflix.de/profil/')
      || window.location.toString().startsWith('https://nuoflix.de/profil/')
}



/**
 * Deletes the pagination UI from DOM, if exists and rebuild + insert it
 * again based on the values from the global variables currentStart and currentLength.
 */
function updatePaginationUI() {
  if (typeof paginationContainer !== typeof undefined && paginationContainer instanceof HTMLElement) paginationContainer.remove();
  if (typeof paginationContainerBottom !== typeof undefined && paginationContainerBottom instanceof HTMLElement) paginationContainerBottom.remove();
  if (typeof paginationControlContainer !== typeof undefined && paginationControlContainer instanceof HTMLElement) paginationControlContainer.remove();
  paginationContainer = buildPaginationUi().parseHTML();
  const commentHeadlineElement = document.getElementsByClassName('rowHeadlineHolder')[0];
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
    customCommentContainer.appendChild(msg);
  } else if (totalComments === filteredCommentsCount) {
    const msg = `<div class="msgNoResults">${t('Kein Kommentar entspricht den Filterkriterien')}</div>`.parseHTML();
    customCommentContainer.appendChild(msg);
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
 * Wrapper which will update all custom stuff
 */
function updatePage() {
  filteredCommentsCount = getFilteredCount();
  updateComments();
  updatePaginationUI();
}


/**
 * Marks some comments as new and inserts some fake replies here and there
 */
function DEBUG_setSomeFakeData() {
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
}


// ###########################################################
// ###                  EXECUTION FLOW                     ###
// ###########################################################

// initialize variables
let currentStart = defaultStart;
let currentLength = defaultLength;
let activeLanguage = defaultLanguage;
let filteredCommentsCount = 0;
let commentData, storedData, totalComments;
let enhancedUiContainer, commentFilters,
    paginationContainer, paginationContainerBottom, paginationControlContainer,
    customCommentContainer, originalCommentContainer;


// Execution path for profile page
if (onProfilePage()) {
  commentFilters = new Map([
    // currently supported types for property "value" are: boolean, string, array
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],    // OR logic
    [ 'filterSkipUser', { active: false, value: [] } ],    // OR logic
    [ 'filterTextSearch', { active: false, value: [] } ],  // AND logic (search input is split into single words)
  ]);
  
  const globalStyles = `
      <style>
          :root {
            --svg-checked: url('data:image/svg+xml;utf8,<svg height="1em" width="1em" fill="%2332CD32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>');
            --svg-unchecked: url('data:image/svg+xml;utf8,<svg height="1em" width="1em" fill="%23FF0000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>');
          }
          .hidden {
            display: none !important;
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
            margin-block: 0.8rem;
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
            padding-inline: max(1.0vw, 10px);
            margin-inline: 0.25rem !important;
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
            margin-inline-end: 0.75rem;
          }
          #commentsPerPageContainer .select {
            background-color: #eee;
            margin-block: auto;
            padding: 0.4rem;
            font-size: 0.75rem;
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
            font-size: 0.75rem;
            padding: 0.2rem 0.75rem;
          }
          .ui-card {
            padding: 0.75rem;
            margin-block: 1rem;
            border: 1px solid #949296;
            min-width: 12rem;
            max-width: 30rem;
            border-radius: 3px;
          }
          .msgNoResults {
            margin-block: 2rem;
            text-align: center;
            font-style: italic;
          }     
          .repliesCollapsed .replyContainer:nth-last-child(n+${expandedReplyCount + 1}) {
            display: none;
          }
          .expander {
            cursor: pointer;
            color: #d53d16;
          }
          .expander:hover {
            font-weight: bold;
          }
      </style>
      <style id="style_newComment">
          .newComment {
            background-color: ${highlightedCommentsColor};
          }
      </style>
      <style id="style_newReply">
          .newReply {
            background-color: ${highlightedRepliesColor};
          }
      </style>
  `;
  
  const mainSwitchHtml = `
      <div id="mainSwitchContainer">
          <div>
              <input id="mainSwitch" type="checkbox" name="mainSwitch" checked="checked">
              <label for="mainSwitch" class="mainSwitch"></label>
          </div>
          <style>
              #mainSwitchContainer {
                height: 89px;
                width: 158px;
              }
              #mainSwitchContainer > div {
                width: 151px;
                height: 60px;
                position: relative;
                inset-block-start: 31px;
                left: 3px;
              }
              #mainSwitchContainer *, #mainSwitchContainer *:after, #mainSwitchContainer *:before {
                box-sizing: border-box;
              }
              #mainSwitch {
                visibility: hidden;
                clip: rect(0 0 0 0);
                position: absolute;
                left: 9999px;
              }
              .mainSwitch {
                display: block;
                width: 65px;
                height: 30px;
                margin: 28px 43px;
                position: relative;
                background: #ced8da;
                background: -moz-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
                background: -webkit-gradient(linear, left top, right top, color-stop(0%, #ced8da), color-stop(29%, #d8e0e3), color-stop(34%, #ccd4d7), color-stop(62%, #d4dcdf), color-stop(68%, #fff9f4), color-stop(74%, #e1e9ec), color-stop(100%, #b7bfc2));
                background: -webkit-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
                background: -o-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
                background: -ms-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
                background: linear-gradient(to right, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
                filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ced8da', endColorstr='#b7bfc2',GradientType=1 );
                transition: all 0.2s ease-out;
                cursor: pointer;
                border-radius: 0.35em;
                box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 1px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.15);
              }
              .mainSwitch:before {
                display: block;
                position: absolute;
                left: -35px;
                right: -35px;
                top: -25px;
                bottom: -25px;
                z-index: -2;
                content: "";
                border-radius: 0.4em;
                background: #d5dde0;
                background: linear-gradient(#d7dfe2, #bcc7cd);
                box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 1px rgba(0, 0, 0, 0.3), 0 0 8px 2px rgba(0, 0, 0, 0.2), 0 2px 4px 2px rgba(0, 0, 0, 0.1);
                pointer-events: none;
                transition: all 0.2s ease-out;
              }
              .mainSwitch:after {
                content: "";
                position: absolute;
                right: -25px;
                top: 50%;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #788b91;
                margin-top: -8px;
                z-index: -1;
                box-shadow: inset 0 -1px 8px rgba(0, 0, 0, 0.7), inset 0 -2px 2px rgba(0, 0, 0, 0.2), 0 1px 0 white, 0 -1px 0 rgba(0, 0, 0, 0.5), -47px 32px 15px 13px rgba(0, 0, 0, 0.25);
              }
              #mainSwitch:checked ~ .mainSwitch {
                background: #b7bfc2;
                background: -moz-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
                background: -webkit-gradient(linear, left top, right top, color-stop(0%, #b7bfc2), color-stop(26%, #e1e9ec), color-stop(32%, #fff9f4), color-stop(38%, #d4dcdf), color-stop(66%, #ccd4d7), color-stop(71%, #d8e0e3), color-stop(100%, #ced8da));
                background: -webkit-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
                background: -o-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
                background: -ms-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
                background: linear-gradient(to right, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
                filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7bfc2', endColorstr='#ced8da',GradientType=1 );
              }
              #mainSwitch:checked ~ .mainSwitch:after {
                background: #b1ffff;
                box-shadow: inset 0 -1px 8px rgba(0, 0, 0, 0.7), inset 0 -2px 2px rgba(0, 0, 0, 0.2), 0 1px 0 white, 0 -1px 0 rgba(0, 0, 0, 0.5), -65px 25px 15px 13px rgba(0, 0, 0, 0.25);
              }
          </style>
      </div>
  `;
  
  const menuBaseHtml = `
      <div id="enhancedUi">
          <div class="ui-card" style="width: 30%;">
              <div>Ignorierte User:</div>
              <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
              <div>
                  <a id="addIgnoreUser" class="btn btn-small">${t('Hinzufügen...')}</a>
                  <a id="deleteIgnoreUser" class="btn btn-small" style="float: right;">${t('Entfernen')}</a>
              </div>
          </div>
          <a id="btnFilterNew" class="btn">${t('Nur neue Kommentare')}</a>
      </div>
  `;
  
  document.body.appendChild(globalStyles.parseHTML());
  
  // add the new UI and store its reference
  addCommentMenuToPage(menuBaseHtml.parseHTML());
  enhancedUiContainer = document.getElementById('enhancedUi');
  
  // hide the original comment container
  originalCommentContainer = document.getElementsByClassName('profilContentInner')[0];
  // if not found probably not logged in (anymore), so lets stop here
  if (!originalCommentContainer) log(t('DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.'), 'fatal');
  
  originalCommentContainer.id = 'originalCommentContainer';
  originalCommentContainer.classList.add('hidden');
  
  // get stored comment data (to identify new comments) and update storage with the new comment data
  storedData = get_value('commentData');
  commentData = generateCommentObject();
  totalComments = commentData.length;
  DEBUG_setSomeFakeData();
  set_value('commentData', commentData);
  
  // add custom comment container
  customCommentContainer = '<div class="profilContentInner"></div>'.parseHTML();
  originalCommentContainer.parentElement.insertBefore(customCommentContainer, originalCommentContainer);
  
  // restore list of ignored users
  const storedIgnoreList = get_value('ignoredUsers');
  for (const user of storedIgnoreList) {
    document.getElementById('ignoredUsers').appendChild(`<option>${user}</option>`.parseHTML());
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
  }
  
  // mount handlers for ignore user feature
  document.getElementById('addIgnoreUser').addEventListener('click', function() {
    const user = prompt(t('Folgenden Benutzer zur Ignorieren-Liste hinzufügen:')).trim();
    if (user === null || user === '') return;
    const selectElement = document.getElementById('ignoredUsers');
    for (const option of selectElement.children) {
      if (option.innerText === user) return;
    }
    const option = `<option>${user}</option>`.parseHTML();
    document.getElementById('ignoredUsers').appendChild(option);
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
    
  // add fancy switch to turn off all features and restore the original elements instead
  enhancedUiContainer.parentElement.insertBefore(mainSwitchHtml.parseHTML(), enhancedUiContainer);
  document.getElementById('mainSwitch').addEventListener('change', doChangeMainSwitch);
  
  // mount handler for "new only" filter button
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
  
  // show all that fancy stuff
  updatePage();
  
  // mount handler for selecting another length value
  document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
}



// if we are somewhere else, check if there is a comment section and try to apply ignored user list on it
else if (document.getElementById('commentContent')) {
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



/*
function getOriginalCommentIds(which) {
    const elem = document.getElementById('originalCommentContainer').children[which-1].lastElementChild.lastElementChild.lastElementChild.lastElementChild;
    const txt_id = elem.getAttribute('data-reply');
    const btn_id = elem.getAttribute('data-id');
    const text = (elem.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerText).substring(0,50) + '...'
    return { commentNr: which, txt_id: txt_id, btn_id: btn_id, text: text };
}
getOriginalCommentIds(3);
*/

