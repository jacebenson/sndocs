/*! RESOURCE: /scripts/doctype/deferred_related_lists.js */
$j(function($) {
  "use strict";
  if (window.NOW.concourseLists) {
    return;
  }
  var timeout = 50;
  var loadingTimeout = 3000;
  var loadingTimer = null;
  setTimeout(function() {
    if (!window.g_form || window.g_related_list_timing != 'deferred')
      return;
    getRelatedLists();
  }, timeout);
  $('.related-list-trigger').on('click', function() {
    $(this).closest('.related-list-trigger-container').hide();
    loadingTimeout = 0;
    getRelatedLists();
  })

  function getRelatedLists() {
    setupLoadingMessage();
    var deferred_start_time = new Date();
    var listContainer = $('#related_lists_wrapper');
    if (listContainer.length === 0)
      return;
    var url = new GlideURL('list2_deferred_related_lists.do');
    url.addParam('sysparm_table', g_form.getTableName());
    url.addParam('sysparm_keep_related_lists_open', 'true');
    url.addEncodedString('sysparm_sys_id=' + g_form.getUniqueValue().trim());
    url.addEncodedString('sysparm_view=' + $('#sysparm_view').val());
    if ($('#sysparm_domain'))
      url.addParam('sysparm_domain', $('#sysparm_domain').val());
    if ($('#sysparm_domain_scope'))
      url.addParam('sysparm_domain_scope', $('#sysparm_domain_scope').val());
    url.addParam('sysparm_stack', 'no');
    url.addParam('partial_page', 'related_lists');
    url.addEncodedString('sysparm_embedded=' + $('#sysparm_embedded').val());
    var ga = new GlideAjax(null, url.getURL());
    ga.getXML(function(response) {
      var deferred_responsetime = new Date();
      CustomEvent.fire('page_timing', {
        name: 'RLV2',
        child: 'Delay until load',
        ms: (deferred_responsetime - deferred_start_time)
      });
      var html = response.responseText;
      listContainer[0].innerHTML = html;
      html.evalScripts(true);
      CustomEvent.fire('partial.page.reload');
      CustomEvent.fire('list.initialize.tags');
      clearLoadingMessage();
      var lists_loaded_time = new Date();
      var deferred_loadtime = lists_loaded_time - deferred_start_time;
      CustomEvent.fire('page_timing', {
        name: 'RLV2',
        child: 'Network time',
        ms: (lists_loaded_time - deferred_responsetime)
      });
    });
  }
  CustomEvent.observe('list.loaded', function(table, list) {
    if (!table) {
      return;
    }
    if (!list) {
      return;
    }
    if (list.getReferringURL().indexOf('list2_deferred_related_lists.do') != -1 ||
      list.getReferringURL() == 'undefined')
      list.setReferringURL(window.location.pathname + window.location.search);
  });

  function setupLoadingMessage() {
    loadingTimer = setTimeout(function() {
      $('.related-list-loading').fadeIn();
    }, loadingTimeout)
  }

  function clearLoadingMessage() {
    if (loadingTimer)
      clearTimeout(loadingTimer);
    $('.related-list-loading').hide();
  }
});