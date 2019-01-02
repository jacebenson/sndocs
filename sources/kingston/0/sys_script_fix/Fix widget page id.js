// Find the corresponding "sys_portal_page" sys_id for every "sys_portal" widget where "page" field is empty.
var grPortal = new GlideRecord('sys_portal');
grPortal.addNullQuery('page');
grPortal.query();
while (grPortal.next()) {
	var grCanvasPane = new GlideRecord('sys_grid_canvas_pane');
	grCanvasPane.addQuery('portal_widget', grPortal.getUniqueValue());
	grCanvasPane.query();
	if (grCanvasPane.next()) {
		var grCanvas = new GlideRecord('sys_grid_canvas');
		if (grCanvas.get(grCanvasPane.getValue('grid_canvas'))) {
			grPortal.setValue('page', grCanvas.getValue('legacy_page'));
			grPortal.update();
		}
	}
}