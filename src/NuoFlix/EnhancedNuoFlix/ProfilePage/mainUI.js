let enhancedUiContainer = `<div id="enhancedUi" class="container-fluid">
    <div id="enhancedUiHeadlineHolder" class="rowHeadlineHolder">
      <div class="rowHeadlineBreakerLeft breakerHeight">&nbsp;</div>
      <div class="rowHeadlineHolderItem headerTxt">
        <h2 id="pluginHeadline"></h2>
      </div>
      <div class="rowHeadlineBreakerRight breakerHeight">&nbsp;</div>
    </div>  
    <div class="row card-group">
    
      <fieldset class="card col-4">
        <legend id="ignoredLabel"></legend>
        <select id="ignoredUsers" name="ignoredUsers" size="5"></select>
        <div class="row">
          <div class="col-auto">
            <a id="addIgnoreUser" class="btn btn-small"></a>
          </div>
          <div class="col-1" style="flex-grow: 1;"></div>
          <div class="col-auto">
            <a id="deleteIgnoreUser" class="btn btn-small disabled"></a>
          </div>
        </div>
      </fieldset>
      
      <fieldset class="card col">
        <legend id="filterLabel"></legend>
        <div class="row">
          <label id="searchInputLabel" class="col-auto" for="filterByText" style="margin-right: 2rem;"></label>
          <input id="filterByText" type="text" name="filterByText" class="col" />
        </div>
        <details id="moreFilter">
          <summary id="moreFilterTrigger"></summary>
          <div class="clearfix"></div>
          <ul id="moreFilterMenu" style="list-style-type: none;">
            <li>
              <div class="flipflop col-12" style="--color-on: #e86344;margin-top: 1rem;">
                <span id="useAndLogicLabel" class="col-5"></span>
                <label><input id="filterAllWords" type="checkbox" checked="checked" /><span></span></label>
              </div> 
            </li>
            <li>
              <div class="flipflop col-12" style="--color-on: #e86344;margin-top: 1rem;">
                <span id="filterOnlyNewLabel" class="col-5"></span>
                <label><input id="filterOnlyNew" type="checkbox" /><span></span></label>
              </div> 
            </li>
            <li class="row" style="margin-top: 1rem;">
              <label id="searchByUserLabel" class="col-5" for="filterByUser"></label>
              <div class="col">
                <input id="filterByUser" list="availableUsers" type="text" name="filterByUser" />
              </div>
            </li>
            <li class="row">
              <label id="searchByDateLabel" class="row col-5" for="filterByDateFrom"></label>
              <div class="col" style="justify-content: space-between;display: flex;padding-inline-end: .4rem;">
                <input id="filterByDateFrom" type="date" name="filterByDateFrom" />
                <label for="filterByDateTo" style="padding-block: .75rem;">-</label>
                <input id="filterByDateTo" type="date" name="filterByDateTo" />
              </div>
            </li>   
          </ul>
        </details>
      </fieldset>
      
    </div>
    
    <div class="row card-group">
      <fieldset id="settingsContainer" class="card col-5">
        <legend id="settingsLabel"></legend>
        <div id="settingsLanguage" class="row">
          <label id="settingsLanguageLabel" class="col-5"></label>
        </div>
      </fieldset>
    </div>
  </div>`.parseHTML();
