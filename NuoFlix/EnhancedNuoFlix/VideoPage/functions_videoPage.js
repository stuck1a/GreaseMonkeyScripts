/**
 * Holds the whole execution flow for any other than the profile page.
 * Since NuoFlix uses pretty links cms, we have to try if we are on
 * a page with a comment section. If a comment section is found,
 * the blocked user filter will be applied on it.
 */
function execute_genericPage() {
  if (document.getElementById('commentContent')) {
    // function to delete comments and replies of a given user
    const removeCommentsFrom = function(username) {
      const allComments = document.querySelectorAll('.profilName');
      for (let i = allComments.length - 1; i >= 0; i--) {
        const comment = allComments[i];
        if (comment.firstElementChild && comment.firstElementChild.innerText === username) {
          if (comment.id.startsWith('comment_')) {
            // also remove spacer if its a reply
            if (comment.previousElementSibling) comment.previousElementSibling.remove();
          }
          if (comment.parentElement.classList.contains('commentItem')) {
            comment.parentElement.remove();
          } else {
            comment.remove();
          }
        }
      }
    }
    // we need some delay for the comments to load
    function tryToApply() {
      setTimeout(function() {
        if (comments.childElementCount > 0) {
          for (const user of storedIgnoreList) removeCommentsFrom(user);
        } else {
          // retry it up to 3 times after waiting one second after each try
          if (retries < 2) {
            retries++;
            tryToApply();
          }
        }
      }, 1000);
    }
    // load list of ignored users and try to apply them
    const storedIgnoreList = get_value('ignoredUsers');
    const comments = document.getElementById('commentContent');
    let retries = 0;
    tryToApply();
  }
}
