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
  
  addToDOM(`<style>/*%% Global/global.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>/*%% Global/flipflop.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  
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

  // add switch to header which enables/disables all features of this Userscript
  const mainSwitch = `
    <div style="position: relative;top: -35px;left: 6rem;display: inline-flex;">
      <div class="flipflop" style="--color-on: var(--theme-color);">
        <span id="mainSwitchLabel" style="padding-right: 1rem;"></span>
        <label><input id="mainSwitch" type="checkbox" checked="checked" /><span></span></label>
      </div>
    </div>
  `.parseHTML();
  addToDOM(mainSwitch, document.getElementById('header').lastElementChild, InsertionService.AsLastChild, false);
  registerStaticTranslatable(document.getElementById('mainSwitchLabel'), 'NuoFlix 2.0', []);
  document.getElementById('mainSwitch').addEventListener('change', doChangeMainSwitch);


  
  // hand over execution flow depending on the route (literally the current page)
  const route = getActiveRoute();
  if (route === 'index') {
    (function() { /*%% StartPage/functions_startPage.js %%*/ })();
  } else if (route === 'profile') {
    (function() { /*%% ProfilePage/functions_profilePage.js %%*/ })();
  } else if (route === 'video') {
    (function() { /*%% VideoPage/functions_videoPage.js %%*/ })();
  }

  // mount handlers for setting the checked attribute of flip flop switches
  for (const flipflop of document.getElementsByClassName('flipflop')) {
    // execute before all other handlers
    let existingChangeHandlers = flipflop.onChange;
    flipflop.onChange = function() {
      // toggle checked attribute
      const input = this.getElementsByTagName('input')[0];
      input.hasAttribute('checked') ? input.removeAttribute('checked') : input.setAttribute('checked', 'checked');
      // execute all other handler
      existingChangeHandlers.apply(this, arguments);
    }
    

  }
})();
