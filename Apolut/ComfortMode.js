// ==UserScript==
// @name         Comfort mode for apolut.net
// @namespace    https://apolut.net/
// @version      1.0
// @description  simulates trivial dark mode, removes unnecesary elements and scales video frames
// @author       stuck1a
// @match        https://apolut.net/*
// @icon         https://icons.duckduckgo.com/ip2/apolut.net.ico
// @grant        none
// ==/UserScript==

(function() {
'use strict';

var css = `
    html {
      font-size:   18px !important;
      line-height:  1   !important;
    }

    body, li, ol, p, ul, h1, h2, h3, h4,
    p.meta-loop,
    .navbar,
    .nav-button,
    .main-menu,
    .social-media-post-full a,
    #breadcrumbs .item-current,
    #videoandpodcast,
    #videoandpodcast .tab-pane,
    #archive-ken,
    #comments {
      background:  #222     !important;
      color:       #eeed    !important;
    }

    #videoandpodcast,
    #videoandpodcast * {
      width:       97vw     !important;
    }

    .navbar,
    #videoandpodcast .tab-pane,
    #single-post {
      padding:     0px      !important;
    }

    #single-post {
      margin-inline: 0.5%   !important;
    }

    header .navbar .navpoint,
    a.navbar-brand,
    .pulse-button {
      display:     none     !important;
    }

    #nav-icon3 span {
      background:  #eeed    !important;
    }

    header div.main-menu ul.nav {
      position:    absolute !important;
      top:         130px    !important;
    }

    #breadcrumbs .separator {
      color:       #ffc     !important;
    }
  `;

var style = document.createElement('style');
style.textContent = css;
document.body.appendChild(style);
})();
