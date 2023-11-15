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

/*%% configs.js %%*/

/*%% translations.js %%*/


// ###########################################################
// ###                      UTILITIES                      ###
// ###########################################################

/*%% utilFunctions.js %%*/

// ###########################################################
// ###                 SCRIPT FUNCTIONS                    ###
// ###########################################################

/*%% functions_allPages.js %%*/

/*%% functions_debug.js %%*/

/*%% functions_profile.js %%*/

/*%% functions_videos.js %%*/


// ###########################################################
// ###                  EXECUTION FLOW                     ###
// ###########################################################

// declare global variables
let currentStart = defaultStart;
let currentLength = defaultLength;
let activeLanguage = defaultLanguage;
let filteredCommentsCount = 0;

let commentData, storedData, totalComments;
let enhancedUiContainer, commentFilters,
    paginationContainer, paginationContainerBottom, paginationControlContainer,
    customCommentContainer, originalCommentContainer;

// execution path for profile page
if (onProfilePage()) {

  /*%% globalStyles.js %%*/

  /*%% mainSwitch.js %%*/

  /*%% executionflow_profile.js %%*/
}

// execution path for generic pages (will search for comment sections and apply block list on it, if found)
else {
  applyBlockedUserGenericPage();
}
