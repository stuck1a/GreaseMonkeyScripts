
/**
 * Uses the predefined route mappings to determine the route name
 * to decide the path of the further execution flow.
 * 
 * @return {string}  - Route name
 */
function getActiveRoute() {
  for (const route of pageRoutes.entries()) {
    if (window.location.pathname.match(new RegExp(`^${route[0]}/*$`, 'i'))) return route[1];
  }
  return '';
}



/**
 * @class InsertionService
 * @description Injects new elements to the DOM. Use {@link addToDOM} to access this service.
 * 
 * @requires log
 */
class InsertionService {
  /** Insert like <code>ref.prependChild(elem)</code> */
  static AsFirstChild = new InsertionService('AsFirstChild');
  /** Insert like <code>ref.appendChild(elem)</code> */
  static AsLastChild = new InsertionService('AsLastChild');
  /** Insert like <code>ref.parentElement.insertBefore(elem, ref)</code> */
  static Before = new InsertionService('Before');
  /** Insert like <code>ref.parentElement.insertAfter(elem, ref)</code> */
  static After = new InsertionService('After');

  constructor(name = '') { this.name = name }
  
  /**
   * Applies the insertion.
   * 
   * @param {HTMLElement|Node} element
   * @param {HTMLElement|Node} refElement
   * @param {InsertionService} method
   */
  static insert(element, refElement, method) {
    const buildLogContext = function() {
      return [
        t('Einzufügendes Element:'), element,
        t('Referenz-Element:'), refElement,
        t('Verwendete Methode:'), method.name
      ];
    }
    
    switch (method) {
      // as first child
      case this.AsFirstChild:
        if (refElement.hasChildNodes()) {
          refElement.insertBefore(element, refElement.childNodes[0]);
          break;
        }
        refElement.appendChild(element);
        break;
      // as last child
      case this.AsLastChild:
        refElement.appendChild(element);
        break;
      // before
      case this.Before:
        if (refElement.parentElement) {
          refElement.parentElement.insertBefore(element, refElement);
          break;
        }
        log(t('Element kann nicht vor dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!'), 'error', buildLogContext());
        break;
     // after
      case this.After:
        if (refElement.parentElement) {
          refElement.nextSibling
            ? refElement.parentElement.insertBefore(element, refElement.nextSibling)
            : refElement.parentElement.appendChild(element);
          break;
        }
        log(t('Element kann nicht nach dem Referenz-Element eingefügt werden, wenn dieses kein übergeordnetes Element besitzt!'), 'error', buildLogContext());
        break;
      default:
        log(t('Unbekannte Einfüge-Methode angefordert.'), 'error', buildLogContext());
    }
  }
}



/**
 * Insert a custom element to the DOM and add its reference to the global register of custom elements.
 * 
 * @requires InsertionService
 * @requires customElementsRegister
 * @requires log
 * @requires t
 * 
 * @param {DocumentFragment|HTMLElement|Node} element  - Element to insert
 * @param {HTMLElement|string} refElement  - Reference element for the placement (can be an element id as well)
 * @param {InsertionService} method  - Insertion logic to use
 * @param {boolean} [register=true]  - Whether the element shall be added to the register of custom elements
 * @param {?string} registerId  - ID under which the element is added to the register. 
 *                                If no access is needed later on, can be omitted or set to null (will use random ID).
 *
 * @return {HTMLElement|HTMLElement[]|Node|DocumentFragment}  - Reference (or list of references) of inserted element(s) or
 *   the input itself, if something went wrong.
 */
function addToDOM(element, refElement, method, register = true, registerId = null) {
  if (typeof refElement === 'string' ) refElement = document.getElementById(refElement);
  let insertedElements = [];
  
  if (element instanceof DocumentFragment) {
    if (element.childElementCount === 0) return element.children[0];
    for (const rootElement of element.children) {
      rootElement.setAttribute('data-customElement', 'true');
      insertedElements.push(rootElement);
    }
    if (element.childElementCount === 1) insertedElements = element.children[0];
  } else if (element instanceof HTMLElement || element instanceof Node) {
    element.setAttribute('data-customElement', 'true');
    insertedElements = element;
  }
  
  InsertionService.insert(element, refElement, method);
  
  if (register) {
    if (!registerId) registerId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    if (!customElementsRegister) {
      log(t('Ein Custom-Element wurde vor der Initialisierung des globalen Registers eingefügt.\nDas Element konnte daher nicht registriert werden.'), 'warn', [ element ]);
      return insertedElements;
    }
    customElementsRegister.set(registerId, insertedElements);
  }
  
  return insertedElements;
}



