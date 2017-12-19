$j(function($) {
  $('#perspective_switcher').click(function(e) {
    if (gActiveContext) {
      contextHide();
      return;
    }
    var saveFavoriteLabel = function() {
      var label = getMessage('Automatically Add Favorites');
      if (window.autoSaveFavoritePreference)
        label += ' <span class="icon-check" style="padding-left: 10px;"></span>';
      return label;
    }();
    var gcm = new GwtContextMenu("context_perspectives_menu");
    gcm.clear();
    $('a[parent_id=perspectives]').each(function(index, item) {
      var name = item.innerHTML;
      if (item.href.split("=")[1] == "All")
        gcm.addHref(name, "window.location = '" + item.href + "'");
      else
        gcm.addHref(name, "window.location = '" + item.href + "'");
    });
    gcm.addLine();
    gcm.addHref(saveFavoriteLabel, '$j(window).trigger("toggle_auto_favorite")');
    gcm.addHref(getMessage('Refresh Navigator Title'), 'window.location = "navigator_change.do"');
    gcm.addHref(getMessage('Collapse all applications'), '$j(window).trigger("collapse_all")');
    gcm.addHref(getMessage('Expand all applications'), '$j(window).trigger("expand_all")');
    contextShow(e, gcm.getID(), -1, 0, 0);
    e.stopPropagation();
  })
  $('body').click(function(evt) {
    CustomEvent.fireAll('body_clicked', evt);
  })
  CustomEvent.observe("body_clicked", contextMenuHide);
})