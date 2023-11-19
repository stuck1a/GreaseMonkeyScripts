
// set up route-scoped fields and start the execution flow fo this route
const maxRetries = 3;
const delay = 1000;
let retries = 0;
let storedIgnoreList;
let comments;
execute_genericPage()




/**
 * Main function of this route
 */
function execute_genericPage() {
  if (document.getElementById('commentContent')) {
    // load list of ignored users and try to apply them
    storedIgnoreList = get_value('ignoredUsers');
    comments = document.getElementById('commentContent');
    tryToApply();
  }
}




/**
 * Calls removeCommentsFrom after a delay as long as the maximal retry count is not reached yet.
 */
function tryToApply() {
  setTimeout(function() {
    if (comments.childElementCount > 0) {
      for (const user of storedIgnoreList) removeCommentsFrom(user);
    } else {
      // retry it up to 3 times after waiting one second after each try
      if (retries < maxRetries - 1) {
        retries++;
        tryToApply();
      }
    }
  }, delay);
}




/**
 * Deletes all comments and replies of a given user
 * 
 * @param username
 */
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
