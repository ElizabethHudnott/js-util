/** Mappings between characters that need to be escaped in HTML code (to prevent cross-site
  scripting attacks) and their corresponding escape sequences, i.e. HTML character entities.
  @readonly
*/
const ESCAPE_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
});

/** Escapes a string so that any HTML code contained within it is converted into plain
  text.
  @param {string} input The text to make safe.
*/
function escapeHTML(input) {
  'use strict';
  return String(input).replace(/[&<>"']/g, function (match) {
    return ESCAPE_MAP[match];
  });
}

function findCheckedRadioButton(buttons) {
  'use strict';
  for (let button of buttons) {
    if (button.checked) {
      return button.value;
    }
  }
}

/** Clones an Element and adds a prefix to any id attributes found within the clone's DOM
  structure and updates any references to the original ids to refer to the prefixed ids instead.
  @param {Element} element The element to create a clone of.
  @param {string} idPrefix The prefix to add to any ids defined within the cloned element's subtree.
  @param {boolean} renameRoot If true then the element itself will be renamed (if it has an id attribute).
  If this parameter value is false then the id attribute on the root node of the cloned subtree
  will be removed instead.
*/
function cloneElement(element, idPrefix, renameRoot) {
  'use strict';
  const idListAttribs = ['aria-controls', 'aria-describedby', 'aria-labelledby'];
  const selectorAttribs = ['data-parent', 'data-target', 'href'];

  const spaceSeparated = /(?:^|\s+)(\S+)/g;
  let renamedIDs = [];

  function replaceID(match, id) {
    if (renamedIDs.indexOf(id) !== -1) {
      return ' ' + idPrefix + id;
    } else {
      return ' ' + id;
    }
  }

  function rename(element) {
    let id = element.getAttribute('id');
    if (id) {
      renamedIDs.push(id);
      element.setAttribute('id', idPrefix + id);
    }
    for (let child of element.children) {
      rename(child);
    }
  }

  function fixIDReferences(element) {
    let attribValue = element.getAttribute('for');
    if (attribValue && renamedIDs.indexOf(attribValue) !== -1) {
      element.setAttribute('for', idPrefix + attribValue);
    }
    for (let attribName of selectorAttribs) {
      attribValue = element.getAttribute(attribName);
      if (attribValue && attribValue[0] === '#') {
        let id = attribValue.slice(1);
        if (renamedIDs.indexOf(id) !== -1) {
          element.setAttribute(attribName, '#' + idPrefix + id);
        }
      }
    }
    for (let attribName of idListAttribs) {
      attribValue = element.getAttribute(attribName);
      if (attribValue) {
        element.setAttribute(attribName, attribValue.replace(spaceSeparated, replaceID))
      }
    }
    for (let child of element.children) {
      fixIDReferences(child);
    }
  }

  let clone = element.cloneNode(true);
  if (renameRoot === false) {
    clone.removeAttribute('id');
  }

  rename(clone);
  fixIDReferences(clone);

  return clone;
}
