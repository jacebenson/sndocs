/*! RESOURCE: /scripts/form_tags.js */
$j(function($) {
  var $dt = $('#document_tags');
  if ($dt.length == 0)
    return;
  $('#tags_menu').click(function() {
    $('#form_tags').toggle();
    CustomEvent.fire('frame.resized');
    $dt.find('input').show().parent().show();
    $dt.find('input').focus();
  })
  var url = new GlideURL("data_table.do");
  url.addParam('sysparm_type', 'labels');
  url.addParam('sysparm_table', $dt.attr('data-table'));
  url.addParam('sysparm_sys_id', $dt.attr('data-sys_id'));
  url.addParam('sysparm_action', 'existing_labels');
  url.addParam('nocache', (new Date().getTime().toString()));
  url = url.getURL();
  $.ajax({
    dataType: "json",
    url: url,
    success: initializeResponseMenu
  });

  function labelTypeAhead(table, search, showChoices) {
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

  function initializeResponseMenu() {
    var t = arguments[2].responseText;
    var json = JSON.parse(t);
    $j("#tags_number").attr("data-number", json.set.length);
    if (json.set.length > 0)
      $('#tags_number').text(json.set.length);
    $dt.newtagit({
      itemName: 'item',
      allowSpaces: true,
      afterTagAdded: onTagAdded,
      afterTagRemoved: onTagRemoved,
      showAutocompleteOnFocus: false,
      animate: false,
      placeholderText: 'Add Tag...',
      table: $dt.attr('data-table'),
      labelsListString: JSON.stringify(json),
      autocomplete: {
        source: function(search, showChoices) {
          labelTypeAhead($dt.attr('data-table'), search, showChoices);
        }
      },
      query: "",
      context: 'tagsMenu',
      rowId: $dt.attr('data-sys_id'),
      fieldName: 'documentTags'
    });
    if (!window.isTablet)
      $dt.find('input').hide();
  }

  function onTagAdded(evt, ui, rowId) {
    if (ui.duringInitialization)
      return;
    var number = parseInt($("#tags_number").attr("data-number"), 10) + 1;
    if (!isNaN(number))
      $("#tags_number").text(number).attr("data-number", number).show();
    labelSet('add', ui.tagLabel, ui.table, ui.rowId);
  }

  function onTagRemoved(evt, ui, rowId) {
    if (ui.duringInitialization)
      return;
    if (!ui.tag)
      return;
    var number = parseInt($("#tags_number").attr("data-number"), 10) - 1;
    if (!isNaN(number)) {
      $("#tags_number").attr("data-number", number);
      if (number > 0)
        $("#tags_number").text(number);
      else
        $("#tags_number").hide();
    }
    labelSet('removeById', ui.tag, ui.table, ui.rowId);
  }

  function labelSet(action, label, table, rowId) {
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', $dt.attr('data-table'));
    url.addParam('sysparm_sys_id', $dt.attr('data-sys_id'));
    url.addParam('sysparm_label', label);
    url.addParam('sysparm_action', action);
    url = url.getURL();
    $.ajax({
      dataType: "json",
      url: url,
      success: labelResponse
    });
  }

  function labelResponse() {
    if (g_enhanced_activated == 'false') return;
    if (arguments == null || arguments[2] == null) return;
    var t = arguments[2].responseText;
    if (t == "" || t == null) return;
    var json = JSON.parse(t);
    var share = $dt.find('[id=\'' + json.label + '\'].tagit-share');
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
});
var showTagForm = function(id) {
  var form = new GlideDialogWindow("tag_form");
  form.setTitle("");
  form.setPreference("label_id", id);
  form.removeCloseDecoration();
  form.render();
};