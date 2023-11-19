
// set up route-scoped fields and start the execution flow fo this route
let commentData;
let storedCommentData;
/*%% ProfilePage/mainUI.js %%*/

execute_profilePage();



/**
 * Main function of this route
 */
function execute_profilePage() {
  /*%% ProfilePage/style_comments.js %%*/
  /*%% ProfilePage/mainUI.js %%*/
  
  // insert all style sheets used in this route
  addToDOM(`<style>/*%% ProfilePage/profilePage.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>/*%% Global/flipflop.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
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
  
  addToDOM(mainSwitchContainer, enhancedUiContainer, InsertionService.Before, false);
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
  // toggle visibility of custom elements
  for (const element of customElementsRegister.values()) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? entry.classList.remove('hidden') : entry.classList.add('hidden');
    } else {
      this.checked ? element.classList.remove('hidden') : element.classList.add('hidden');
    }
  }
  // toggle visibility of original elements
  for (const element of disabledPrimalElementsRegister.entries()) {
    if (element[1] instanceof Array) {
      for (const entry of element) this.checked ? enablePrimalElement(entry[0]) :enablePrimalElement(entry[0]);
    } else {
      this.checked ? enablePrimalElement(element[0]) :enablePrimalElement(element[0]);
    }
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
    InsertionService.Before,
    true,
    'paginationControlContainer'
  );
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


