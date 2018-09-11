/*! RESOURCE: /scripts/accessibility_readonly.js */
addLateLoadEvent(function() {
  document.body.on('click', 'input.disabled', blockValueChange);

  function blockValueChange(evt, element) {
    var type = element.type;
    if (type.match('radio|checkbox')) {
      element.checked = !element.checked;
      evt.stop();
      return false;
    }
  }
});;