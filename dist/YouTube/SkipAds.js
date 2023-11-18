// ==UserScript==
// @name         YouTube Skip Ad's
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Youtube Werbeeinblendungen entfernen
// @author       stuck1a
// @match        https://www.youtube.com/watch?v=*
// @grant        none
// ==/UserScript==
(function() {
  'use strict';
  setInterval(
    function () {
      try {
        var overrayAd = document.querySelector("div.ytp-ad-overlay-close-container > button");
        overrayAd.click();
        console.log('overray ad closed');
      } catch (e) {}
      
      try {
        var skipButton = document.querySelector(".ytp-ad-skip-button");
        skipButton.click();
        console.log('skipable ad closed');
      } catch (e) {}
      
    }, 2000
  )
})();
