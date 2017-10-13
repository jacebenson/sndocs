/*! RESOURCE: /scripts/classes/doctype/GlideListv3Compatibility.js */
(function() {
  $j(document).on('click', '.list-compat-check', function() {
    var $element = $j(this);
    var popoverTarget = this.getAttribute('data-target');
    if (!popoverTarget)
      return;
    if (popoverTarget.indexOf('#') == 0)
      popoverTarget = document.getElementById(popoverTarget.substring(1));
    var $popover = $j(popoverTarget);
    var realTable = $element.attr('data-table');
    var parent = $element.attr('data-parent');
    var table = parent && window.g_form ? g_form.getTableName() : realTable;
    var listControlID = $element.attr('data-list-control');
    if ($element.attr('data-compat-rendered') == 'true')
      return;
    $j.ajax({
      headers: {
        'X-UserToken': window.g_ck
      },
      data: {
        sysparm_parent: parent,
        sysparm_realtable: realTable
      },
      url: '/api/now/v1/ui/list_compatibility/' + table
    }).then(function(response) {
      var tmpl = new XMLTemplate('listcompat_content');
      var output = tmpl.evaluate({
        related_lists_enabled: convertResultToCheck(parent ? response.result.related_lists_enabled : true, null, 'glide.ui.list_v3.related_list'),
        sys_control_enabled: convertResultToCheck(response.result.checks.sys_control_enabled, listControlID),
        hierarchical_lists: convertResultToCheck(response.result.checks.hierarchical_lists, listControlID),
        list_edit_insert_row: convertResultToCheck(response.result.checks.list_edit_insert_row, listControlID),
        compatible_ui_actions: convertResultToCheck(response.result.checks.compatible_ui_actions)
      });
      $popover.find('.popover-body').append(output);
      output = "";
      if (response.result.checks.ui_actions) {
        var uiActions = response.result.checks.ui_actions;
        for (var i = 0; i < uiActions.length; i++) {
          if (uiActions[i].count == '0')
            continue;
          output += outputUIActionLine(uiActions[i], table);
        }
      }
      $popover.find('.ui-actions').append(output);
      $popover.find('[title]').tooltip().hideFix();
      $element.attr('data-compat-rendered', 'true').popover('show');
    })
  });

  function outputUIActionLine(action, table) {
    var tmpl = new XMLTemplate(action.action_name ? 'listcompat_ui_action' : 'listcompat_ui_action_global');
    return tmpl.evaluate($j.extend({}, action, {
      table: table
    }));
  }

  function convertResultToCheck(param, listControlID, propertyName) {
    var href = "";
    if (listControlID && listControlID != '-1') {
      href = 'sys_ui_list_control.do?sys_id=' + listControlID;
    } else if (propertyName) {
      href = 'sys_properties.do?sysparm_query=name=' + propertyName;
    }
    return param ? {
      msg: getMessage('Compatible'),
      rowStyle: 'hidden',
      style: 'icon-success-circle color-green',
      href: ''
    } : {
      msg: getMessage('Not compatible'),
      rowStyle: '',
      style: 'icon-error-circle color-red',
      href: href
    };
  }
})();;