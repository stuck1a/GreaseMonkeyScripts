// ==UserScript==
// @name [OFFICIAL] Steam Workshop Downloader :: IO
// @description Quickly download files from the steam workshop- using steamworkshopdownloader.io.
// @namespace http://steamworkshopdownloader.io/extension/
// @match *://*.steamcommunity.com/sharedfiles/filedetails/?id=*
// @match *://*.steamcommunity.com/workshop/filedetails/?id=*
// @run-at document-end
// @version 1.7
// @icon https://steamworkshopdownloader.io/logo.png
// ==/UserScript==

if(typeof jQuery !== "function" && unsafeWindow) {
var jQuery = unsafeWindow.jQuery;
}

const arrow = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEHklEQVRYR8WX/U9aVxjHH1QEX2O2mUXv5W4xVhHkVdDq1rk2KfWFJSbdzLa/ZO+/tNvav6BLuiyZ+6X7wUXFJV2XtNsPa6uiKIoIiLQCviUkRgP3KupZHghNq3B52izZ+YWE+z3f7+c85zkn9yrgfx4Kan4wtBqVJImn6NVqdazlXLOGoiUDLHgX2VuCACpVOQDgNHbKP/vfweEhPH26DiajgeRNEmHS/IKXtbacA7VaLbswSZIgEAyB2WQkeZNEmOiZX2Da1hYSwEogCBazieRNEiHAnGeeaVtboaKieAX8KwGwWswkb5IIAWbnPKxNiwAVslsgShL4/SvQYbWQvEkiTHTPzjFdm7Y4gCjCsn8FbB1WkjdJhAAz7lmm17WRAHzLfrDbOkjeJBECTM+4WbteRwJY8i1Dp91G8iaJMgDTM0zfrofKIj2QSong8/mgs9NO8iaJEGBqapq1I0BlpWwTpkQRlhaXoKurk+RNEmHi46lpZqAApFKwuOSD8/81wKNHj5nRaChegVQKvN5F6O4+T1ocSYQV+OfhQ2Y0GKGysgIUivzTGGOAPeBd9MI7PT0kb5IIAR789TezmE2kU+CZX4CL7/eSvEkiBLh3709msViKXsWiKIHH4wGH4zLJmyRCANfk78zWYQWVSiV7Cg4ODvDWhA+cgyTvMyKXa3IrnU6/mS/FbreBUqmU7YHDdBrcM+68kEqlUnI6B99WKBTbOcEZgNGxMfGN115X81xjRpNtOAXgD74LHB0dATZboYGA+E6QlbBn2lh8A7a2tmBwoN9UXV3tLQiQSCQu37//wNXY2KASBAHS6fQzE4Q5OTmRBSgtLX1Bj0Dr6+sQiTyBnp7ua01NTd88D593nxKJhOPu3T8mOI5TaTQ84L5icKHjd7oaWKGSkpJMv0SjMViLROC9C+9ea25ufiE8U+FCpUQI1+TkBNeYhRBFEY6Pj2UbMPcQw/HKzoSvRaC398J1rVb7db7Jsp26vb19ZWLCNc7znIrneUgmk0UhcAuqqqogFotBOLwGly5dvK7T6fKGy1YgR4sQo6O/jfM8r+K4RlmIXHg8vgHhcBgcDse3er3uK7mykc4qQty58+uERsOXcxwH+/v7ZyqB4TU1NRCPxyG0GoaB/r7vDAbDl8X2jASAJjs7O30jI7+MazSacqzE3t5e5kjiKCsrg9raWsCVr66GwOl0fm8ymb4oFk7agudNNjZ2+n4e+WlcyEBwsLu7m3lcV1eXXXkoBENDQzfMZvPnlPCXBsAJm5ub/bdv/zgmCEKmEjhw5YFgED768OoNq9VKDn8lgBzErVs/jAmCBr/TIBAIwvDw8E273fYZdeUFb0KqQTQaHUAIURSVH3/6yc0uu/2lw1+5AjnIZDLZkEqlGurr6+eo4Kd1/wLmE60w0vLGGQAAAABJRU5ErkJggg==";

function getIframeAnchor()
  {
  return getPageType() === 'item' ? jQuery("div.workshopItemPreviewArea") : jQuery("div.collectionControls");
  }

