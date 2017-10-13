/*! RESOURCE: /scripts/doctype/event_initialize.js */
$(document.body);
addAfterPageLoadedEvent(function() {
  document.on('keypress', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyPress(element, evt);
  });
  document.on('keydown', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyDown(element, evt);
  });
  document.on('keyup', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyUp(element, evt);
  });
  document.on('paste', 'input[data-type="ac_reference_input"]', function(evt, element) {
    setTimeout(function() {
      acPopulate(element);
      acReferenceKeyPress(element, evt);
    }, 0);
  });

  function acPopulate(element) {
    if (!element) {
      return;
    }
    var answer = element.ac;
    if (answer)
      return answer;
    var c = element.getAttribute('data-completer');
    var ref = element.getAttribute('data-ref');
    var d = element.getAttribute('data-dependent');
    var rq = element.getAttribute('data-ref-qual');
    new window[c](element, ref, d, rq);
  }
  document.body.on('click', 'a[data-type="ac_reference_input"]', function(evt, element) {
    var name = element.getAttribute('data-for');
    var target = $(name);
    if (!target) {
      return;
    }
    acPopulate(target);
    mousePositionSave(evt);
    var ref = target.getAttribute('data-ref');
    var d = target.getAttribute('data-dependent');
    var rq = target.getAttribute('data-ref-qual');
    var n = target.getAttribute('data-name');
    var table = target.getAttribute('data-table');
    reflistOpen(ref, n, table, d, 'false', rq);
  });
  window.addEventListener('focus', function(evt, element) {
    if (window.popupClose)
      popupClose();
  });
  document.body.on('click', 'a[data-type="reference_popup"]', function(evt, element) {
    var table = element.getAttribute('data-table');
    var form = element.getAttribute('data-form');
    var ref = element.getAttribute('data-ref');
    var refKey = element.getAttribute('data-ref-key');
    checkSave(table, form, ref, refKey);
  });
  document.on('mouseover', 'a[data-type="reference_popup"], a[data-type="reference_hover"]', function(evt, element) {
    var ref = element.getAttribute('data-ref');
    var view = element.getAttribute('data-view');
    var refKey = element.getAttribute('data-ref-key');
    popReferenceDiv(evt, ref, view, null, refKey);
  });
  document.on('mouseout', 'a[data-type="reference_popup"], a[data-type="reference_hover"]', function(evt, element) {
    lockPopup(evt);
  });
  document.body.on('click', 'a[data-type="reference_hover"]', function(evt, element) {
    alert(getMessage("Reference field click-through not available when updating multiple records"));
  });
  document.body.on('click', 'img[data-type="section_toggle"], span[data-type="section_toggle"]', function(evt, element) {
    var id = element.getAttribute("data-id");
    var prefix = element.getAttribute("data-image-prefix");
    var first = element.getAttribute("data-first");
    toggleSectionDisplay(id, prefix, first);
  });
  document.body.on('click', '[data-type="glide_list_unlock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    unlock(element, ref, ref + "_edit", ref + "_nonedit");
    toggleGlideListIcons(ref, false);
    var spaceElement = $('make_spacing_ok_' + ref);
    if (spaceElement)
      spaceElement.style.display = 'none';
    toggleAddMe(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="user_roles_unlock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var title = element.getAttribute("data-title");
    var modal = new GlideModal(ref + "_edit_modal", false);
    modal.setTitle(title);
    modal.on('bodyrendered', function() {
      gel(ref + 'select_0').focus();
    });
    var $content = $j(gel(ref + "_edit")).show();
    modal.renderWithContent($content);
    modal.on('beforeclose', function() {
      lock(element, ref, ref + '_edit', ref + '_nonedit', ref + 'select_1', ref + '_nonedit');
      $j(element).append($content);
    });
    evt.stop();
  });
  document.body.on('click', '[data-type="user_roles_lock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    $j(gel(ref + "_edit_modal")).data('gWindow').destroy();
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_remove"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    simpleRemoveOption($('select_0' + ref));
    toggleGlideListIcons(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_lock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    lock(element, ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
    var spaceElement = $('make_spacing_ok_' + ref);
    if (spaceElement)
      spaceElement.style.display = 'inline';
    toggleAddMe(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
    addGlideListChoice('select_0' + ref, u, name);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me_locked"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
    addGlideListChoice('select_0' + ref, u, name);
    lock($(ref + "_lock"), ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
    element.hide();
    evt.stop();
  });
  document.on('contextmenu', 'div[data-type="label"]', function(evt, element) {
    if (!elementAction(element, evt))
      evt.stop();
  });
  document.on('contextmenu', 'nav[data-type="section_head"]', function(evt, element) {
    var id = element.getAttribute("data-id");
    if (!contextShow(evt, "1", -1, 0, 0))
      evt.stop();
  });
});;