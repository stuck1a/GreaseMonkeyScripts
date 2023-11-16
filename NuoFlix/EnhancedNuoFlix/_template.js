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
  /*%% Global/configs.js %%*/
  /*%% Global/translations.js %%*/

  // ###########################################################
  // ###                      UTILITIES                      ###
  // ###########################################################

  /*%% Global/utilFunctions.js %%*/

  // ###########################################################
  // ###                 SCRIPT FUNCTIONS                    ###
  // ###########################################################

  /*%% Global/functions_allPages.js %%*/
  /*%% Global/functions_debug.js %%*/

  // ###########################################################
  // ###                  EXECUTION FLOW                     ###
  // ###########################################################

  // declare global variables
  let commentData;
  let storedData;
  let totalComments;
  let enhancedUiContainer;
  let paginationContainer, paginationContainerBottom, paginationControlContainer;
  let customCommentContainer, originalCommentContainer;
  /*%% Global/html_mainSwitch.js %%*/

  // initialization
  let currentStart = defaultStart;
  let currentLength = defaultLength;
  let activeLanguage = defaultLanguage;
  let filteredCommentsCount = 0;

  let commentFilters = new Map([
    // currently supported types for property "value" are: boolean, string, array
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],
    [ 'filterSkipUser', { active: false, value: [] } ],
    [ 'filterTextSearch', { active: false, value: [] } ],
  ]);

  // restore list of ignored users
  const storedIgnoreList = get_value('ignoredUsers');
  for (const user of storedIgnoreList) {
    document.getElementById('ignoredUsers').appendChild(`<option>${user}</option>`.parseHTML());
    const ignoreFilter = commentFilters.get('filterSkipUser');
    ignoreFilter.value.push(user);
    ignoreFilter.active = true;
  }

  // hand over execution flow depending on which page we are
  const route = getActiveRoute();
  if (route === 'index') {
    /*%% StartPage/functions_startPage.js %%*/
    execute_startPage();
  } else if (route === 'profile') {
    /*%% ProfilePage/functions_profilePage.js %%*/
    execute_profilePage();
  } else if (route === 'video') {
    /*%% VideoPage/functions_videoPage.js %%*/
    execute_genericPage();
  }
})();
