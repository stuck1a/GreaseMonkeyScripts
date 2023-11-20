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
  /*%% Global/utilFunctions.js %%*/
  /*%% Global/functions_global.js %%*/
  /*%% Global/functions_debug.js %%*/
  
  addToDOM(`<style>/*%% Global/realisticSwitch.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  
  let totalComments;
  let paginationContainer, paginationContainerBottom, paginationControlContainer, paginationControlContainerBottom;
  let customCommentContainer, originalCommentContainer;

  let customElementsRegister = new Map();
  let disabledPrimalElementsRegister = new Map();
  let staticTranslatableElements = new Map();

  let currentStart = defaultStart;
  let currentLength = defaultLength;
  let activeLanguage = defaultLanguage;
  let filteredCommentsCount = 0;
  
  let commentFilters = new Map([
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],
    [ 'filterSkipUser', { active: false, value: [] } ],
    [ 'filterTextSearch', { active: false, value: [] } ],
    [ 'filterDateRange', { active: false, value: [] } ],
  ]);

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
