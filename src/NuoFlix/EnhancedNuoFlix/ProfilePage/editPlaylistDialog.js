/** @global */ const editPlaylistDialog = `
  <div id="playlistDialog_middleLayer"></div>
  <div id="editPlaylistDialog">
    <div id="playlistNameWrapper" class="row">
      <input id="playlistName" class="col" type="text" maxlength="100" value="${playlist.name}" readonly="readonly">
      <span id="changePlaylistName" class="col-auto" data-playlist-id="${playlist.id}">
        <svg xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" class="svgColorized" viewBox="0 0 512 512">
          <path class="svgColoredFill" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
        </svg>
      </span>
    </div>   
    <ul id="videoList"></ul>
    <div id="playlistDialogButtons" class="row">
      <a id="playlistDialogConfirmBtn" class="btn btn-small col-auto disabled" data-playlist-id="${playlist.id}">${t('Bestätigen')}</a>
      <a id="playlistDialogCancelBtn" class="btn btn-small col-auto">${t('Abbrechen')}</a>
    </div>
  </div>
  
  <style>
    #playlistDialog_middleLayer {
      position: fixed;
      z-index: 999998;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: #0008;
    }
    
    #editPlaylistDialog {
      display: flex;
      flex-direction: column;
      position: fixed;
      width: min(max(30%, 14rem), max(80%, 20rem));   /* Target: 20rem, but min 30% (or at least 14rem) and max 80% */
      min-height: 14rem;
      max-height:  80%;
      background-color: #252525;
      border-radius: 5px;
      border: 2px solid var(--theme-color);
      z-index: 999999;
      /* top and left are calculated and set in the script (and updated in lazy resize handler) */
    }
    
    #playlistNameWrapper {
      display: flex;
      justify-content: space-between;
      padding: .75rem 1rem;
    }
    
    #playlistName {
      color: var(--theme-color);
      font-size: 1rem;
      font-weight: bold;
      margin: 0;
      background-color: inherit;
      cursor: default;
      text-overflow: ellipsis;
    }
    #changePlaylistName:hover .svgColoredFill {
      filter: brightness(2);
    }
    
    #changePlaylistName {
      margin: auto 0 auto 1rem;
      cursor: pointer;
    }
    
    #videoList {
      -ms-overflow-y: scroll;
      overflow-y: scroll;
      max-height: 80%;
      border: 1px solid #373434;
      margin: 0 .5rem .5rem .5rem;
      border-radius: 5px;
      padding: .3rem;
    }
    
    .videoListEntry_NameRow {
      display: flex;
      flex-wrap: nowrap
      cursor: default;
    }
    
    .videoListEntry_id {
      width: 3.75rem;
    }
    
    .videoListEntry_name {
      white-space: nowrap;
      text-overflow: ellipsis;
      -ms-overflow-x:  hidden;
      -ms-overflow-y:  hidden;
      overflow: hidden;
    }

    .videoListEntry_delete {
      margin-inline: 1rem;
    }
    
    .videoListEntry_delete:hover {
      color: red;
      cursor: pointer;
    }
    
    #playlistDialogButtons .btn {
      margin-inline: 1rem;
    }
    
    #playlistDialogButtons {
      justify-content: center;
      margin-block: auto .75rem;
    }
    
    #noVideosInfo {
      margin-inline: auto;
    }
  </style>
`.parseHTML();
