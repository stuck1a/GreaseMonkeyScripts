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


  /*
   * TODO: Implement wrapper fnc addToDOM(element, refElement, method, isCustomElement = true) which facades appendChild() and insertBefore().
   *       method value       placement
   *       'asLastChild'      refElement.appendChild(element)
   *       'asFirstChild'     refElement.prependChild(element)
   *       'after'            refElement.parentElement.insertAfter(element, refElement)
   *       'before'           refElement.parentElement.insertBefore(element, refElement)
   *       Additionally, the wrapper will maintain a global list of custom elements, so that we know which elements to hide when
   *       we turn off the script with the main switch.
   *       
   * TODO: Implement wrapper fnc hideOriginElement(element, restoreId) which will also maintain such a list, just for
   *       original page elements we disabled because we replaced them with custom ones or so. Will be used to restore the
   *       original page state when we turn off the script with the main switch. But we also store a object reference, so
   *       we can use it to gather infos about it and such.
   */

(function() {
  /*%% Global/configs.js %%*/
  /*%% Global/translations.js %%*/
  /*%% Global/utilFunctions.js %%*/
  /*%% Global/functions_allPages.js %%*/
  /*%% Global/functions_debug.js %%*/
  /*%% Global/html_mainSwitch.js %%*/
  
  let totalComments;
  let paginationContainer, paginationContainerBottom, paginationControlContainer;
  let customCommentContainer, originalCommentContainer;
  
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

  // set up blocked user filter
  for (const user of get_value('ignoredUsers')) {
    document.getElementById('ignoredUsers').appendChild(`<option>${user}</option>`.parseHTML());
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
  }

  
  // hand over execution flow depending on the route (literally the current page)
  const route = getActiveRoute();
  if (route === 'index') {
    (function() { /*%% StartPage/functions_startPage.js %%*/ })();
  } else if (route === 'profile') {
    (function() { /*%% ProfilePage/functions_profilePage.js %%*/ })();
  } else if (route === 'video') {
    (function() { /*%% VideoPage/functions_videoPage.js %%*/ })();
  }
})();
