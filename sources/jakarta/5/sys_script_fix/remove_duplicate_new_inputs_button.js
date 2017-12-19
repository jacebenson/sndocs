(function() {
	var gr = new GlideRecord("sys_ui_action");
	if (gr.get("5218846ac58343958d3a3d3faeccdff1")) {
		gr.deleteRecord();
	}
})();