/**
 * Deletes a custom element from the DOM and from the register, if it was a registered element.
 * 
 * @requires customElementsRegister
 * @requires disabledPrimalElementsRegister
 * @requires Map.prototype.deleteByValue
 * 
 * @param {HTMLElement|string} elementOrId  - Can be the element itself, its id or the register id
 * @param {boolean} [force=false]  - Remove element, even if it is no custom element
 * @return {boolean}  - Whether the removal succeeded or not
 */
function removeFromDOM(elementOrId, force = false) {
  // if we got the element itself
  if (elementOrId instanceof HTMLElement || elementOrId instanceof Node) {
    if (customElementsRegister) customElementsRegister.deleteByValue(elementOrId, 1);
    if (force || elementOrId.hasAttribute('data-customElement')) {
      if (disabledPrimalElementsRegister && !elementOrId.hasAttribute('data-customElement')) {
        disabledPrimalElementsRegister.deleteByValue(elementOrId, 1);
      }
      elementOrId.remove();
      return true;
    }
    return false;
  }
  
  // if we got the register id
  if (customElementsRegister && customElementsRegister.has(elementOrId)) {
    const element = customElementsRegister.get(elementOrId);
    if (element instanceof HTMLElement || element instanceof Node) element.remove();
    customElementsRegister.delete(elementOrId);
    return true;
  }
  
  // if we got the element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) {
    if (customElementsRegister) customElementsRegister.deleteByValue(elementOrId, 1);
    if (force || elementOrId.hasAttribute('data-customElement')) {
      if (disabledPrimalElementsRegister && !elementOrId.hasAttribute('data-customElement')) {
        disabledPrimalElementsRegister.deleteByValue(elementOrId, 1);
      }
      elementOrId.remove();
      return true;
    }
    return false;
  }
  
  return false;
}



/**
 * Hides original content of the page and registers the hidden element, so we
 * always know all disabled primal content to allow features like disabling the user script.
 * 
 * <br><br><i><strong>Important note:</strong><br>
 * The register is distinct, which means if the given element is already registered, it will only
 * update the register id instead of adding a duplicate entry!</i>
 * 
 * @requires disabledPrimalElementsRegister
 * @requires Map.prototype.deleteByValue
 * 
 * @param {Node|HTMLElement|string} elementOrId  - Target element, its id or register id
 * @param {?string} registerId  - ID under which the element is added to the register.
 *                                If omitted or null, an unique ID will be created.
 *
 * @return {boolean}  - False, if the target is not found or tagged as custom element, true otherwise.
 */
function disablePrimalElement(elementOrId, registerId = null) {
  const apply = function(id, element) {
    element.classList.add('forceHidden');
    if (disabledPrimalElementsRegister) {
      if (!id) id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      // if this element is already stored, then just update the register id
      disabledPrimalElementsRegister.deleteByValue(element, 1);
      disabledPrimalElementsRegister.set(id, element);
    }
    return true;
  };
  
  // if we got an element
  if (elementOrId instanceof HTMLElement || elementOrId instanceof Node) return apply(registerId, elementOrId);
  
  // if we got an element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) return apply(registerId, elementOrId);
  
  // if we got an register id
  if (disabledPrimalElementsRegister.has(elementOrId)) return apply(elementOrId, disabledPrimalElementsRegister.get(elementOrId));
  
  return false;
}



/**
 * Restores hidden original page content.
 *
 * @requires disabledPrimalElementsRegister
 * 
 * @param {HTMLElement|string} elementOrId  - Target element, its element id or register id
 *
 * @return {boolean}  - Whether the operation succeeded or failed (will fail if the target is not found)
 */
function enablePrimalElement(elementOrId) {
  // if we got an element
  if (elementOrId instanceof HTMLElement || elementOrId instanceof Node) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    elementOrId.classList.remove('forceHidden');
    return true;
  }
  
  // if we got an register id
  if (disabledPrimalElementsRegister && disabledPrimalElementsRegister.has(elementOrId)) {
    const element =  disabledPrimalElementsRegister.get(elementOrId);
    element.classList.remove('forceHidden');
    return true;
  }
  
  // if we got an element id
  elementOrId = document.getElementById(elementOrId);
  if (elementOrId) {
    if (elementOrId.hasAttribute('data-customElement')) return false;
    elementOrId.classList.remove('forceHidden');
    return true;
  }
  
  return false;
}



