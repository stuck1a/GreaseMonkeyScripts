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
        <legend>Kommentare filtern</legend>
        <div class="row">
          <label class="col-auto" style="margin-right: 2rem;">Suchtext:</label>
          <input id="filterUser" type="text" name="filterUser" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger" style="text-align: right;">Erweiterte Filteroption</summary>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <label>Muss alle Wörter enthalten</label>
              <input type="checkbox" />
            </li>
            <li class="row">
              <label class="col-4">nach Benutzer:</label>
              <div class="col">
                <input id="filterUser" type="text" name="filterUser" />
              </div>
            </li>
            <li class="row">
              <label class="row col-4">nach Datum:</label>
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



/*
TRANSLATIONS TODO

Kommentare filtern
Suchtext:
Erweiterte Filteroption
Muss alle Wörter enthalten              
nach Datum:
nach Benutzer:

 */
