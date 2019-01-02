var GridCanvasLoader = Class.create();
GridCanvasLoader.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'GridCanvasLoader',

	isGridCanvas: function() {
		var sysId = this.getParameter('sysparm_sysId');
		var canvasLoader = new SNC.LayoutLoader();
		var boolResult = canvasLoader.isGridCanvas(sysId);
		var result = this.newItem("result");
        result.setAttribute("isGridCanvas", (boolResult) ? "1" : "0");
	},

	addPane: function() {
		var json = this.getParameter('sysparm_json');
		var canvasLoader = new SNC.LayoutLoader();
		var canvasPane = canvasLoader.addPane(json);
		var result = this.newItem("result");
        result.setAttribute("canvasPane", canvasPane);
	}

});