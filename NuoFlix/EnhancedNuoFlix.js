// ==UserScript==
// @name            Enhanced NuoFlix
// @name:de         NuoFlix 2.0
// @namespace       http://tampermonkey.net/
// @version         1.0.0
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
// @match           http*://nuoflix.de/profil*
// @run-at          document-end
// @updateURL       https://raw.githubusercontent.com/stuck1a/GreaseMonkeyScripts/main/NuoFlix/EnhancedNuoFlix.js
// @downloadURL     https://raw.githubusercontent.com/stuck1a/GreaseMonkeyScripts/main/NuoFlix/EnhancedNuoFlix.js
// @supportURL      mailto:dev@stuck1a.de?subject=Meldung zum kript 'Enhanced NuoFlix'&body=Problembeschreibung, Frage oder Feedback:
// ==/UserScript==

// Unique key uses in the GM data storage to avoid naming conflicts across scripts
const CACHE_KEY = 's1a/enhancednuoflix';



// Fixed configs
const HighlightedCommentsColor = '#4a4a20';
const cssClassNewComments = 'newComment';
const cssClassHasNewReplies = 'hasNewReply';
const cssClassNewReplies = 'newReply';

// Defaults
const defaultStart = 1;
const defaultLength = 5;


// ###########################################################
// ###                      UTILITIES                      ###
// ###########################################################

/**
 * @return {DocumentFragment}
 */
String.prototype.parseHTML = function()
  {
  var t = document.createElement('template');
  t.innerHTML = this;
  return t.content;
  }


/**
 * @return {string}
 */
