/*! RESOURCE: /scripts/form_tags.js */
window.NOW.FormTags = (function($) {
      var $tagsMenu,
        $documentTags,
        $formTags,
        $tagsNumber,
        initialized = false;

      function init() {
        if (initialized) {
          return;
        }
        $tagsMenu = $('#tags_menu');
        $documentTags = $('#document_tags');
        $formTags = $('#form_tags');
        $tagsNumber = $('#tags_number');
        initialized = true;
        if ($documentTags.length == 0)
          return;
        $tagsMenu.click(function() {
          $formTags.toggle();
          CustomEvent.fire('frame.resized');
          $documentTags.find('input').show().parent().show();
          $documentTags.find('input').focus();
        });
        var url = new GlideURL("data_table.do");
        url.addParam('sysparm_type', 'labels');
        url.addParam('sysparm_table', $documentTags.attr('data-table'));
        url.addParam('sysparm_sys_id', $documentTags.attr('data-sys_id'));
        url.addParam('sysparm_action', 'existing_labels');
        url.addParam('nocache', (new Date().getTime().toString()));
        url = url.getURL();
        $.ajax({
          dataType: "json",
          url: url,
          success: _initializeResponseMenu
        });
      }

      function _initializeResponseMenu() {
        var t = arguments[2].responseText;
        var json = JSON.parse(t);
        $tagsNumber.attr("data-number", json.set.length);
        if (json.set.length > 0)
          $tagsNumber.text(json.