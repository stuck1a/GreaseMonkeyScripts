// ==UserScript==
// @name         NuoFlix comment filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a section to the NuoFlix header which allows to remove comments of a specific user
// @author       stuck1a
// @match        https://nuoflix.de/*
// @run-at       document-end
// @icon         https://icons.duckduckgo.com/ip2/nuoflix.de.ico
// @grant        none
// ==/UserScript==

function removeCommentsFrom(username) {
  var allComments = document.querySelectorAll('.profilName');
  for (let i = allComments.length - 1; i >= 0; i--) {
    const comment = allComments[i];
    if (comment.firstElementChild && comment.firstElementChild.innerText === username) {
      if (comment.id.startsWith('comment_')) {
        // Sub level comments
        if (comment.previousElementSibling) comment.previousElementSibling.remove();
        comment.remove();
      } else {
        // Root level comments
        if (comment.childNodes[3]) comment.childNodes[3].remove();
        if (comment.childNodes[2]) comment.childNodes[2].remove();
        if (comment.childNodes[1]) comment.childNodes[1].remove();
        if (comment.childNodes[0]) comment.childNodes[0].remove();
        if (comment.previousElementSibling) comment.previousElementSibling.remove();
        let maybeMargin = comment.childNodes[1];
        if (maybeMargin && maybeMargin.nextElementSibling.classList.contains('allReplys')) maybeMargin.remove();
      }
    }
  }
}

function buildFilterSection() {
  var container = document.createElement('div');
  var label = document.createElement('label');
  var input = document.createElement('input');
  var button = document.createElement('input');
  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(button);
  input.id = 's1a_input';
  input.placeholder = 'Username eingeben...';
  label.innerText = 'Entferne Kommentare von:';
  label.style.color = 'orange';
  label.setAttribute('for', input.id);
  label.style.display = 'block';
  button.value = 'OK';
  button.type = 'button';
  button.style.fontWeight = 'bold';
  button.onclick = () => {
    if (input.value) {
      removeCommentsFrom(input.value);
      alert('Alle Kommentare von \n\'' + input.value + '\'\nwurden entfernt.');
      input.value = '';
    }
  };
  return container;
}

function appendForm(targetElement) {
  var form = buildFilterSection();
  form.classList.add('navItem');
  form.classList.add('left');
  targetElement.appendChild(form);
}

var desktop = document.getElementsByClassName('navHolder');
var mobile = document.getElementsByClassName('navHolderMobil');
if (desktop && desktop[0]) appendForm(desktop[0]);
if (mobile && mobile[0]) appendForm(mobile[0]);
