/*! RESOURCE: /scripts/form_tags.js */
window.NOW.FormTags = (function($) {
  var $tagsMenu,
    $documentTags,
    $formTags,
    $tagsNumber,
    initialized = false;

  function init() {
    if (initialized) {
      return;
    }
    $tagsMenu = $('#tags_menu');
    $documentTags = $('#document_tags');
    $formTags = $('#form_tags');
    $tagsNumber = $('#tags_number');
    initialized = true;
    if ($documentTags.length == 0)
      return;
    $tagsMenu.click(function() {
      $formTags.toggle();
      CustomEvent.fire('frame.resized');
      $documentTags.find('input').show().parent().show();
      $documentTags.find('input').focus();
    });
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', $documentTags.attr('data-table'));
    url.addParam('sysparm_sys_id', $documentTags.attr('data-sys_id'));
    url.addParam('sysparm_action', 'existing_labels');
    url.addParam('nocache', (new Date().getTime().toString()));
    url = url.getURL();
    $.ajax({
      dataType: "json",
      url: url,
      success: _initializeResponseMenu
    });
  }

  function _initializeResponseMenu() {
    var t = arguments[2].responseText;
    var json = JSON.parse(t);
    $tagsNumber.attr("data-number", json.set.length);
    if (json.set.length > 0)
      $tagsNumber.text(json.set.length);
    $documentTags.newtagit({
      itemName: 'item',
      allowSpaces: true,
      afterTagAdded: _onTagAdded,
      afterTagRemoved: _onTagRemoved,
      showAutocompleteOnFocus: false,
      animate: false,
      placeholderText: getMessage('Add Tag...'),
      table: $documentTags.attr('data-table'),
      labelsListString: JSON.stringify(json),
      autocomplete: {
        source: function(search, showChoices) {
          _labelTypeAhead($documentTags.attr('data-table'), search, showChoices);
        }
      },
      query: "",
      context: 'tagsMenu',
      rowId: $documentTags.attr('data-sys_id'),
      fieldName: 'documentTags'
    });
    if (!window.isTablet)
      $documentTags.find('input').hide();
  }

  function _labelTypeAhead(table, search, showChoices) {
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', table);
    url.addParam('sysparm_action', 'available_labels');
    url.addParam('sysparm_prefix', search.term);
    url = url.getURL();
    $.ajax({
      dataType: "json",
      url: url,
      success: function() {
        var t = arguments[2].responseText;
        var response = JSON.parse(t);
        showChoices(response.availableLabels);
      }
    });
  }

  function _onTagAdded(evt, ui, rowId) {
    if (ui.duringInitialization)
      return;
    var number = parseInt($tagsNumber.attr("data-number"), 10) + 1;
    if (!isNaN(number))
      $tagsNumber.text(number).attr("data-number", number).show();
    _labelSet('add', ui.tagLabel, ui.table, ui.rowId);
  }

  function _onTagRemoved(evt, ui, rowId) {
    if (ui.duringInitialization)
      return;
    if (!ui.tag)
      return;
    var number = parseInt($tagsNumber.attr("data-number"), 10) - 1;
    if (!isNaN(number)) {
      $tagsNumber.attr("data-number", number);
      if (number > 0)
        $tagsNumber.text(number);
      else
        $tagsNumber.hide();
    }
    _labelSet('removeById', ui.tag, ui.table, ui.rowId);
  }

  function _labelSet(action, label, table, rowId) {
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', $documentTags.attr('data-table'));
    url.addParam('sysparm_sys_id', $documentTags.attr('data-sys_id'));
    url.addParam('sysparm_label', label);
    url.addParam('sysparm_action', action);
    url = url.getURL();
    $.ajax({
      dataType: "json",
      url: url,
      success: _labelResponse
    });
  }

  function _labelResponse() {
    if (g_enhanced_activated == 'false') return;
    if (arguments == null || arguments[2] == null) return;
    var t = arguments[2].responseText;
    if (t == "" || t == null) return;
    var json = JSON.parse(t);
    var share = $documentTags.find('[id=\'' + json.label + '\'].tagit-share');
    share.parent().attr("id", json.sysId).css({
      "background-color": json.bgcolor,
      "color": json.tcolor
    });
    share.parent().find(".tagit-label").unbind('click').click(function() {
      window.open(json.table + "_list.do?sysparm_query=" + json.query);
    });
    var shareLevel = (json.type == 'SHARED') ? 'tagit-share-group' : 'tagit-share-user';
    share.parent().removeClass("tagit-share-user tagit-share-group").addClass(shareLevel);
    if (json.owner != true) {
      share.removeClass("pointerhand");
      share.unbind("click");
    }
    var icon = (json.type == 'SHARED') ? 'icon-user-group' : 'icon-user';
    share = share.children();
    share.removeClass("icon-user-group icon-user").addClass(icon);
  }
  return {
    init: init
  }
})(jQuery);
var showTagForm = function(id) {
  var form = new GlideDialogWindow("tag_form");
  form.setTitle("");
  form.setPreference("label_id", id);
  form.removeCloseDecoration();
  form.render();
};;