/*! RESOURCE: /scripts/related_tags.js */
jQuery(function($) {
  function labelResponse() {
    if (g_enhanced_activated == 'false') return;
    if (arguments == null || arguments[2] == null) return;
    var t = arguments[2].responseText;
    if (t == "" || t == null) return;
    var json = JSON.parse(t);
    var shareId = json.label;
    var share = $('tr[sys_id=\'' + json.rowId + '\']').find('[id=\'' + shareId + '\'].tagit-share');
    share.parent().attr("id", json.sysId).css({
      "background-color": json.bgcolor,
      "color": json.tcolor
    });
    share.parent().find(".tagit-label").unbind('click').click(function() {
      window.location.href = json.table + "_list.do?sysparm_query=" + json.query
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

  function onTagAdded(evt, ui, rowId) {
    if (ui.duringInitialization)
      return;
    labelSet('add', ui.tagLabel, ui.table, ui.rowId, ui.type);
  }

  function onTagRemoved(evt, ui, rowId) {
    if (ui.duringInitialization)
      return;
    labelSet('removeById', ui.tag, ui.table, ui.rowId);
  }

  function labelSet(action, label, table, rowId, type) {
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', table);
    url.addParam('sysparm_sys_id', rowId);
    url.addParam('sysparm_label', label);
    url.addParam('sysparm_action', action);
    if (type)
      url.addParam('sysparm_target_add', type);
    url = url.getURL();
    $.ajax({
      dataType: "json",
      url: url,
      beforeSend: function(request) {
        request.setRequestHeader("X-UserToken", window.g_ck);
      },
      success: labelResponse
    });
  }

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
      beforeSend: function(request) {
        request.setRequestHeader("X-UserToken", window.g_ck);
      },
      success: function() {
        var t = arguments[2].responseText;
        var response = JSON.parse(t);
        showChoices(response.availableLabels);
      }
    });
  }

  function initializeTags() {
    $cells = $('.document_tags');
    if ($cells[0])
      query = $($cells[0]).attr('data-query');
    else
      return;
    var table = $($cells[0]).attr('class').split(/\s+/)[0];
    for (var i = 0; i < $cells.length; i++) {
      $dt = $($cells[i]);
      var query = $dt.attr('data-query');
      var labelsListString = $dt.attr('data-tags') || '{"set":[]}';
      $dt.removeAttr('data-tags');
      $dt.append('<li></li>');
      $dt.newtagit({
        itemName: 'item',
        allowSpaces: true,
        afterTagAdded: onTagAdded,
        afterTagRemoved: onTagRemoved,
        showAutocompleteOnFocus: false,
        autocomplete: {
          source: function(search, showChoices) {
            labelTypeAhead(table, search, showChoices);
          }
        },
        animate: false,
        placeholderText: getMessage('Add Tag...'),
        table: table,
        labelsListString: labelsListString,
        query: query,
        context: 'list',
        rowId: $dt.closest('tr').attr('sys_id'),
        fieldName: 'documentTags'
      });
      $dt.css('display', 'inline-block');
    }
  }
  CustomEvent.observe("list.initialize.tags", initializeTags);
  window.setTimeout(initializeTags, 0);
});;