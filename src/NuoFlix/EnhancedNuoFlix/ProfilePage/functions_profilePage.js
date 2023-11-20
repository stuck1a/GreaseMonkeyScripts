
// set up route-scoped fields and configs, then start the execution flow fo this route
let commentData;
let storedCommentData;
const maxCommentHeightBeforeCut = 250;  // in pixel

/*%% ProfilePage/mainUI.js %%*/

execute_profilePage();



/**
 * Main function of this route
 */
function execute_profilePage() {
  /*%% ProfilePage/style_comments.js %%*/
    
  // insert all style sheets used in this route
  addToDOM(`<style>/*%% ProfilePage/profilePage.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>/*%% Global/flipflop.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
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
  document.getElementById('filterOnlyNew').addEventListener('change', function() {
    changeFilter('filterOnlyNew', !commentFilters.get('filterOnlyNew').value);
    if (commentFilters.get('filterOnlyNew').active) {
      // no need to highlight new comments if we filter all not new
      document.getElementById('style_newComment').innerText = '';
    } else {
      document.getElementById('style_newComment').innerText = `.newComment { background-color: ${highlightedCommentsColor} }`;
    }
  });

  // mount handlers for setting the checked attribute of flip flop switches
  for (const flipflop of document.getElementsByClassName('flipflop')) {
    flipflop.addEventListener('change', function() {
      const input = this.getElementsByTagName('input')[0];
      input.hasAttribute('checked') ? input.removeAttribute('checked') : input.setAttribute('checked', 'checked');
    });
  }
  
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
    <div id="language_container" class="row">
      <div id="language_dropdown_toggler">
        <span id="activeLanguage">${i18n.get(activeLanguage).get('__metadata__').displayName}</span>
        <span>&gt;</span>
      </div>
      <div id="language_dropdown_menu"></div>
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
 * by date in descending order including the reply dates.
 * 
 * @param {string} [orderType='activity']  - One of the predefined order keywords: activity, user, video, replyCount, relevance
 */
function doOrderCommentData(orderType = 'activity') {
  if (orderType === 'user') {
    // compares the comment authors (no replies) and orders from A to Z
    commentData.sort((a, b) => {
      const valA = a.user.toUpperCase();
      const valB = b.user.toUpperCase();
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
    // TODO: Introduce "matchValue", then unlock order type "relevance"
    log('Feature "order by relevance" not yet implemented!');
    return;
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
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
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
  for (const element of staticTranslatableElements.entries()) element[0].innerText = t(element[1].text, element[1].args);
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


