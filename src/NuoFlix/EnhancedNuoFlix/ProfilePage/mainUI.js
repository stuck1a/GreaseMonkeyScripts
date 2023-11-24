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
          <label class="row col-2" for="filterByText" style="display: flex; flex-wrap: nowrap;">
              <span id="searchInputLabel"></span>
              <span id="revertFilterTextInput" class="forceHidden clickable" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
                <svg class="svgColorized spinLeftOnHover stretchToParent" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000">
                  <path class="svgColoredStroke" fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/>
                  <path class="svgColoredFill" fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/>
                </svg>
              </span>
          </label>
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
              <label class="row col-5" for="filterByUser" style="display: flex; flex-wrap: nowrap;">
                <span id="searchByUserLabel"></span>
                <span id="revertFilterUserInput" class="forceHidden clickable" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
                  <svg class="svgColorized spinLeftOnHover stretchToParent" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000">
                    <path class="svgColoredStroke" fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/>
                    <path class="svgColoredFill" fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/>
                  </svg>
                </span>
              </label>
              <div class="col">
                <input id="filterByUser" list="availableUsers" type="text" name="filterByUser" />
              </div>
              <div id="filteredUserList" class="row"></div>
            </li>
            <li class="row">
              <label class="row col-5" for="filterByDateFrom" style="display: flex; flex-wrap: nowrap;">
                <span id="searchByDateLabel"></span>
                <span id="revertDateRangeInputs" class="forceHidden clickable" style="width: 1.3rem;height: 1.3rem;position: relative;right: 2.5rem;">
                  <svg class="svgColorized spinLeftOnHover stretchToParent" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 867 1000">
                    <path class="svgColoredStroke" fill="none" stroke="black" stroke-width="130" d="M66,566c0,198,165,369,362,369,186,0,372-146,372-369,0-205-161-366-372-366"/>
                    <path class="svgColoredFill" fill="black" d="M 146,200 L 492,0 L 492,400 L 146,200"/>
                  </svg>
                </span>
              </label>
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
    
      <fieldset id="playlistContainer" class="card col-6">
        <legend id="playlistLabel"></legend>
        <div class="row">
          <div class="col-auto"><a id="createPlaylist" class="btn btn-small playlistButton"></a></div>
          <div class="col-auto"><a id="startPlaylist" class="btn btn-small playlistButton "></a></div>
          <div class="col-auto"><a id="editPlaylist" class="btn btn-small playlistButton disabled"></a></div>
          <div class="col-auto"><a id="deletePlaylist" class="btn btn-small playlistButton disabled"></a></div>       
        </div>
      </fieldset>
    
      <fieldset id="settingsContainer" class="card col">
        <legend id="settingsLabel"></legend>
        <div id="settingsLanguage" class="row">
          <label id="settingsLanguageLabel" class="col-5"></label>
        </div>
      </fieldset>

    </div>
  </div>`.parseHTML();
