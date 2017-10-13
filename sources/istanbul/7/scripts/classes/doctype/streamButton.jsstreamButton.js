/*! RESOURCE: /scripts/classes/doctype/streamButton.js */
$j(function($) {
  "use strict";
  var closeButtonPadding = 32;
  var isOpen = false;
  $('.list_stream_button').click(function() {
    if (!isOpen) {
      isOpen = true;
      var table = $('table.list_table[data-list_id]');
      var listid = table.attr('data-list_id');
      var query = table.attr('query');
      query = encodeURIComponent(query);
      var url = "$stream.do?sysparm_table=" + listid + "&sysparm_nostack=yes&sysparm_query=" + query;
      var target = 'parent';
      if (shouldUseFormPane())
        target = 'form_pane';
      url += "&sysparm_link_target=" + target;
      createStreamReader(url);
    } else {
      isOpen = false;
      var $readerDiv = $('.list_stream_reader');
      closeStreamReader($readerDiv);
    }
  });
  $(document).on('click', '.form_stream_button', function() {
    var url = "$stream.do?sysparm_table=" + g_form.getTableName();
    url += "&sysparm_sys_id=" + g_form.getUniqueValue();
    url += "&sysparm_stack=no";
    createStreamReader(url);
  });

  function shouldUseFormPane() {
    try {
      if (self == top)
        return false;
      if (window.top.g_navManager)
        return !!window.top.g_navManager.options.formTarget;
    } catch (e) {}
    return false;
  }

  function createStreamReader(url) {
    if ($('.list_stream_reader').length)
      return;
    var frame = '	<iframe src="' + url + '" id="list_stream_reader_frame"></iframe>';
    var $div = $('<div class="list_stream_reader">' +
      '<div class="list_stream_plank_header">' +
      '<span class="list_stream_reader_close"><i class="icon-double-chevron-right"></i></span><span>' + getMessage('Activity Stream') + '</span>' +
      '</div>' +
      frame +
      '</div>');
    $('body').append($div);
    $('#list_stream_reader_frame').bind('load', function() {
      if (NOW.compact) {
        $(this).contents().find('html').addClass('compact');
      }
      CustomEvent.observe('compact', function(newValue) {
        var method = newValue ? 'addClass' : 'removeClass';
        $('#list_stream_reader_frame').contents()
          .find('html')[method]('compact');
      })
    });
    resizeStreamReader($div);
    $(window).bind('resize.streamreader', function() {
      unfreezeTableWidth();
      if ($div.parent().length === 0) {
        $(window).unbind('resize.streamreader');
        return;
      }
      resizeStreamReader($div);
    })
  }

  function resizeStreamReader($div) {
    freezeTableWidth();
    var $body = $('body');
    var width = $div.outerWidth() + closeButtonPadding;
    $body.css({
      'padding-right': width,
      'position': 'absolute'
    });
    var top = 50;
    if (typeof g_form == 'undefined')
      top = $('.list_nav_spacer').offset().top;
    else
      top = $('.section_header_content_no_scroll').offset().top;
    $div.css('top', top);
    if ("ontouchstart" in window) {
      $div.css('absolute');
      window.scrollTo(0, top);
    }
  }
  $('body').on('click', '.list_stream_reader_close', function() {
    isOpen = false;
    var $readerDiv = $(this).closest('.list_stream_reader');
    closeStreamReader($readerDiv);
  });

  function closeStreamReader($readerDiv) {
    unfreezeTableWidth();
    $readerDiv.remove();
    var $body = $('body');
    $body.css({
      'position': '',
      'padding-right': 0
    });
  }

  function freezeTableWidth() {
    $('table.list_table').each(function(index, el) {
      var $el = $(el);
      var width = $el.width();
      $el.css('width', width);
    })
  }

  function unfreezeTableWidth() {
    $('table.list_table').each(function(index, el) {
      $(el).css('width', '');
    })
  }
});;