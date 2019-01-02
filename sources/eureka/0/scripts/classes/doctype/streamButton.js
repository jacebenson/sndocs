$j(function($) {
  "use strict";
  var closeButtonPadding = 32;
  $('.list_stream_button').click(function() {
    var table = $('table.list_table[data-list_id]');
    var listid = table.attr('data-list_id');
    var query = table.attr('query');
    var url = "$stream.do?sysparm_table=" + listid + "&sysparm_nostack=yes&sysparm_query=" + query;
    var target = 'parent';
    if (shouldUseFormPane())
      target = 'form_pane';
    url += "&sysparm_link_target=" + target;
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
    var $div = $('<div class="list_stream_reader">' +
      '<div class="list_stream_plank_header">' +
      '<button class="list_stream_reader_close icon-cross icon-button"/> <span>' + getMessage('Activity Stream') + '</span>' +
      '</div>' +
      '	<iframe src="' + url + '"></iframe>' +
      '</div>');
    $('body').append($div);
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
  }
  $('body').on('click', '.list_stream_reader_close', function() {
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
});