/** @global */ const editPlaylistDialog = `
  <div id="editPlaylistDialog">
    <div id="playlistNameWrapper" class="row">
      <span id="playlistName">${playlist.name}</span>
      <span id="changePlaylistName" data-playlist-id="${playlist.id}">EDIT</span>
    </div>   
    <ul id="videoList"></ul>
    <div><a id="playlistDialogConfirmBtn" class="btn btn-small" data-playlist-id="${playlist.id}">${t('Bestätigen')}</a></div>
    <div> <a id="playlistDialogCancelBtn" class="btn btn-small">${t('Abbrechen')}</a></div>
  </div>
  
  <style>
    #editPlaylistDialog {
      position: fixed;
      width: min(30%, max(80%, 20rem));   /* Target: 20rem, but min 10vw and max 80vw */
      height: min(30%, max(60%, 20rem));
      background-color: #252525;
      border-radius: 5px;
      border: 1px solid var(--theme-color);
      top: 30%;    /* TODO: Replace with calculated value */
      left: 35%;    /* TODO: Replace with calculated value */
    }
    #playlistNameWrapper {
      display: flex;
      justify-content: space-between;
    }
    #playlistName {
      width: 85%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow-y: hidden;
    }
    #changePlaylistName {
      width: 1.5rem;
    }
    .videoListEntry {
    
    }
    .videoListEntry_NameRow {
      display: flex;
      flex-wrap: nowrap;
    }
    .videoListEntry_id {
      width: 20%;
    }
    .videoListEntry_name {
      width: 70%;
    }
    .videoListEntry_delete {
      width: 10%;
    }
    .videoListEntry_desc {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  </style>
`.parseHTML();
