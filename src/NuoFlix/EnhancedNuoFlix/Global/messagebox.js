/*
 * Snippet for creating notification messages for example after user actions and such
 */

/**
 * Creates and shows a fixed notification message.
 * 
 * @param {string} [type='info']  - Notification type - decides on the messagebox appearance<br>
 *                         Possible values are:<ul><li>info</li><li>success</li><li>warn</li><li>error</li></ul>
 * @param {string} [message='']  - Notification text (clipped, if too long)
 * @param {number} [duration=3000]  - Duration in milliseconds before fading out the message
 */
function messagebox(type = 'info', message = '', duration = 3000) {
  // build message box
  const messagebox = `
    <div class="messagebox messagebox_${type}">
      <h5 class="messageboxHeadline">${t(type).toUpperCase()}!</h5>
      <pre class="messageboxText">${message}</pre>
      <div class="messageboxBar"></div>
      <style>
        .messagebox {
          --width: min(20rem, 70%);
          --height: 6rem;
          position: fixed;
          max-height: var(--height);
          width: var(--width);
          border: 1px solid var(--theme-color);
          border-radius: 5px;
          top: calc(80% - var(--height));
          left: calc(50% - var(--width)/2);
          z-index: 9999999;
        }
        .messageboxHeadline {
          margin: .75rem 1rem 0 1rem;
        }
        .messageboxText {
          -ms-text-overflow: ellipsis;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          -ms-overflow-x: hidden;
          -ms-overflow-y: hidden;
          overflow: hidden;
          height: 2.5rem;
          width: calc(100% - 2rem);
          font-size: .75rem;
          margin: 0 1rem .75rem 1rem;
        }
        .messageboxBar {
          position: relative;
          left: 0;
          bottom: 0;
          height: 2px;
          background-color: var(--theme-color);
          width: 100%;
        }
        .messagebox_info { color: #fff; background-color: #a7a0a0; }      
        .messagebox_success { color: #fff; background-color: #21b227; }  
        .messagebox_warn { color: #fff; background-color: #aa7202; }    
        .messagebox_error { color: #fff; background-color: #83291e; }    
      </style>
    </div>
  `.parseHTML(false).firstElementChild;
  
  // add message box to DOM
  document.body.appendChild(messagebox);
  
  //  fade-out effect
  const fadeOutSteps = 10;
  const updateInterval = 50;
  setTimeout(function() {
    const fadeEffect = setInterval(function () {
      if (!messagebox.style.opacity) messagebox.style.opacity = '1';
      if (parseFloat(messagebox.style.opacity) > 0) {
        messagebox.style.opacity = (messagebox.style.opacity - (1/fadeOutSteps)) + '';
      } else {
        clearInterval(fadeEffect);
        messagebox.remove();
      }
    }, updateInterval);
  }, duration);
  
  // reduction of the progress bar
  const totalTime = duration - 2 * updateInterval;  // reduce for last 2 steps (under 20% opacity its almost invisible already)
  const totalWidth = messagebox.clientWidth;
  const progressBar = messagebox.getElementsByClassName('messageboxBar')[0];
  let passedTime = 0;
  const progressBarAdjuster = setInterval(function() {
    passedTime += updateInterval;
    let newWidth = totalWidth - (passedTime * totalWidth / totalTime);
    if (newWidth < 0) {
      newWidth = 0;
      clearInterval(progressBarAdjuster);
    }
    this.style.width = newWidth + 'px';
  }.bind(progressBar), updateInterval);
  
}

