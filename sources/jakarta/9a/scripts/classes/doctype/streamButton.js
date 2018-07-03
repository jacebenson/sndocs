/*! RESOURCE: /scripts/classes/doctype/streamButton.js */
$j(function($) {
      "use strict";
      var closeButtonPadding = 32;
      var isOpen = false;
      var wrapperSelector = '.list_wrap_n_scroll';
      $('.list_stream_button').click(function() {
        $('.list_stream_button').attr("aria-expanded", !isOpen);
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
            return !!window.top.g_navManager.option