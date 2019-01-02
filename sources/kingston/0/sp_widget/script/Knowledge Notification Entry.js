(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.show_menu_entry = false;
	data.portal_suffix = $sp.getPortalRecord().getValue('url_suffix');
	data.redirect_url_property = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.portal_url');
	data.show_menu_entry = (data.redirect_url_property == data.portal_suffix) || (data.portal_suffix == 'sp');
})();