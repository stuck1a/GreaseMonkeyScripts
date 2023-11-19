let enhancedUiContainer = `<div id="enhancedUi" class="container-fluid">
    <div id="enhancedUiHeadlineHolder" class="rowHeadlineHolder">
      <div class="rowHeadlineBreakerLeft breakerHeight">&nbsp;</div>
      <div class="rowHeadlineHolderItem headerTxt">
        <h2 id="pluginHeadline">${t('NuoFlix 2.0')}</h2>
      </div>
      <div class="rowHeadlineBreakerRight breakerHeight">&nbsp;</div>
    </div>  
    <div class="row card-group">
    
      <fieldset class="card">
        <legend id="ignoredLabel">${t('Blockierte Benutzer')}:</legend>
        <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
        <div class="row">
          <div class="col-auto">
            <a id="addIgnoreUser" class="btn btn-small">${t('Hinzufügen...')}</a>
          </div>
          <div class="col-1" style="flex-grow: 1;"></div>
          <div class="col-auto">
            <a id="deleteIgnoreUser" class="btn btn-small">${t('Entfernen')}</a>
          </div>
        </div>
      </fieldset>
      
      <fieldset class="card col">
        <legend id="filterLabel">${t('Kommentare filtern')}</legend>
        <div class="row">
          <label id="searchInputLabel" class="col-auto" for="filterByText" style="margin-right: 2rem;">${t('Suche')}&colon;</label>
          <input id="filterByText" type="text" name="filterByText" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger" style="text-align: right;">${t('Erweiterte Filteroptionen')}</summary>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <div class="flipflop" style="--color-on: #e86344;">
                <span id="useAndLogicLabel">${t('Muss alle Wörter enthalten')}</span>
                <label><input id="filterNewOnly" type="checkbox" checked="checked" /><span></span></label>
              </div> 
            </li>
            <li class="row">
              <label id="searchByUserLabel" class="col-4" for="filterByUser">${t('nach Benutzer')}&colon;</label>
              <div class="col">
                <input id="filterByUser" type="text" name="filterByUser" />
              </div>
            </li>
            <li class="row">
              <label id="searchByDateLabel" class="row col-4" for="filterByDateFrom">${t('nach Datum')}&colon;</label>
              <div class="col" style="justify-content: space-between;display: flex;padding-inline-end: 0.4rem;">
                <input id="filterByDateFrom" name="filterByDateFrom" type="date" />
                <label style="padding-block: .75rem;" for="filterByDateTo">-</label>
                <input id="filterByDateTo" name="filterByDateTo" type="date" />
              </div>
            </li>
            <li>
              <a id="btnFilterNew" class="btn">${t('Nur neue Kommentare')}</a>
            </li>   
          </ul>
        </details>
      </fieldset>
      
    </div>
  </div>`.parseHTML();
