/*<SKIP>*/
/** @var {function} folgenItem  - Funktion von NuoFlix */
/** @typedef {EventTarget} BeforeUnloadEvent.originalTarget  - Non-standard property, but available in many browsers */
/*</SKIP>*/


// set up route-scoped fields and start the execution flow for this route
/** @type {number}      */ const searchComments_maxRetries = 5;
/** @type {number}      */ const searchComments_delayBeforeRetry = 250;
/** @type {number}      */ let searchComments_retryCounter = 0;
/** @type {string[]}    */ let storedIgnoreList;
/** @type {HTMLElement} */ let commentContainer;
/** @type {object}      */ let currentVideoObj;

execute_genericPage()




/**
 * Main function of this route
 */
function execute_genericPage() {
  addToDOM(`<style>/*%% VideoPage/videoPage.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  
  // replace all elements which need to be modified
  replaceSuggestedVideoTiles();
  replaceReloadButton();
  // try to find content of blocked users and hide them
  hideCommentsOfBlockedUsers(true);
  // initialize i18n strings
  updateStaticTranslations();
  // add additional buttons for playlists under the video
  addAdditionalVideoButtons();
  
  // fill the heart icon, if video is in playlist "Favorites"
  const favoriteButton = document.getElementById('favoriteIcon');
  
  // mount handler for button "add to favorites"
  favoriteButton.addEventListener('click', function() {
    const obj = getVideoItemObject();
    if (isVideoInFavorites(obj.id)) {
      removeVideoFromPlaylist(obj, favoritesID);
      this.classList.remove('isFavorite');
      const playlist = getPlaylistObjectById(favoritesID);
      messagebox('success', t('Video wurde von Playlist "{0}" entfernt.', playlist.is_custom ? playlist.name : t(playlist.name)));
    } else {
      addVideoToPlaylist(obj, favoritesID);
      this.classList.add('isFavorite');
      const playlist = getPlaylistObjectById(favoritesID);
      messagebox('success', t('Video wurde zur Playlist "{0}" hinzugefügt.', playlist.is_custom ? playlist.name : t(playlist.name)));
    }
  });
  
  // mount handler for button "add to playlist"
  const opener = function () {
    // update the playlistData in case someone have multiple video pages open to add videos
    playlistData = get_value('playlistData');
    openAddToPlaylistMenu(document.getElementById('addToPlaylistWrapper'));
    document.getElementById('addToPlaylistIcon').removeEventListener('click', opener);
  }
  document.getElementById('addToPlaylistIcon').addEventListener('click', opener);

  
  // some tasks require the DOM content to be loaded, so wait for it from this point
  const onReadyTasks = function() {
    // fetch video id
    const currentVideoId = document.getElementById('sendcomment').getAttribute('data-id');
    // fill heart icon, if video is already in playlist "favorites"
    if (isVideoInFavorites(parseInt(currentVideoId))) favoriteButton.classList.add('isFavorite');
    
    // if this video page is not for watching a playlist in the iframe pseudo page...
    const playlistRow = document.getElementById('playlistRow');
    if (!playlistRow) {
      // add the video to the playlist "last watched" (if it is already in the list, addVideoToPlaylist will also remove the old entry)
      addVideoToPlaylist(getVideoItemObject(), lastWatchedID);
    } else if (parseInt(playlistRow.getAttribute('data-playlist-id')) === watchLaterID) {
      // if we are watching the playlist "watch later", then remove the video from the list now
      removeVideoFromPlaylist(getVideoItemObject(), watchLaterID);
    }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onReadyTasks) : onReadyTasks();
  
}



/**
 * Replace the original tiles for suggested videos with tiles, which allow to use the "open in new tab" function.
 */
function replaceSuggestedVideoTiles() {
  // add link overlays over suggested videos to enable "open in new tab" function
  let foundSuggestedVideos = false;
  const tiles = Array.from(document.getElementsByClassName('folgenItem'));
  for (const i in tiles) {
    const originalTile = tiles[i];
    // make sure we have an element, some weird bug cause weird things here
    if (originalTile instanceof HTMLElement) {
      // generate full URI
      let uri = originalTile.getAttribute('onClick').replace("folgenItem('", '');
      uri = window.location.origin + '/' + uri.substr(0, uri.length - 2);
      // generate clone of the tile with an real link as overlay
      const customTile = originalTile.cloneNode(true);
      customTile.removeAttribute('onClick');
      customTile.appendChild(`<a href="${uri}" class="overlayLink" style="position:absolute;left:0;top:0;height:100%;width:100%"></a>`.parseHTML());
      addToDOM(customTile, originalTile, InsertionService.Before);
      disablePrimalElement(originalTile);
      foundSuggestedVideos = true;
    }

  }
  
  // call the original function before leaving, maybe NuoFlix use it to collect video statistics with it or so
  // OPTIMIZE: Möglichkeit finden, wie das auch dann noch zuverlässig durchgeführt wird, wenn "Open in new Tab" benutzt wird
  if (foundSuggestedVideos) {
    window.addEventListener('beforeunload', function(ev) {
      // get the permalink from the event to pass it to folgenItem(permalink) if the overlay link was used
      const originalTarget = ev.originalTarget || ev.srcElement;
      const callee = originalTarget.activeElement;
      if (callee.classList.contains('overlayLink')) {
        let permalink = originalTarget.activeElement.getAttribute('href').replace(window.location.origin, '');
        permalink = permalink.substring(1, permalink.length);
        if (permalink) {
          window.onbeforeunload = null;    // otherwise might lead to an infinity loop in some exotic browsers
          folgenItem(permalink);
        }
      }
    });
  }
}



/**
 * Replace the original "Reload" button of the comment section is one, which applies the list of blocked users
 * after reloading.
 */
function replaceReloadButton() {
  const originalButton = document.getElementsByClassName('reloadComment')[0];
  const modifiedButton = originalButton.cloneNode(true);
  modifiedButton.addEventListener('click', function() {
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
        if (commentContainer.childElementCount > 0) {
          for (const user of storedIgnoreList) hideCommentsOfUser(user);
        } else {
          // retry it up to 3 times after waiting one second after each try
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



/**
 * Deletes all comments and replies of a given user
 *
 * @param {string} username  - Target username
 */
function hideCommentsOfUser(username) {
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



/**
 * Creates and inserts the "Add to Favorites" and "Add to Playlist" buttons.
 */
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



/**
 * Checks whether the target video is listed in the "Favorites" playlist.
 * 
 * @requires playlistData
 * 
 * @param {number} videoId  - Target video id
 * 
 * @return {boolean}  - True, if the video ID is found in item list of playlist "Favorites", false otherwise
 */
function isVideoInFavorites(videoId) {
  return isVideoInPlaylist(videoId, favoritesID) !== false;
}



/**
 * Creates a list von playlist ids which list the target video.
 * 
 * @requires playlistData
 * 
 * @param {(Object|number)} video  - Target video id or object
 * 
 * @return {number[]}  - Array of playlist IDs where the video is listed
 */
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



/**
 * Collects all video data from the current video page and generates a video object from it.
 * 
 * @requires currentVideoObj
 * 
 * @return {object} - Video object which can be added to a playlist
 */
function getVideoItemObject() {
  if (currentVideoObj) return currentVideoObj;
  // element gathering
  const id = document.getElementById('sendcomment');
  const title = document.getElementById('cmsFramework').getElementsByTagName('h2')[0];
  // validation
  let missing = '';
  if (!id) {
    missing = 'id';
  } else if (!title) {
    missing = 'title';
  } else {
    currentVideoObj = {
      // if all required elements where found we can be pretty sure, everything is alright
      id: id.getAttribute('data-id'),
      url: window.location.pathname,
      title: title.innerText,
    };
    return currentVideoObj;
  }
  // on failure
  const msg = t('Daten für Property "{0}" nicht gefunden - hat sich der DOM geändert?', missing);
  messagebox('error', msg);
  log(msg, 'error', [ t('Aufgetreten in {0}', 'getVideoItemObject') ]);
}



/**
 * Generates the playlist selection menu and adds it to the DOM.
 * 
 * @param {HTMLElement} refElement  - Reference element used for the placement of the list
 * 
 * @requires playlistData
 * @requires currentVideoObj
 */
function openAddToPlaylistMenu(refElement) {
  if (!playlistData) return;
  const modal = `<div id="playlistModal"><div id="checkboxList"></div></div>`.parseHTML().firstElementChild;
  const checkboxList = modal.firstElementChild;
  // add playlist entries
  const videoObj = getVideoItemObject();
  for (const playlist of playlistData) {
    // do not display playlist "Favorites" or "last viewed"
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
    // update the playlistData in case someone have multiple video pages open to add videos
    playlistData = get_value('playlistData');
    openAddToPlaylistMenu(document.getElementById('addToPlaylistWrapper'));
    document.getElementById('addToPlaylistIcon').removeEventListener('click', opener);
  }
  
  // add button "confirm"
  const confirmButton = addToDOM(`<div style="margin-top: 1rem;"><a class="btn btn-small">${t('Bestätigen')}</a></div>`.parseHTML(), modal, InsertionService.AsLastChild, false).firstElementChild;
  confirmButton.addEventListener('click', function() {
    // add video to all checked playlists and remove it from all not checked
    const videoObj = getVideoItemObject();
    for (const input of document.getElementsByClassName('checkboxListItem')) {
      const playlistId = parseInt(input.getAttribute('data-playlist-id'));
      if (input.checked) {
        // just to be sure, check again that the video is no member yet
        if (!isVideoInPlaylist(videoObj.id, playlistId)) {
          addVideoToPlaylist(videoObj, playlistId);
        }
      } else {
        removeVideoFromPlaylist(videoObj, playlistId);
      }
    }
    messagebox('success', t('Änderungen wurden gespeichert.'));
    removeFromDOM(modal);
    document.getElementById('addToPlaylistIcon').addEventListener('click', opener);
  });
  
  // add button "cancel"
  const cancelButton = addToDOM(`<div><a class="btn btn-small">${t('Abbrechen')}</a></div>`.parseHTML(), modal, InsertionService.AsLastChild, false).firstElementChild;
  cancelButton.addEventListener('click', function() {
    removeFromDOM(modal);
    document.getElementById('addToPlaylistIcon').addEventListener('click', opener);
  });
  // display the list
  addToDOM(modal, refElement, InsertionService.AsLastChild, true, 'playlistModal');
}


