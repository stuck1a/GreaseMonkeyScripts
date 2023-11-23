/*<SKIP*/
/** @var {function} folgenItem */
/** @var {EventTarget} BeforeUnloadEvent.originalTarget */
/*</SKIP>*/


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
  // replace all elements which need to be modified
  replaceSuggestedVideoTiles();
  replaceReloadButton();
  // Try to find content of blocked users and hide them
  hideCommentsOfBlockedUsers(true);
  // initialize i18n strings
  updateStaticTranslations();
}



/**
 * Replace the original tiles for suggested videos with tiles, which allow to use the "open in new tab" function.
 */
function replaceSuggestedVideoTiles() {
  
  /* ALTE VERSION, DIE DIE VORHANDENEN ELEMENT MODIFIZIERT */
  
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
      const originalTarget = ev.originalTarget || ev.srcElement;
      const callee = originalTarget.activeElement;
      if (callee.classList.contains('overlayLink')) {
        let permalink = originalTarget.activeElement.getAttribute('href').replace(window.location.origin, '');
        permalink = permalink.substring(1, permalink.length);
        if (permalink) {
          window.onbeforeunload = null;  // prevent infinity loop
          folgenItem(permalink);
        }
      }
    });
  }
  
  /* NEUE VERSION, DIE DIE ORIGINALEN ELEMENTE DURCH MODIFIZIERTE KLONE ERSETZT */
  // TODO
}



/**
 * Replace the original "Reload" button of the comment section is one, which applies the list of blocked users
 * after reloading.
 */
function replaceReloadButton() {
  const originalButton = document.getElementsByClassName('reloadComment')[0];
  const modifiedButton = originalButton.cloneNode(true);
  modifiedButton.addEventListener('click', function(ev) {
    hideCommentsOfBlockedUsers(true);
  });
  addToDOM(modifiedButton, originalButton, InsertionService.Before, true, 'customReloadButton');
  disablePrimalElement(originalButton, 'originalReloadButton');
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
