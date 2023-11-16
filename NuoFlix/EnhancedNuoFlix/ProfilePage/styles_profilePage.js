globalStyles = `<style>

:root {
  --svg-checked: url('data:image/svg+xml;utf8,<svg height="1em" width="1em" fill="%2332CD32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>');
  --svg-unchecked: url('data:image/svg+xml;utf8,<svg height="1em" width="1em" fill="%23FF0000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>');
}

.container-fluid, .container-fluid *, .container-fluid *::before, .container-fluid *::after { box-sizing: border-box }
.container-fluid { box-sizing: border-box; width: 100%; margin-inline: auto; padding: 0 }

.row { display: flex; flex-wrap: wrap }
.row > * { flex-shrink: 0; max-width: 100%; width: 100% }

.col-auto,.col-1,.col-2,.col-3,.col-4,.col-5,.col-6,.col-7,.col-8,.col-9,.col-10,.col-11,.col-12 { flex: 0 0 auto }
.col-auto { width: auto }
.col { flex: 1 0 0 }
.col-1 { width: 8.33333333% }
.col-2 { width: 16.66666667% }
.col-3 { width: 25% }
.col-4 { width: 33.33333333% }
.col-5 { width: 41.66666667% }
.col-6 { width: 50% }
.col-7 { width: 58.33333333% }
.col-8 { width: 66.66666667% }
.col-9 { width: 75% }
.col-10 { width: 83.33333333% }
.col-11 { width: 91.66666667% }
.col-12 { width: 100% }

.hidden { display: none !important }

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  word-wrap: break-word;
  background-clip: border-box;
  border: 1px solid #949296;
  border-radius: 0.25rem;
  max-width: 30rem;
  padding: 0.75rem;
  width: 30%;
}

.card-body { flex: 1 1 auto; padding: 1rem 1rem }
.card-group { margin-block: 1rem; }
.card-group > .card { margin-bottom: 1rem; }
.card-group > .card ~ .card {
  margin-left: 1rem;
}

#ignoredUsers {
  width: 100%;
}

#paginationContainer .btn.disabled {
  background-color: darkgray !important;
  color: lightgray !important;
  cursor: default !important;
}

#paginationContainer .btn:not(.disabled):hover {
  font-weight: bold;
  background-color: #bd8656;
}

#paginationContainer, #paginationContainerBottom {
  text-align: center;
  margin-block: 0.8rem;
}

.buttonGroup {
  display: inline-block;
}

#paginationNext {
  margin-inline: 0 !important;
  padding-inline: 2rem;
  border-radius: 10% 25% 25% 10%;
}

#paginationLast {
  border-radius: 20% 50% 50% 20%;
  padding-inline: 1rem;
  padding-block: 0 !important;
  margin-inline-start: 0 !important;
}

#paginationBack {
  margin-inline: 0 !important;
  padding-inline: 2rem;
  border-radius: 25% 10% 10% 25%;
}

#paginationFirst {
  border-radius: 50% 20% 20% 50%;
  padding-inline: 1rem;
  padding-block: 0 !important;
  margin-inline-start: 0 !important;
}

.pageNrBtn {
  padding-inline: max(1.0vw, 10px);
  margin-inline: 0.25rem !important;
}

.pageNrBtn.activePage {
  cursor: default !important;
  font-weight: bold !important;
  background-color: #c86852 !important;
}

#paginationControl {
  display: flow-root;
}

#commentsFromToContainer {
  float: left;
}

#commentsPerPageContainer {
  float: right;
  display: flex;
}

#commentsPerPageContainer small {
  align-self: center;
  white-space: pre;
  margin-inline-end: 0.75rem;
}

#commentsPerPageContainer .select {
  background-color: #eee;
  margin-block: auto;
  padding: 0.4rem;
  font-size: 0.75rem;
  text-align: center;
  text-align-last: center;
}

#btnFilterNew:after {
  content: "\\00a0\\00a0\\00a0" var(--svg-unchecked);
  vertical-align: -10%;
}

#btnFilterNew.filterIsActive:after {
  content: "\\00a0\\00a0\\00a0" var(--svg-checked);
}

.btn-small {
  font-size: 0.75rem;
  padding: 0.2rem 0.75rem;
}

.msgNoResults {
  margin-block: 2rem;
  text-align: center;
  font-style: italic;
}

.repliesCollapsed .replyContainer:nth-last-child(n+4) {
  display: none;
}

.expander {
  cursor: pointer;
  color: #d53d16;
}

.expander:hover {
  font-weight: bold;
}

#language_container {
  --borderColor: #555555;
  --borderWidth: 1px;
  --totalWidth: 8rem;
  width: var(--totalWidth);
  height: 2rem;
  margin-left: auto;
  color: #d53d16;
  cursor: pointer;
  border: var(--borderWidth) solid var(--borderColor);
  border-top-left-radius: 1px;
  border-bottom: 0;
}

#language_container:hover > #language_dropdown_toggler > span:last-of-type  {
  transform: rotate(90deg);
}

#language_dropdown_toggler {
  position: absolute;
  height: inherit;
  width: inherit;
  background: linear-gradient(to left, var(--borderColor) var(--borderWidth), #d53d16 var(--borderWidth), #d53d16 1.75rem, #fcfcfc 1.75rem);
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: 1px;
  border-bottom: var(--borderWidth) solid var(--borderColor);
}

#language_dropdown_toggler:hover + #language_dropdown_menu,
#language_dropdown_menu:hover {
  display: block;
}

#language_dropdown_toggler > span {
  width: calc(100% - 1.75rem);
  display: flex;
  height: inherit;
  padding-left: 0.4rem;
  align-items: center;
}

#activeLanguage {
  border: var(--borderWidth) solid var(--borderColor);
  border-bottom-width: 0;
}

#language_dropdown_toggler > span:last-of-type {
  border-radius: 1px 1px 0 0;
  width: 1.5rem;
  text-align: center;
  color: #fcfcfc;
  transition: transform .15s ease-in-out;
  position: relative;
  padding-left: calc(2*var(--borderWidth));
  justify-content: center;
}

#language_dropdown_menu {
  position: relative;
  top: 100%;
  border-radius: 0 0 1px 1px;
  border: var(--borderWidth) solid var(--borderColor);
  left: calc(0px - var(--borderWidth));
  max-width: unset;
  width: calc(100% + 3*var(--borderWidth));
  display: none;
}

#language_dropdown_menu > div {
  background-color: #252525;
  font-weight: bold;
  padding-left: 0.4rem;
  padding-block: 0.2rem;
  display: flex;
  align-items: center;
  padding-top: 0.2rem;
  border-top: var(--borderWidth) solid var(--borderColor);
}

#language_dropdown_menu > div:hover {
  background-color: #f0cbc2;
}

#language_dropdown_menu svg {
  margin-right: 0.6rem;
  height: 1rem;
  width: 2rem;
}

#moreFilterTrigger:hover {
  font-weight: bold;
}

#moreFilterMenu {
  margin-inline-start: 1rem;
}

.card legend {
  padding-inline: .5rem;
  text-align: center;
}

#enhancedUi label {
  padding-block: .75rem;
}

input[type="date"] {
    display: inline-block;
    margin: 7px 0px 15px 0px;
    padding: 10px;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
}
</style>



<style id="style_newComment">
  .${cssClassNewComments} {
    background-color: ${highlightedCommentsColor};
  }
</style>


<style id="style_hasNewReply">
  .${cssClassHasNewReplies} {
    background-color: ${highlightedHasNewRepliesColor};
  }
</style>


<style id="style_newReply">
  .${cssClassNewReplies} {
    background-color: ${highlightedRepliesColor};
  }
</style>
`;
