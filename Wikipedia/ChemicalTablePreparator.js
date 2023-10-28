// ==UserScript==
// @name         Wikipedia Chemical Datatable Snapshot Preparator
// @description  Prepares wikipedia data tables for chemicals for snapshot them by removing things like [x] and remove hyperlink colors
// @version      1.0
// @match        https://de.wikipedia.org
// @icon         https://icons.duckduckgo.com/ip2/wikipedia.org.ico
// @grant        none
// ==/UserScript==

(function() {
'use strict';

window.addEventListener('load', function() {
var style = document.createElement('style');
style.innerHTML = `
      .preparedTable * {
        color: #000000 !important;
        border-bottom: none !important;
        background-image: none !important;
      }
      .preparedTable *:before, .preparedTable *:after {
        content: '' !important;
      }
      `;
document.head.appendChild(style);

var DataTable = document.getElementById('Vorlage_Infobox_Chemikalie');
DataTable.classList.add('preparedTable');
DataTable.innerHTML = DataTable.innerHTML.replaceAll(/\[\d\]/g, '');

for (const button of DataTable.getElementsByTagName('button') ) {
button.remove();
}
});
})();
