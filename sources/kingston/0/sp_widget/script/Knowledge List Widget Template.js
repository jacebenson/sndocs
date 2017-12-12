(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.useDocumentViewer = (gs.getProperty('sn_km_portal.glide.knowman.serviceportal.use_document_viewer', 'false') == 'true') && GlidePluginManager.isActive('com.snc.documentviewer');
	data.externalContentLabel = gs.getMessage(gs.getProperty('sn_km_intg.glide.knowman.external.ui_label_for_external_content', 'External Content')) || gs.getMessage('External Content');
})();