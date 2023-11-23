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
  /*%% Global/modal.js %%*/
  
  addToDOM(`<style>/*%% Global/global.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>/*%% Global/flipflop.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);


  /**@global*/ let mainSwitchState;
  /**@global*/ let customElementsRegister = new Map();
  /**@global*/ let disabledPrimalElementsRegister = new Map();
  /**@global*/ let staticTranslatableElements = new Map();
  
  // set up script-wide variables (used in all/multiple routes)
  /**@global*/ let totalComments;
  /**@global*/ let paginationContainer, paginationContainerBottom, paginationControlContainer, paginationControlContainerBottom;
  /**@global*/ let customCommentContainer,originalCommentContainer



  // TODO: Should be profile page specific
  /**@global*/ let currentStart = defaultStart;
  /**@global*/ let currentLength = defaultLength;
  /**@global*/ let activeLanguage = defaultLanguage;
  /**@global*/ let filteredCommentsCount = 0;

  /**@global*/ let commentFilters = new Map([
    [ 'filterOnlyNew', { active: false, value: false } ],
    [ 'filterOnlyUser', { active: false, value: [] } ],
    [ 'filterSkipUser', { active: false, value: [] } ],
    [ 'filterTextSearch', { active: false, value: [] } ],
    [ 'filterDateRange', { active: false, value: [] } ],
  ]);

  
  
  /* add switch to header which enables/disables all features of this Userscript */
  // get stored state or initialize it
  if (has_value('scriptEnabled')) {
    mainSwitchState = get_value('scriptEnabled');
  } else {
    set_value('scriptEnabled', true);
    mainSwitchState = true;
  }
  
  // insert switch
  /**@global*/ const mainSwitch = `
    <div style="position: relative;top: -35px;left: 6rem;display: inline-flex;">
      <div class="flipflop" style="--color-on: var(--theme-color);">
        <span id="mainSwitchLabel" style="padding-right: 1rem;"></span>
        <label><input id="mainSwitch" type="checkbox" ${mainSwitchState ? 'checked="checked" ' : ''}/><span></span></label>
      </div>
    </div>
  `.parseHTML();
  addToDOM(mainSwitch, document.getElementById('header').lastElementChild, InsertionService.AsLastChild, false);
  registerStaticTranslatable(document.getElementById('mainSwitchLabel'), 'NuoFlix 2.0', []);
  document.getElementById('mainSwitch').addEventListener('change', doChangeMainSwitch);
  
  
  // stop here, if the script is disabled
  if (!mainSwitchState) {
    // but mount a handler which will execute the script when it gets enabled
    
  }
  
  
  // hand over execution flow depending on the route (literally the current page)
  const route = getActiveRoute();
  if (route === 'start') {
    (function() { /*%% StartPage/functions_startPage.js %%*/ })();
  } else if (route === 'profile') {
    (function() { /*%% ProfilePage/functions_profilePage.js %%*/ })();
  } else if (route === 'video') {
    (function() {
      // make sure, that it's really a video page (they all have a reload button in all possible states)
      if (!document.getElementsByClassName('reloadComment')[0]) {
        updateStaticTranslations();
        return;
      }
      /*%% VideoPage/functions_videoPage.js %%*/
    })();
  }

  // mount handlers for setting the checked attribute of flip flop switches
  for (const flipflop of document.getElementsByClassName('flipflop')) {
    // execute before all other handlers
    flipflop.prependEventListener('change', function() {
      // toggle checked attribute
      const input = this.getElementsByTagName('input')[0];
      input.hasAttribute('checked') ? input.removeAttribute('checked') : input.setAttribute('checked', 'checked');
    });
  }


  // reset to default page state if script was disabled 
  // TODO: Really cancel script if initially disabled but mount handler of switch before exit which will execute the whole script IIFS
  //if (!mainSwitchState) doChangeMainSwitch(null);

})();
