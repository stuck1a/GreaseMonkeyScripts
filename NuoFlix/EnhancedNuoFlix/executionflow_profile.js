
commentFilters = new Map([
  // currently supported types for property "value" are: boolean, string, array
  [ 'filterOnlyNew', { active: false, value: false } ],
  [ 'filterOnlyUser', { active: false, value: [] } ],    // OR logic
  [ 'filterSkipUser', { active: false, value: [] } ],    // OR logic
  [ 'filterTextSearch', { active: false, value: [] } ],  // AND logic (search input is split into single words)
]);

const menuBaseHtml = `
    <div id="enhancedUi" class="container-fluid">
      <div id="enhancedUiHeadlineHolder" class="rowHeadlineHolder">
        <div class="rowHeadlineBreakerLeft breakerHeight">&nbsp;</div>
        <div class="rowHeadlineHolderItem headerTxt">
          <h2 id="pluginHeadline">${t('NuoFlix 2.0')}</h2>
        </div>
        <div class="rowHeadlineBreakerRight breakerHeight">&nbsp;</div>
      </div>
      <div class="row card-group">
        <div class="card">
          <span id="ignoredLabel">${t('Blockierte Benutzer')}:</span>
          <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
          <div class="row">
            <div class="col-auto">
              <a id="addIgnoreUser" class="btn btn-small">${t('Hinzufügen...')}</a>
            </div>
            <div style="flex-grow: 1;" class="col-1"></div>
            <div class="col-auto">
              <a id="deleteIgnoreUser" class="btn btn-small">${t('Entfernen')}</a>
            </div>
          </div>
        </div>
        <div class="card">
          <a id="btnFilterNew" class="btn">${t('Nur neue Kommentare')}</a>
        </div>
      </div>
    </div>
  `;

document.body.appendChild(globalStyles.parseHTML());

// add the new UI and store its reference
addCommentMenuToPage(menuBaseHtml.parseHTML());
enhancedUiContainer = document.getElementById('enhancedUi');

// hide the original comment container
originalCommentContainer = document.getElementsByClassName('profilContentInner')[0];
// if not found probably not logged in (anymore), so lets stop here
if (!originalCommentContainer) log(t('DOM-Element nicht gefunden. Nicht eingeloggt? Falls doch, hat sich der DOM verändert.'), 'fatal');

originalCommentContainer.id = 'originalCommentContainer';
originalCommentContainer.classList.add('hidden');

// get stored comment data (to identify new comments) and update storage with the new comment data
storedData = get_value('commentData');
commentData = generateCommentObject();
totalComments = commentData.length;
DEBUG_setSomeFakeData();
set_value('commentData', commentData);

// add custom comment container
customCommentContainer = '<div class="profilContentInner"></div>'.parseHTML();
originalCommentContainer.parentElement.insertBefore(customCommentContainer, originalCommentContainer);

// restore list of ignored users
const storedIgnoreList = get_value('ignoredUsers');
for (const user of storedIgnoreList) {
  document.getElementById('ignoredUsers').appendChild(`<option>${user}</option>`.parseHTML());
  const ignoreFilter = commentFilters.get('filterSkipUser');
  ignoreFilter.value.push(user);
  ignoreFilter.active = true;
}

// mount handlers for ignore user feature
document.getElementById('addIgnoreUser').addEventListener('click', function() {
  const user = prompt(t('Folgenden Benutzer zur Ignorieren-Liste hinzufügen:')).trim();
  if (user === null || user === '') return;
  const selectElement = document.getElementById('ignoredUsers');
  for (const option of selectElement.children) {
    if (option.innerText === user) return;
  }
  const option = `<option>${user}</option>`.parseHTML();
  document.getElementById('ignoredUsers').appendChild(option);
  // update filter
  const ignoreFilter = commentFilters.get('filterSkipUser');
  ignoreFilter.value.push(user);
  ignoreFilter.active = true;
  // update storage
  set_value('ignoredUsers', ignoreFilter.value);
  updatePage();
});
document.getElementById('deleteIgnoreUser').addEventListener('click', function() {
  const selectElement = document.getElementById('ignoredUsers');
  if (selectElement.selectedOptions.length > 0) {
    const user = selectElement.selectedOptions[0].innerText.trim();
    selectElement.selectedOptions[0].remove();
    const ignoreFilter = commentFilters.get('filterSkipUser');
    // update filter
    const oldIgnoreList = ignoreFilter.value;
    ignoreFilter.value = [];
    for (const entry of oldIgnoreList) {
      if (entry !== user) ignoreFilter.value.push(entry);
    }
    if (ignoreFilter.value.length === 0) ignoreFilter.active = false;
    // update storage
    set_value('ignoredUsers', ignoreFilter.value);
    updatePage();
  }
});

// add fancy switch to turn off all features and restore the original elements instead
enhancedUiContainer.parentElement.insertBefore(mainSwitchHtml.parseHTML(), enhancedUiContainer);
document.getElementById('mainSwitch').addEventListener('change', doChangeMainSwitch);

// mount handler for "new only" filter button
document.getElementById('btnFilterNew').addEventListener('click', function() {
  changeFilter('filterOnlyNew', !commentFilters.get('filterOnlyNew').value);
  if (commentFilters.get('filterOnlyNew').active) {
    // this will change the cross to a hook in the filter button
    this.classList.add('filterIsActive');
    // no need to highlight new comments if we filter all not new
    document.getElementById('style_newComment').innerText = '';
  } else {
    this.classList.remove('filterIsActive');
    document.getElementById('style_newComment').innerText = `.newComment { background-color: ${highlightedCommentsColor} }`;
  }
});

updatePage();
insertLanguageDropdown();

// mount handler for selecting another length value
document.getElementById('pageLengthSelect').addEventListener('change', doChangeLength);
