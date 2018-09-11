/*! RESOURCE: /scripts/classes/GlideList2InitEvents.js */
function glideList2InitEvents() {
  var clickTitle = function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).clickTitle(evt);
    evt.stop();
  }
  document.body.on('click', 'a[data-type="list2_top_title"], button[data-type="list2_top_title"]', clickTitle);
  document.body.on('keydown', 'a[data-type="list2_top_title"], button[data-type="list2_top_title"]', function(evt, element) {
    if (evt && (evt.keyCode == 32 || evt.keyCode == 13 && isMSIE11))
      clickTitle(evt, element);
  });
  document.body.on('contextmenu', '.list_nav_top', function(evt, element) {
    if (!element.hasAttribute('data-list_id'))
      return;
    if (evt.ctrlKey)
      return;
    if (evt.target.tagName.toLowerCase() === 'input')
      return;
    GlideList2.get(element.getAttribute('data-list_id')).clickTitle(evt);
    evt.stop();
  });
  document.body.on('click', 'a[data-type="list2_toggle"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).toggleList();
    evt.stop();
  });
  if (isDoctype()) {
    $j('input[data-type="list2_checkbox"] + label.checkbox-label').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var input = $j(e.target).parent()[0].querySelector('input');
      input.checked = !input.checked;
      GlideList2.get(input.getAttribute('data-list_id')).rowChecked(input, e);
      $j(input).change();
    });
  } else {
    document.body.on('click', 'input[data-type="list2_checkbox"], label[data-type="list2_checkbox"]', function(evt, element) {
      GlideList2.get(element.getAttribute('data-list_id')).rowChecked(element, evt);
      evt.stopPropagation();
    });
  }
  document.body.on('click', 'input[data-type="list2_all_checkbox"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).allChecked(element);
    evt.stopPropagation();
  });
  document.body.on('click', 'button[data-type="list2_group_toggle"]', function(evt, element) {
    var toggleIcon = element.childNodes[0];
    if (toggleIcon && toggleIcon.className.indexOf('collapsedGroup') > -1)
      toggleIcon.className = toggleIcon.className.replace(/\bcollapsedGroup\b/, '');
    else
      toggleIcon.className += 'collapsedGroup';
    GlideList2.get(element.getAttribute('data-list_id')).toggleGroups();
    evt.stop();
  });
  document.body.on('click', 'img[data-type="list2_delete_row"], i[data-type="list2_delete_row"]', function(evt, element) {
    var gl = GlideList2.get(element.getAttribute('data-list_id'));
    var row = gl._getRowRecord(element);
    editListWithFormDeleteRow(row.sysId, gl.listID);
  });
  document.body.on('keyup', 'i[data-type="list2_delete_row"]', function(evt, element) {
    var code = evt.which || evt.keyCode;
    if (code == 32) {
      evt.preventDefault();
      var gl = GlideList2.get(element.getAttribute('data-list_id'));
      var row = gl._getRowRecord(element);
      editListWithFormDeleteRow(row.sysId, gl.listID);
    }
  });
  document.body.on('click', 'img[data-type="list2_hier"], i[data-type="list2_hier"]', function(evt, element) {
    var gl = GlideList2.get(element.getAttribute('data-list_id'));
    var row = gl._getRowRecord(element);
    gl.toggleHierarchy(element, 'hier_row_' + gl.listID + '_' + row.sysId, row.target, row.sysId);
    evt.stop();
  });
  if (isDoctype()) {
    var hierarchyToggles = $j('img[data-type="list2_hier"], i[data-type="list2_hier"]');
    for (var i = 0; i < hierarchyToggles.length; i++) {
      var gl = GlideList2.get(hierarchyToggles[i].getAttribute('data-list_id'));
      var row = gl._getRowRecord(hierarchyToggles[i]);
      hierarchyToggles[i].setAttribute('aria-controls', 'hier_row_' + gl.listID + '_' + row.sysId)
    }
  }
  document.on('click', 'img[data-type="list2_popup"], a[data-type="list2_popup"]', function(evt, element) {
    if (evt && evt.metaKey) {
      return;
    }
    var gl = GlideList2.get(element.getAttribute('data-list_id'));
    var row = gl._getRowRecord(element);
    var showOpenButton = true;
    var trapFocus = true;
    popListDiv(evt, row.target, row.sysId, gl.view, 600, showOpenButton, trapFocus);
    evt.stop();
  });
  if (isDoctype()) {
    CustomEvent.observe('body_clicked', function(evt, element) {
      if ($j('.popup').length > 0 && !evt.target.closest('.popup') && !evt.target.closest('.form_body') &&
        evt.target.getAttribute('data-type') != "list2_popup") {
        lockPopup(evt);
        evt.stop();
      }
    });
  }
  var headerCellClickHandler = function(evt, element) {
    element = element.up("TH");
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellClick(element, evt);
    evt.stop();
  };
  document.body.on('click', 'a[data-type="list2_hdrcell"]', headerCellClickHandler);
  document.body.on('keydown', 'a[data-type="list2_hdrcell"]', function(evt, element) {
    if (evt && (evt.keyCode == 32 || evt.keyCode == 13 && window.isMSIE11))
      headerCellClickHandler(evt, element);
  });
  document.body.on('contextmenu', 'th[data-type="list2_hdrcell"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
  });
  document.body.on('click', 'a.list_header_context', function(evt, element) {
    element = element.parentElement;
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
    evt.stop();
  });
  var headerContextHandler = function(evt, element) {
    element = element.parentElement.parentElement;
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
    evt.stop();
  };
  document.body.on('click', 'i.list_header_context', headerContextHandler);
  document.body.on('keydown', 'i.list_header_context', function(evt, element) {
    if (evt && evt.keyCode == 32 || evt.keyCode == 13 && isMSIE11)
      headerContextHandler(evt, element);
  });
  document.body.on('click', 'span[data-type="list2_hdrcell"]', list2Context);

  function list2Context(evt, element) {
    element = element.up("th");
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
  }
  document.body.on('contextmenu', 'tr[data-type="list2_row"]', function(evt, element) {
    rowContextMenu(element, evt);
  });
  var doubleTapTimeout,
    doubleTapActive = false;
  document.body.on('touchend', 'tr[data-type="list2_row"]', function(evt, element) {
    if (doubleTapActive) {
      doubleTapActive = false;
      clearTimeout(doubleTapTimeout);
      rowContextMenu(element, evt);
      if (window.GwtListEditor && GwtListEditor.forPage)
        GwtListEditor.forPage.onSelected(evt);
      evt.preventDefault();
      return false;
    }
    doubleTapActive = true;
    doubleTapTimeout = setTimeout(function() {
      doubleTapActive = false;
      if (evt.target)
        evt.target.click();
    }, 300);
    evt.preventDefault();
    return false;
  });
  document.body.on('click', 'a[data-type="list_mechanic2_open"], i[data-type="list_mechanic2_open"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).listMechanicClick(element);
    evt.stop();
  });

  function rowContextMenu(element, evt) {
    GlideList2.get(element.getAttribute('data-list_id')).rowContextMenu(element, evt);
  }
}
if (!window['g_isGlideList2InitEvents']) {
  addAfterPageLoadedEvent(glideList2InitEvents);
  window.g_isGlideList2InitEvents = true;
};