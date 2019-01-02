$j(function($) {
  var $dt = $('#document_tags');
  if ($dt.length == 0)
    return;
  $('#tags_menu').click(function() {
    $('#form_tags').toggle();
    $dt.find('input').show();
  })
  var url = new GlideURL("data_table.do");
  url.addParam('sysparm_type', 'labels');
  url.addParam('sysparm_table', $dt.attr('data-table'));
  url.addParam('sysparm_sys_id', $dt.attr('data-sys_id'));
  url.addParam('sysparm_action', 'available_tags');
  url.addParam('nocache', (new Date().getTime().toString()));
  url = url.getURL();
  $.ajax({
    dataType: "json",
    url: url,
    success: initializeResponse
  });

  function initializeResponse() {
    var t = arguments[2].responseText;
    var json = JSON.parse(t);
    var availableTags = json.availableTags;
    var originalTags = "";
    for (var i = 0; i < json.set.length; i++) {
      var label = json.set[i].label;
      originalTags += new XMLTemplate('label_template').evaluate({
        label: label
      });
    }
    $dt.html(originalTags);
    $dt.tagit({
      availableTags: availableTags,
      itemName: 'item',
      allowSpaces: true,
      afterTagAdded: onTagAdded,
      afterTagRemoved: onTagRemoved,
      placeholderText: $dt.attr('data-label'),
      showAutocompleteOnFocus: true,
      animate: false,
      fieldName: 'documentTags'
    });
    if (!window.isTablet)
      $dt.find('input').hide();
  }

  function onTagAdded(evt, ui) {
    if (ui.duringInitialization)
      return;
    tagSet('add', ui.tagLabel);
  }

  function onTagRemoved(evt, ui) {
    if (ui.duringInitialization)
      return;
    tagSet('remove', ui.tagLabel);
  }

  function tagSet(action, tag) {
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', g_form.getTableName());
    url.addParam('sysparm_sys_id', g_form.getUniqueValue());
    url.addParam('sysparm_tag', tag);
    url.addParam('sysparm_action', action);
    url = url.getURL();
    $.ajax({
      url: url,
      success: tagResponse
    });
  }

  function tagResponse() {}
});