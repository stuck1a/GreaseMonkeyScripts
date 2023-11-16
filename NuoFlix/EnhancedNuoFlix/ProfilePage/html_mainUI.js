var mainUI = `
  <div id="enhancedUi" class="container-fluid">
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
          <label id="searchInputLabel" class="col-auto" style="margin-right: 2rem;">${t('Suche')}&colon;</label>
          <input id="filterUser" type="text" name="filterUser" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger" style="text-align: right;">${t('Erweiterte Filteroptionen')}</summary>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <label id="useAndLogicLabel">${t('Muss alle Wörter enthalten')}</label>
              <input type="checkbox" />
            </li>
            <li class="row">
              <label id="searchByUserLabel" class="col-4">${t('nach Benutzer')}&colon;</label>
              <div class="col">
                <input id="filterUser" type="text" name="filterUser" />
              </div>
            </li>
            <li class="row">
              <label id="searchByDateLabel" class="row col-4">${t('nach Datum')}&colon;</label>
              <div class="col" style="justify-content: space-between;display: flex;padding-inline-end: 0.4rem;">
                <input id="filterUser" name="filterUser" type="date" />
                <label style="padding-block: .75rem;">-</label>
                <input id="filterUser" name="filterUser" type="date" />
              </div>
            </li>
            <li>
              <a id="btnFilterNew" class="btn">${t('Nur neue Kommentare')}</a>
            </li>   
          </ul>
        </details>
      </fieldset>
      
    </div>
    
    
  </div>
`.parseHTML();
