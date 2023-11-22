
/**
 * Generates and opens an element as pop-up.
 * 
 * @param {HTMLElement} element  - Element which contains the the modal content
 * @param {?string} [id=null]  - If set, the value will be used as modal element id and register id
 */
function openModal(element, id = null) {
  // wrap the content to ensure correct displaying no matter of the elements display value
  const wrapper = document.createElement('div');
  wrapper.classList.add('customModal');
  wrapper.append(element);
  
  // middlelayer to darken the background
  const middlelayer = document.createElement('div');
  middlelayer.classList.add('customModal_middlelayer');
  
  
  addToDOM(middlelayer, document.body, InsertionService.AsLastChild, false);
  addToDOM(wrapper, document.body, InsertionService.AsLastChild, true, id);
}


// style sheet for modals
addToDOM(`
  <style>
    .customModal {
      position: fixed;
      min-height: max(10%, 3rem);
      max-height: 70%;
      min-width: max(10%, 3rem);
      max-width: 70%;
      margin: auto;
    }
    .customModal_middlelayer {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: #0004; /* 25% transparency */
    }
  </style>
`.parseHTML(), document.body, InsertionService.AsLastChild, false);


