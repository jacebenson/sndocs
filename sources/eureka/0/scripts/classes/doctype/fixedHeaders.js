CustomEvent.observe('list2_init', function(list2) {
  if (typeof $j == 'undefined')
    return;
  if (list2.getRelated() || window.g_form)
    return;
  if ($j('BODY').hasClass('non_standard_lists'))
    return;
  var enableStickyColumns = false;
  var numColsSticky = 2;
  var tableId = document.getElementById(list2.listID);
  var $cloneTable;

  function cloneHeader() {
    $j("#clone_table").remove();
    if (enableStickyColumns) {
      $j("#clone_table_columns").remove();
      $j("#clone_column_headers").remove();
    }
    var $origHeader = $j('thead', tableId).first();
    var $pageHeader = $j('tr.list_nav_top.list_nav').first();
    var pageHeaderHeight = $pageHeader.height();
    $pageHeader.css({
      'position': 'fixed',
      'width': '100%',
      'top': 0,
      'z-index': 10
    });
    $j('tr.list_nav_spacer').css({
      'height': pageHeaderHeight,
      'display': 'table-row'
    })
    var $header = $origHeader.first().clone();
    $cloneTable = $j(tableId).clone();
    $cloneTable.empty();
    $cloneTable.append($header);
    $cloneTable.attr('id', 'clone_table');
    $cloneTable.removeClass("list_table").addClass('list_table_clone');
    $cloneTable.css({
      'position': 'fixed',
      'width': $j(tableId).width(),
      'display': 'none',
      'top': pageHeaderHeight
    });
    $j(".list_v2").first().prepend($cloneTable);
    var originalHeaders = $j('thead th', tableId);
    var cloneHeaders = $j('#clone_table thead th');
    var widths = [];
    $j.each(originalHeaders, function() {
      widths.push($j(this).width());
    });
    $j.each(cloneHeaders, function(index, value) {
      $j(this).css({
        'width': widths[index]
      });
    });
    if (enableStickyColumns) {
      var curCol = 0;
      var rowHeights = [];
      var $cloneTableColumns = $j(tableId).clone();
      var $cloneOfClone = $cloneTable.clone();
      var $tableBody = $($cloneTableColumns).find('tbody');
      $cloneOfClone.attr('id', 'clone_column_headers');
      $cloneOfClone.css({
        "z-index": 1000
      });
      $cloneOfClone.find('thead').find('th').each(function() {
        curCol = curCol + 1;
        if (curCol > numColsSticky) {
          $j(this).remove();
        }
      });
      curCol = 0;
      $j(".list_v2").first().prepend($cloneOfClone);
      $cloneTableColumns.find('thead').find('tr').find('th').each(function() {
        curCol = curCol + 1;
        if (curCol > numColsSticky) {
          $j(this).remove();
        }
      });
      curCol = 0;
      $j(tableId).find('tbody').find('tr').each(function() {
        rowHeights.push($j(this).outerHeight());
      });
      $tableBody.find("tr").each(function(index) {
        $j(this).css('height', rowHeights[index]);
        $j(this).find('td').each(function() {
          curCol = curCol + 1;
          if (curCol > numColsSticky) {
            $j(this).remove();
          }
        })
        curCol = 0;
      });
      $cloneTableColumns.css({
        'position': 'absolute'
      });
      $cloneTableColumns.attr('id', 'clone_table_columns');
      $j(".list_v2").prepend($cloneTableColumns);
    }
  }

  function checkPosition() {
    var $table = $j(tableId);
    if (!$table.length) {
      return;
    }
    var scrollLeft = $j(document).scrollLeft();
    var margin = parseInt($j("body").css('margin-left'));
    var scrollTop = $j(window).scrollTop() + $j('tr.list_nav_top.list_nav').height();
    var offset = $table.offset();
    if (g_text_direction == "rtl") {
      $cloneTable.css({
        "right": margin + scrollLeft
      });
    } else {
      $cloneTable.css({
        "left": -scrollLeft + margin
      });
    }
    if (enableStickyColumns) {
      var $columns = $j("#clone_table_columns");
      var $columnHeaders = $j("#clone_column_headers");
      $columns.css({
        "left": offset.left,
        "top": offset.top
      });
      if (scrollLeft > offset.left) {
        $columns.css("left", scrollLeft);
        $columnHeaders.css("left", 0);
      }
    }
    if ((scrollTop > offset.top) && (offset.top + $table.height() > scrollTop)) {
      $cloneTable.css('display', 'block');
      if (enableStickyColumns) {
        $columnHeaders.css('display', 'block');
      }
    } else {
      $cloneTable.css('display', 'none');
      if (enableStickyColumns) {
        $columnHeaders.css('display', 'none');
      }
    }
  }
  cloneHeader();
  $j(window).scroll(checkPosition).trigger("scroll");

  function reclone(tableEl, list) {
    if (list && list.getRelated())
      return;
    cloneHeader();
    checkPosition();
  }
  CustomEvent.observe('listheadersearch.show_hide', reclone);
  CustomEvent.observe('fontsize.change', reclone);
  $j(window).resize(reclone);
  CustomEvent.observe('list.loaded', reclone);
});