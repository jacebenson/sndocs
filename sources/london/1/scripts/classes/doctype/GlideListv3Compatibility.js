/*! RESOURCE: /scripts/classes/doctype/GlideListv3Compatibility.js */
(function() {
  var popoverIsVisible = false;
  $j(document).off('click', '.list-compat-check').on('click', '.list-compat-check', function() {
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
    if ($element.attr('data-compat-rendered') === 'true') {
      if (popoverIsVisible) {
        $element.popover('hide');
      } else {
        $element.popover('show');
      }
      return;
    }
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
        related_lists_enabled: convertResultToCheck(parent ? response.result.related_lists_enabled === 'enable_v3' : true, null, 'glide.ui.list_v3.related_list', getMessage('List v3 is not enabled for related lists')),
        sys_control_enabled: convertResultToCheck(response.result.checks.sys_control_enabled, listControlID, null, getMessage('List v3 is enabled in List Control')),
        hierarchical_lists: convertResultToCheck(response.result.checks.hierarchical_lists, listControlID, null, getMessage('Hierarchical lists')),
        list_edit_insert_row: convertResultToCheck(response.result.checks.list_edit_insert_row, listControlID, null, getMessage('List edit insert row')),
        compatible_ui_actions: convertResultToCheck(response.result.checks.compatible_ui_actions, null, null, getMessage('Client-side UI Actions')),
        listControlID: listControlID
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
      var titledElements = $popover.find('[title]');
      titledElements.each(function(index, element) {
        var $element = $j(element);
        $element.tooltip({
          container: $element.parent()
        }).hideFix();
      });
      $element.attr('data-compat-rendered', 'true').popover('show');
      var trappedFocus;
      $element.on('shown.bs.popover', function() {
        popoverIsVisible = true;
        if (typeof trappedFocus === 'undefined') {
          var $popoverContainer = $popover.parent().parent();
          if ($popoverContainer.length > 0) {
            $popoverContainer.attr('role', 'dialog');
          }
          var $popoverTitle = $popover.parent().prev();
          if ($popoverTitle.length === 0) {
            return;
          }
          var $newPopoverTitle = $j('<h1 />').addClass('list-compat-title popover-title');
          $newPopoverTitle.text($popoverTitle.text());
          var $popoverTitleDescElement = $popover.find('span.popover_title_desc');
          if ($popoverTitleDescElement.length === 0) {
            $newPopoverTitle.attr('tabindex', '-1').attr('aria-describedby', $popoverTitleDescElement.attr('id'));
          }
          $popoverTitle.replaceWith($newPopoverTitle);
          trappedFocus = window.focusTrap($newPopoverTitle.parent()[0], {
            escapeDeactivates: true,
            focusOutsideDeactivates: true,
            clickOutsideDeactivates: true,
            initialFocus: $newPopoverTitle[0],
            onDeactivate: function() {
              $element.popover('hide');
            }
          });
        }
        trappedFocus.activate();
      });
      $element.on('hidden.bs.popover', function() {
        popoverIsVisible = false;
      });
    });
  });

  function outputUIActionLine(action, table) {
    var tmpl = new XMLTemplate(action.action_name ? 'listcompat_ui_action' : 'listcompat_ui_action_global');
    return tmpl.evaluate($j.extend({}, action, {
      table: table
    }));
  }

  function constructListItem(href, name, sr_text) {
    if (!name || !sr_text) return;
    var $span = $j('<span/>').addClass('sr-only').text(sr_text);
    if (href === '') {
      var $span_wrapper = $j('<span/>')
        .addClass('fix-link')
        .text(name);
      $span.prependTo($span_wrapper);
      return $span_wrapper.prop('outerHTML');
    } else {
      var $anchor = $j('<a/>')
        .addClass('navigation_link fix-link')
        .attr('href', href)
        .text(name);
      $span.prependTo($anchor);
      return $anchor.prop('outerHTML');
    }
  }

  function convertResultToCheck(param, listControlID, propertyName, propertyLabel) {
    var href = "";
    if (listControlID && listControlID != '-1') {
      href = 'sys_ui_list_control.do?sys_id=' + listControlID;
    } else if (propertyName) {
      href = 'sys_properties.do?sysparm_query=name=' + propertyName;
    }
    return param ? {
      rowStyle: 'hidden',
      style: 'icon-success-circle color-green',
      listItem: constructListItem('', propertyLabel, getMessage('Compatibility success'))
    } : {
      rowStyle: '',
      style: 'icon-error-circle color-red',
      listItem: constructListItem(href, propertyLabel, getMessage('Compatibility failure'))
    };
  }
})();;