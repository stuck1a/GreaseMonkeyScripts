/*%% Global/userscript_definition.js %%*/

(function() {
  
  /*%% Global/configs.js %%*/
  /*%% Global/translations.js %%*/
  /*%% Global/utilFunctions.js %%*/
  /*%% Global/functions_global.js %%*/
  /*%% Global/functions_debug.js %%*/
  /*%% Global/messagebox.js %%*/
  
  addToDOM(`<style>/*%% Global/global.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);
  addToDOM(`<style>/*%% Global/flipflop.css %%*/</style>`.parseHTML(), document.body, InsertionService.AsLastChild, false);

  // set up script-wide variables (used in all/multiple routes)
  /** @global */ let mainSwitchState;
  /** @global */ let customElementsRegister = new Map();
  /** @global */ let disabledPrimalElementsRegister = new Map();
  /** @global */ let staticTranslatableElements = new Map();
  /** @global */ let playlistData = has_value('playlistData') ? get_value('playlistData') : defaultPlaylists;
  /** @global */ let activeLanguage = has_value('setting_language') ? get_value('setting_language') : defaultLanguage;
  /** @global */ let commentFilters = new Map([
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
  /** @global */ const mainSwitch = `
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


  // reset to default page state if script was disabled on page load
  if (!mainSwitchState) doChangeMainSwitch( false);

})();