/**
 * Adds one or more new elements to the list of elements which aren't rebuilt on updates
 * but contains text which need to translated when the active language is changed.
 * As entry key the element itself is used.
 * The value is an object with property text and property args which is an array
 * holding all arguments for sending to t().
 * 
 * @requires staticTranslatableElements
 * 
 * @param {(HTMLElement|object[element:string,text:string,[args:string[]]])} element  - Target element or array of objects containing all arguments as property 
 * @param {string} [text='']  - The text which will be send to t() (omit if sending a list)
 * @param {string[]} [args=[]]  - The argument list for the formatters send to t() (omit if sending a list)
 */
function registerStaticTranslatable(element, text = '', args = []) {
  // if multiple items received as array of objects
  if (!(element instanceof HTMLElement)) {
    for (const entry of element) {
      if (!staticTranslatableElements.has(entry['element'])) staticTranslatableElements.set(entry['element'], { text: entry['text'] ?? text, args: entry['args'] ?? args });
    }
    return;
  }
  // if single item received
  if (!staticTranslatableElements.has(element)) staticTranslatableElements.set(element, { text: text, args: args });
}



/**
 * Click event handler for the global switch which
 * turns all of this UserScripts features on/off.
 *
 * @param [toggleState=true]  - If false, the internal state won't be toggled (used only for the manual call when script is disabled on page load)
 */
function doChangeMainSwitch(toggleState = false) {
  // toggle state flag
  if (toggleState) {
    mainSwitchState = !mainSwitchState;
    set_value('scriptEnabled', mainSwitchState);
  }
  
  // toggle visibility of custom elements
  for (const element of customElementsRegister.values()) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? entry.classList.remove('forceHidden') : entry.classList.add('forceHidden');
    } else {
      this.checked ? element.classList.remove('forceHidden') : element.classList.add('forceHidden');
    }
  }
  // toggle visibility of original elements
  const register = Array.from(disabledPrimalElementsRegister.values());    // avoid infinity loop
  for (const element of register) {
    if (element instanceof Array) {
      for (const entry of element) this.checked ? disablePrimalElement(entry) : enablePrimalElement(entry);
    } else {
      this.checked ? disablePrimalElement(element) : enablePrimalElement(element);
    }
  }
}



/**
 * This function is responsible for update all i18n content.
 * All those elements which need such a manual update must be registered with {@link registerStaticTranslatable} once.
 */
function updateStaticTranslations() {
  for (const element of staticTranslatableElements.entries()) element[0].innerText = t(element[1].text, element[1].args);
}



/**
 * Polyfill which works like a DOMContentLoaded event for iframes, so you don't have to wait
 * for the load event for DOM manipulation within iframes.
 * 
 * <strong>Important note:<br>
 * This function ONLY works for iframes of the same origin as their parent!</strong>
 * 
 * @param {HTMLIFrameElement} iframe  - Target iframe
 * @param {function} fn  - Callback function
 */
function iFrameReady(iframe, fn) {
  let timer;
  let fired = false;
  function ready() {
    if (!fired) {
      fired = true;
      clearTimeout(timer);
      fn.call(this);
    }
  }
  function readyState() {
    if (this.readyState === 'complete') ready.call(this);
  }
  // cross platform event handler for compatibility with older IE versions
  function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
      return elem.addEventListener(event, fn);
    } else {
      return elem.attachEvent('on' + event, function () { return fn.call(elem, window.event); });
    }
  }
  // use load event as last resort (though the other events should occur first)
  addEvent(iframe, 'load', function () { ready.call(iframe.contentDocument || iframe.contentWindow.document); });
  function checkLoaded() {
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    // check if there is still the dummy document
    if (doc.URL.indexOf('about:') !== 0) {
      if (doc.readyState === 'complete') {
        ready.call(doc);
      } else {
        // set event listener for DOMContentLoaded on the new document
        addEvent(doc, 'DOMContentLoaded', ready);
        addEvent(doc, 'readystatechange', readyState);
      }
    } else {
      // still same old original document, so keep looking for content or new document
      timer = setTimeout(checkLoaded, 1);
    }
  }
  checkLoaded();
}

