/*
 * Snippet for creating notification messages for example after user actions and such
 */

/**
 * Creates and shows a fixed notification message.
 * 
 * @param {string} [type='info']  - Notification type - decides on the messagebox appearance<br>
 *                         Possible values are:<ul><li>info</li><li>erfolg</li><li>warnung</li><li>fehler</li></ul>
 * @param {string} [message='']  - Notification text (clipped, if too long)
 * @param {number} [duration=3000]  - Duration in milliseconds before fading out the message
 */
function messagebox(type = 'info', message = '', duration = 3000) {
  // build message box
  const messagebox = `
    <div class="messagebox messagebox_${type}">
      <h4>${t(type).toUpperCase()}!</h4>
      <pre class="messageboxText">${message}</pre>
      <style>
        .messagebox {
          --width: min(20rem, 70%);
          --height: min(5rem, 40%);
          padding: 1rem;
          position: fixed;
          max-height: var(--height);
          width: var(--width);
          top: calc(80% - var(--height));
          left: calc(50% - var(--width)/2);
          z-index: 9999999;
        }
        .messageboxText {
          -ms-text-overflow: ellipsis;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          -ms-overflow-x: hidden;
          -ms-overflow-y: hidden;
          overflow: hidden;
          height: 3rem;
          width: 100%;
        }
        .messagebox_info { color: #fff; background-color: #a7a0a0; }      
        .messagebox_erfolg { color: #fff; background-color: #21b227; }  
        .messagebox_warnung { color: #fff; background-color: #aa7202; }    
        .messagebox_fehler { color: #fff; background-color: #83291e; }    
      </style>
    </div>
  `.parseHTML(false).firstElementChild;
  
  // add message box to DOM
  document.body.appendChild(messagebox);
  
  // set the fade-out effect
  setTimeout(function() {
    const fadeEffect = setInterval(function () {
      if (!messagebox.style.opacity) messagebox.style.opacity = 1;
      if (messagebox.style.opacity > 0) {
        messagebox.style.opacity -= 0.1;
      } else {
        clearInterval(fadeEffect);
        messagebox.remove();
      }
    }, 50);
  }, duration);
}

