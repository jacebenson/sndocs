var grPortal = new GlideRecord("sys_portal");
grPortal.addNullQuery("page");
grPortal.query();
while (grPortal.next()) {
	var grCanvasPane = new GlideRecord("sys_grid_canvas_pane");
	if (grCanvasPane.isValid()) {
		grCanvasPane.addQuery("portal_widget", grPortal.getUniqueValue());
		grCanvasPane.query();
		if (grCanvasPane.next()) {
			var grCanvas = new GlideRecord("sys_grid_canvas");
			if (grCanvas.isValid() && grCanvas.get(grCanvasPane.getValue("grid_canvas"))) {
				grPortal.setValue("page", grCanvas.getValue("legacy_page"));
				grPortal.update();
			}
		}
	}
}