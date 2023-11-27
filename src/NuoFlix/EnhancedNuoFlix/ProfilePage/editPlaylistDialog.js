/** @global */ const editPlaylistDialog = `
  <div id="playlistDialog_middleLayer"></div>
  <div id="editPlaylistDialog">
    <div id="playlistNameWrapper" class="row">
      <input id="playlistName" class="col" type="text" maxlength="100" value="${playlist.name}" readonly="readonly" />
      <span id="changePlaylistName" class="col-auto" data-playlist-id="${playlist.id}">EDIT</span>
    </div>   
    <ul id="videoList"></ul>
    <div id="playlistDialogButtons" class="row">
      <a id="playlistDialogConfirmBtn" class="btn btn-small col-auto" data-playlist-id="${playlist.id}">${t('Bestätigen')}</a>
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
    
    .videoListEntry {
    
    }
    
    .videoListEntry_NameRow {
      display: flex;
      flex-wrap: nowrap;
    }
    
    .videoListEntry_id {
      padding-right: 2rem;
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
    }
  </style>
`.parseHTML();