String.prototype.escapeSpecialChars = function() {
return this.replace(/\\n/g, "\\n")
.replace(/\\'/g, "\\'")
.replace(/\\"/g, '\\"')
.replace(/\\&/g, "\\&")
.replace(/\\r/g, "\\r")
.replace(/\\t/g, "\\t")
.replace(/\\b/g, "\\b")
.replace(/\\f/g, "\\f");
};


/**
 * Robust JSON parseable checker.
 *
 * @param {any} item  Object to validate
 * @return {bool} True, if parseable to well-formatted JSON
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
 * @param  {string}  key     Target storage key
 * @param  {bool}    global  [optional] Omit script specific cache key
 * @return {bool}            Value stored under given key
 */
function get_value(key, global = false)
  {
  if (!global) key = CACHE_KEY + '_' + key;
  var val = GM_getValue(key) ?? null;
  if (isJson(val)) {
  val = JSON.parse(val);
  }
  return val ?? '';
  }


/**
 * Adds a value to the persistence data storage under the given key.
 *
 * @param  {string} key     Target key
 * @param  {any}    value   Value to store
 * @param  {bool}   global  [optional] Omit script specific cache key
 */
function set_value(key, value, global = false)
  {
  if (!global) key = CACHE_KEY + '_' + key;
  if (isJson(value)) {
  try {
  value = JSON.stringify(value);
  } catch (e) {
  console.warn('[Enhanced NuoFlix] Warning!\nTried to store non-serializable object!\nThe script will try to store it as plain object, but the data might get lost!');
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
 * @param  {string}  key     Target key
 * @param  {bool}    global  [optional] Omit script specific cache key
 * @return {bool}            Whether the target key exists
 */
function has_value(key, global = false)
  {
  if (!global) key = CACHE_KEY + '_' + key;
  return GM_listValues().indexOf(key) >= 0;
  }


/**
 * Deletes value stored under given key from the persistent data storage.
 *
 * @param  {string}  key     Target key
 * @param  {bool}    global  [optional] Omit script specific cache key
 */
function delete_value(key, global = false)
  {
  if (!global) key = CACHE_KEY + '_' + key;
  GM_deleteValue(key);
  }


/**
 * Returns an array with all stored key-value-pairs.
 * If no value is stored, an empty array is returned instead.
 * If you request global keys, you will get the real keys
 * (with thje cache key prefix), otherwise the cache key
 * will be hidden.
 *
 * @param  {string}  key         Target key
 * @param  {bool}    global      [optional] Omit script specific cache key
 * @return {array<{key,value}>}  Array of key-value-objects
 */
function list_values(global = false)
  {
  var result = [];
  for (const key of GM_listValues()) {
  var k = key;
  if (!key.startsWith(CACHE_KEY + '_')) {
  if (!global) continue;
  } else {
  if (!global) k = k.replace(CACHE_KEY + '_', '');
  }
  let value = GM_getValue(key);
  if (isJson(value)) value = JSON.parse(value);
  result.push({key: k, value: (value ?? '')});
  }
  return result;
  }



// ###########################################################
// ###                 SCRIPT FUNCTIONS                    ###
// ###########################################################

/**
 * Adds this scripts central control panel to the DOM.
 *
 * @param {any}  menu
 */
function addCommentMenuToPage(menu)
  {
  var targetParent = document.getElementsByClassName('profilContent');
  if (targetParent && targetParent[0] && targetParent[0].firstElementChild) {
  targetParent = targetParent[0].firstElementChild;
  } else {
  console.error('Anscheinend hat sich die Seitenstruktur verändert, das Userskript muss aktualisiert werden.');
  return;
  }
  
  targetParent.insertBefore(menu, targetParent.firstChild);
  }


/**
 * Appends the given comment block to the pages comment section.
 *
 * @param {DocumentFragment|HTMLElement|HTMLCollection} obj           Comment object
 * @param {HTMLElement}                                 [parent]      Container to insert to
 * @param {string[]}                                    [addClasses]  Additional CSS classes to add
 */
function addCommentToPage(obj, parent = null, addClasses = [])
  {
  // Find the correct container if none was submitted
  if (!parent) parent = document.getElementsByClassName('profilContentInner')[0];
  if (!obj) return;
  parent.appendChild(obj);
  // get live node
  obj = parent.lastElementChild;
  for (const className of addClasses) obj.classList.add(className)
  }


/**
 * Generates the data object for storing existing comments
 * by parsing the container holding which contains all the
 * comments.
 *
 * @return {array<object>}  Comment data collection
 */
function generateCommentObject()
  {
  // get raw data
  var RawData = document.getElementsByClassName('profilContentInner')[0];
  if (!RawData) return [];
  var commentBlocksRaw = RawData.getElementsByClassName('commentItem');
  
  // generate data array for each raw comment
  var commentDataCollection = [];
  var counter = 0;
  var tmp;
  for (const commentRaw of commentBlocksRaw) {
  var commentItemData = {};
  // id
  commentItemData.id = ++counter;
  // section "form"
  commentItemData.form = {};
  if (tmp = commentRaw.getElementsByClassName('sendReplyProfil')[0]) {
  commentItemData.form.txt_id = tmp.getAttribute('data-reply').toString();
  commentItemData.form.btn_id = tmp.getAttribute('data-id').toString();
  tmp = null;
  } else {
  console.error('[Enhanced NuoFlix] Couldn\'t gather comments "form" data - maybe the DOM changed?');
  return [];
  }
  // section "video"
  commentItemData.video = {};
  if (tmp = commentRaw.children[0].children[0]) {
  commentItemData.video.url = tmp.getAttribute('href');
  commentItemData.video.title = tmp.innerText;
  tmp = null;
  } else {
  console.error('[Enhanced NuoFlix] Couldn\'t gather comments "video" data - maybe the DOM changed?');
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
  var storedReplyCount = getReplyCount(commentItemData.form.btn_id, commentItemData.form.txt_id);
  var replyCounter = 0;
  commentItemData.replies = [];
  tmp = commentRaw.children[3].children[3];
  var repliesTotal = tmp.getElementsByClassName('spacer25').length;
  for (var i = 1; i < repliesTotal * 3; i = i + 3 ) {
  var replyData = {};
  // reply id
  replyData.id = ++replyCounter;
  // reply pic
  replyData.pic = tmp.children[i].children[0].getAttribute('src');
  // reply user
  replyData.user = tmp.children[i+1].children[0].innerText;
  // reply date
  replyData.date = tmp.children[i+1].children[1].innerText.substring(3);
  // reply text
  replyData.text = tmp.children[i+1].children[2].innerText;
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
 * @param  {object}          Comment data
 * @param  {int}             Current number of generated comment
 * @return {HTMLDivElement}  Prepared comment block
 */
function createCommentBlock(commentData, counter = 1)
  {
  if (!commentData) return;
  
  // Generate replies
  var cnt = 0;
  var repliesBlock = '';
  for (const data of commentData.replies) {
  repliesBlock = repliesBlock + `
            <div class="spacer25" data-reply-id="` + ++cnt + `"></div>
            <div class="profilPicSmall">
                <img src="` + data.pic + `">
            </div>
            <div class="profilName" class="` + (data.isNew ? cssClassNewReplies : '') + `">
                <strong>` + data.user + `</strong>&nbsp;<small>am ` + data.date + `</small>
                <pre>` + data.text + `</pre>
            </div>
        `;
  }
  
  // Generate full comment
  const commentBlock = `
        <div data-comment-id="` + counter + `" class="commentItem` + (commentData.isNew ? ' ' + cssClassNewComments : '') + (commentData.hasNewReplies ? ' ' + cssClassHasNewReplies : '') + `">
            <div><a href="` + commentData.video.url + `">` + commentData.video.title + `</a></div>
            <div class="spacer15"></div>
            <div class="profilPic"><img src="` + commentData.pic + `"></div>
            <div class="profilName">
                <strong>` + commentData.user + `</strong>&nbsp;<small>am ` + commentData.date + `</small>
                <pre>` + commentData.text + `</pre>
                <div class="allReplys">` + repliesBlock + `</div>
                <div class="replyBtnHolder"><div class="replyBtn">antworten</div></div>
                <div class="replyHolder">
                    <div id="commentTxtHolder">
                        <textarea id="commentTxt_` + commentData.form.txt_id + `" placeholder="Deine Antwort zu diesem Kommentar"></textarea>
                        <div data-id="` + commentData.form.btn_id + `" data-reply="` + commentData.form.txt_id + `" class="btn sendReplyProfil">Antwort abschicken</div>
                    </div>
                </div>
            </div>
        </div>
    `;
  
  return commentBlock.parseHTML();
  }



function highlightCommentByClassName(className)
  {
  customCommentContainer = (typeof customCommentContainer === typeof undefined || customCommentContainer instanceof DocumentFragment)
    ? document.getElementsByClassName('profilContentInner')[0]
    : customCommentContainer;
  for (const comment of customCommentContainer.getElementsByClassName(cssClassNewComments)) {
  comment.style.backgroundColor = HighlightedCommentsColor;
  }
  }



function isNewComment(btn_id, txt_id)
  {
  storedData = storedData || get_value('commentData');
  var msgPrinted = false;
  for (const storedComment of storedData) {
  if (typeof storedComment.form === typeof undefined) {
  if (!msgPrinted) {
  console.info = '[Enhanced NuoFlix] It seems like there is deprecated/invalid/corrupted comment data stored. Usually this should be fixed with the next page refresh.';
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


function getReplyCount(btn_id, txt_id) {
storedData = storedData || get_value('commentData');
var msgPrinted = false;
for (const storedComment of storedData) {
if (typeof storedComment.form === typeof undefined) {
if (!msgPrinted) {
console.info = '[Enhanced NuoFlix] It seems like there is deprecated/invalid/corrupted comment data stored. Usually this should be fixed with the next page refresh.';
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



function insertPaginatedComments()
  {
  var current = currentStart;
  var commentItemElement;
  while (current <= currentLength) {
  commentItemElement = createCommentBlock(commentData[current], current);
  addCommentToPage(commentItemElement, customCommentContainer, []);
  current++;
  }
  }



function buildPaginationUi()
  {
  const totalPages = Math.ceil(totalComments / currentLength);
  const currentPage = Math.ceil((currentStart + 0.00001) / currentLength);
  
  const firstPageButton = currentPage >= 4 ? currentPage - 2 : 1;
  const availablePageButtons = totalPages >= 5 ? 5 : totalPages;
  
  var buttons = '';
  var buttonStart;
  for (var pageNr=firstPageButton; pageNr<availablePageButtons+1; pageNr++) {
  buttonStart = pageNr * currentLength - currentLength + 1;
  buttons += buildPageButton(pageNr, (pageNr == currentPage));
  }
  
  return `
        <div id="paginationContainer">
            <div class="buttonGroup">
                <a id="paginationFirst" class="btn${(currentPage > 1 ? '"' : ' disabled" disabled="disabled"')} data-start="1" data-length="${currentLength}"><<</a>
                <a id="paginationBack" class="btn${(currentPage > 1 ? '"' : ' disabled" disabled="disabled"')} data-start="${(currentPage * currentLength - currentLength + 1)}" data-length="${currentLength}"><</a>
            </div>
            <div id="pageNrBtnContainer" class="buttonGroup">${buttons}</div>
            <div class="buttonGroup">
                <a id="paginationNext" class="btn${(currentPage < totalPages ? '"' : ' disabled" disabled="disabled"')} data-start="${(currentPage * currentLength + 1)}" data-length="${currentLength}">></a>
                <a id="paginationLast" class="btn${(currentPage < totalPages ? '"' : ' disabled" disabled="disabled"')} data-start="${(totalPages * currentLength - currentLength + 1)}" data-length="${currentLength}">>></a>
            </div>
        </div>
    `;
  }



function buildPageButton(pageNr, isActivePage = false)
  {
  const totalPages = Math.ceil(totalComments / currentLength);
  const currentPage = Math.ceil((currentStart + 0.00001) / currentLength);
  return `<a class="btn pageNrBtn${(isActivePage ? ' activePage" disabled="disabled"' : '"')} data-start="${currentStart}" data-length="${currentLength}">${pageNr}</a>`;
  }



function doClickedPagination(ev, clickedBtn)
  {
  if (!clickedBtn) {
  ev = ev || window.event;
  clickedBtn = ev.target || ev.srcElement;
  }
  if (!clickedBtn) return;
  if (clickedBtn.hasAttribute('disabled')) return;
  const pageNr = clickedBtn.innerText;
  
  // update global pagination variables
  currentStart = clickedBtn.getAttribute('data-start') || currentStart || defaultStart;
  currentLength = clickedBtn.getAttribute('data-length') || currentLength || defaultLength;
  
  // update page
  updatePaginationUI();
  updateComments();
  }



/**
 * Deletes the pagination UI from DOM, if exists and rebuild + insert it
 * again based on the values from the global variables currentStart and currentLength.
 */
function updatePaginationUI()
  {
  if (typeof paginationContainer !== typeof undefined && paginationContainer instanceof HTMLElement) paginationContainer.remove();
  paginationContainer = buildPaginationUi().parseHTML();
  const commentHeadlineElement = document.getElementsByClassName('rowHeadlineHolder')[0];
  commentHeadlineElement.parentElement.insertBefore(paginationContainer, commentHeadlineElement.nextElementSibling);
  paginationContainer = document.getElementById('paginationContainer');
  const paginationButtons = document.getElementById('paginationContainer').getElementsByClassName('btn');
  for (const paginationBtn of paginationButtons) paginationBtn.addEventListener('click', function(e) { doClickedPagination(e, this); });
  }



/**
 * Deletes all comments from DOM and rebuild + insert them again based
 * on the values from the global variables currentStart and currentLength.
 */
function updateComments()
  {
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
  highlightCommentByClassName(cssClassNewComments);
  customCommentContainer = document.getElementsByClassName('profilContentInner')[0];
  }




// ###########################################################
// ###                  EXECUTION FLOW                     ###
// ###########################################################

const globalStyles = `
    <style>
        .hidden {
            display: none !important;
        }
        #paginationContainer .btn.disabled {
            background-color: darkgray !important;
            color: lightgray !important;
            cursor: default !important;
        }
        #paginationContainer {
            text-align: center;
            margin-block: 0.8rem;
        }
        #paginationContainer .btn {
            margin-inline: min(max(0.1vw, 0.5em), 15px);
        }
        .buttonGroup {
            display: inline-block;
        }
        .pageNrBtn {
            padding-inline: max(1.0vw, 10px);
        }
        .pageNrBtn.activePage {
            cursor: default !important;
            font-weight: bold !important;
            background-color: #c86852;
        }
    </style>
`;


const fnc_showNewCommentsOnly = `
  //  alert('test');
`;

const menuBaseHtml = `
    <div id="enhancedUi">
        <a class="btn" onclick="${fnc_showNewCommentsOnly}">
            Zeige nur neue Kommentare
        </a>
    </div>
`;

document.body.appendChild(globalStyles.parseHTML());

// initialize variables
let currentStart = defaultStart;
let currentLength = defaultLength;
let paginationContainer, customCommentContainer, originalCommentContainer;
let commentData, storedData, totalComments;

// addhe new UI
addCommentMenuToPage(menuBaseHtml.parseHTML());

// hide the original comment container
originalCommentContainer = document.getElementsByClassName('profilContentInner')[0];
originalCommentContainer.id = 'originalCommentContainer';
originalCommentContainer.style.display = 'none';

// get stored comment data (to identify new comments) and update storage with the new comment data
storedData = get_value('commentData');
commentData = generateCommentObject();
totalComments = commentData.length;
set_value('commentData', commentData);

// add custom comment container
customCommentContainer = '<div class="profilContentInner"></div>'.parseHTML();
originalCommentContainer.parentElement.insertBefore(customCommentContainer, originalCommentContainer);

// add pagination elements and paginated comments
updatePaginationUI();
updateComments();



// TOFIX: data-start wird noch nicht richtig berechnet