function getButtonAnchor() {
return getPageType() === 'item' ? jQuery("#SubscribeItemBtn") : (
  jQuery("div.subscribeCollection:contains('Subscribe')").find('> span').last().length
    ? jQuery("div.subscribeCollection:contains('Subscribe')").find('> span').last() // Has a subscribe collection box, use that.
    : jQuery("div.workshopItemDescriptionTitle:contains('Items')").find("> span") // Use the defailt items count title.
);
}

/**
 * Determine the type of page based on the elements displayed on it.
 */
function getPageType() {
if (jQuery("div.game_area_purchase_game").length && jQuery("span.subscribeText").length) {
return 'item';
} else if (jQuery("#mainContentsCollection").length) {
return 'collection';
}

return null;
}


/**
 * When the download button is pressed, insert an iframe with the download page into the site.
 */
function onDownloadWorkshopItem() {
// Hide the iframe in case it already exists- a toggle
const downloadButton = jQuery('#downloadWorkshopItemButton');
const existingItemPanel = jQuery('#downloadWorkshopItemIframe');
if (existingItemPanel.length) {
existingItemPanel.remove();
downloadButton.find('img').first().css('transform', '');
return;
}

// Button was pressed, invert its icon, then insert the iframe.
downloadButton.find('img').first().css('transform', 'rotate(180deg)');

getIframeAnchor().after(`<iframe
            allowtransparency='true'
            onload="window.parent.postMessage(['steamdownloaderFrameLoaded', true], '*')"
            style="height: 0; margin: 0; padding: 0; border: 0; width: 100%;"
            scrolling="no"
            id="downloadWorkshopItemIframe"
            src="//steamworkshopdownloader.io/extension/embedded/${new URLSearchParams(window.location.search).get('id')}"/>`);
}

/**
 * Add window events.
 */
function addWindowEvents() {
/**
 * The plugin loads an iframe with the download site on it.
 * We are able to make the iframe access its outside frame using messages.
 * We use this functionality to push the scroll height to the parent window, resize the iframe to fit its content using a script and to close the iframe.
 */
window.addEventListener('message', function (e) {
const frame = jQuery("#downloadWorkshopItemIframe");
const button = jQuery('#downloadWorkshopItemButton');

//
const eventName = e.data[0];
const data = e.data[1];

switch (eventName) {
case 'steamdownloaderButtonPressed':
  onDownloadWorkshopItem();
  break;
case 'steamdownloaderFrameLoaded':
  getIframeAnchor().css("margin-bottom", "8px");
  break;
case 'steamdownloaderResizeIframe':
  frame.css('height', `${data}px`);
  break;
case 'steamdownloaderScrollToFrame':
  jQuery([document.documentElement, document.body]).animate({
    scrollTop: frame.offset().top - 100
  }, 100);
  break;
case 'steamdownloaderClose':
  button.trigger('click');
  break;
}
}, false);
}

/**
 * Add a download button into the page on the specific anchor element.
 */
function addButton() {
const downloadButton = getPageType() === 'item' ?
  `<a id="downloadWorkshopItemButton" class="btn_darkblue_white_innerfade btn_medium" style="margin: 2px; float: right;" onclick="window.parent.postMessage(['steamdownloaderButtonPressed', true], '*')"> 
        <img style="position: absolute; margin-left: 6px; margin-top: 6px;" width="16px" height="16px" src="${arrow}"/> 
        <span style="padding-left: 32px; padding-right: 32px;"> 
            Download 
        </span> 
    </a>` : `<a id="downloadWorkshopItemButton" class="btn_darkblue_white_innerfade btn_medium" style="height: 26px; float: right;" onclick="window.parent.postMessage(['steamdownloaderButtonPressed', true], '*')"> 
        <img style="position: absolute; margin-left: 6px; margin-top: 4px;" width="14px" height="14px" src="${arrow}"/> 
        <span style="padding-left: 32px; padding-right: 32px; line-height: 22px;"> 
            Download all
        </span> 
    </a>`;

if (getPageType() === 'item') {
getButtonAnchor().css('float', 'right');
}

getButtonAnchor().after(downloadButton);
}

(() => {
const load = () => {
// Only neccesary when ran as a userscript: keep retrying until jQuery is available from the page headers.
if(typeof jQuery === 'undefined') {
setTimeout(load, 50);
}

if (getPageType() == null) {
return;
}

addWindowEvents();
addButton();
};

load();
})();
