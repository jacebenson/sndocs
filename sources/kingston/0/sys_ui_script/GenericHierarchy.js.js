/*
 * Supports the diagramming of generic hierarchies.
 */

var GenericHierarchy = Class.create(GwtDiagram, {

	initialize: function(container, processor) {
		GwtDiagram.prototype.initialize.call(this, container, processor);
        
        this.allowMoveNode = true;  
        this.allowDeleteNode = false;
		this.contextMenus = true;

		this.on("afterload", this._onDiagramLoad.bind(this));
		this.registerPathRouterFactory(this._pathRouterFactory.bind(this));
	},
	
	destroy: function() {
		GwtDiagram.prototype.destroy.call(this);
	},
	
	_pathRouterFactory: function() {
		if (this.getParam("route")=="false")
			return GwtDiagram.prototype._pathRouterFactory.call();
		else
			return new GwtManhattanRouteCurve();
	}, 
	
	load: function(attributes) {
		if (attributes)
			for (var i = 0; i < attributes.length; i++) {
				var attr = attributes[i].split('=');
				if (attr.length == 1)
					attr[1] = '';			
				this.setParam(attr[0], attr[1]);
				if (attr[0] == 'id')
					this.id = attr[1];
				else 
					if (attr[0] == 'baseid')
						this.baseid = attr[1];
					else 
						if (attr[0] == 'nocontext')
							this.contextMenus = false;
			}
		var layout = new GwtSugiyamaLayout(this, this.getParam("layout"));	
		layout.setFocus(this.baseid);
		var fontSize = this.getParam("font_size");
		if (fontSize)
			layout.setDefaultNodeFontSize(fontSize);
		var nodeWidth = this.getParam("node_width");
		var nodeHeight = this.getParam("node_height");
		if (nodeWidth && nodeHeight) {
			nodeWidth = parseInt(nodeWidth);
			nodeHeight = parseInt(nodeHeight);
			layout.setDefaultNodeSize(nodeWidth, nodeHeight);
		} else 
			layout.setDefaultNodeSize(200, 50);
		var spacing_x = this.getParam("spacing_x");
		var spacing_y = this.getParam("spacing_y");
		if (spacing_x && spacing_x) {
			spacing_x = parseInt(spacing_x);
			spacing_y = parseInt(spacing_y);
			layout.setSpacing(new GwtPoint(spacing_x, spacing_y));
		}
		GwtDiagram.prototype.load.call(this, layout);
	},

	_onDiagramLoad: function() {
		this._postLoad();
	},
	
	// activities that must be done after the load is completed
	_postLoad: function() {
		// adding contextual menus.
		if (this.contextMenus) {
			var nodeIds = this.getNodeIds();
			for (var i = 0; i < nodeIds.length; i++) {
				var node = this.getNode(nodeIds[i]);
				
				var action = new GwtDiagramAction();
				action.setOrder(100);
				action.setType(action.TYPE_MENU);
				action.setCondition("true");
				action.name = "Focus and Redraw";
				action.script = "reloadSelf('" + node.getID() + "');";
				action.addToNode(node);
				
				action = new GwtDiagramAction();
				action.setOrder(200);
				action.setType(action.TYPE_MENU);
				action.setCondition("true");
				action.name = "Edit";
				action.script = "this.diagram.editRecord('" + node.getID() + "');";
				action.addToNode(node);
				
				if (this.baseid != nodeIds[i]) { // cannot prune base node
					action = new GwtDiagramAction();
					action.setOrder(300);
					action.setType(action.TYPE_SEP);
					action.setCondition("true");
					action.addToNode(node);
					
					action = new GwtDiagramAction();
					action.setOrder(400);
					action.setType(action.TYPE_MENU);
					action.setCondition("true");
					action.name = "Prune";
					action.script = "this.diagram.pruneBranch(this.getID());";
					action.addToNode(node);
				}
			}
		}
	},
	
	pruneBranch: function(pruneNodeID) {
		var pruneNode = this.getNode(pruneNodeID);
		if (pruneNodeID != this.baseid) { // cannot prune base node
			var edgesFrom = this.getEdgesFrom(pruneNode);
			for (var i = 0; i < edgesFrom.length; i++) {
				var edge = edgesFrom[i];
				var targetNodeID = edge.getTargetID();
				this.pruneBranch(targetNodeID);
			}
			pruneNode.destroy();
		}
	},
	
	editRecord: function(sys_id){
		var iam = self;
		iam.location.href = this.getParam("record") + ".do?sys_id=" + sys_id;
	},
	
	/* ==============================================================================
	 *  Utility methods
	 * ============================================================================== */

    type: function() {
    	return 'GenericHierarchy';
    }
});

function reloadSelf(newBaseId, idName) {
   if (!idName)
      idName = "baseid";
	
   var href = window.location.href;
   var sysparm = "sysparm_attributes=";
   var p = href.indexOf(sysparm);
   if (p <= 0) {
   		alert("Missing " + sysparm);
   		return;
   }
   p += sysparm.length;
   var sysparmContent = href.substring(p);
   var p2 = sysparmContent.indexOf("&");
   if (p2 > -1)
   		sysparmContent = sysparmContent.substring(0, p2);

   var attributes = "";
   var oldAttributes = sysparmContent.split(',');
   var foundIt = false;
   for (var i = 0; i < oldAttributes.length; i++) {
		var attr = oldAttributes[i].split('=');
		if (attr.length == 1)
			attr[1] = '';	
		if (i > 0)
			attributes += ",";
		attributes += attr[0];		
		if (attr[0] == idName) {
			attributes += "=" + newBaseId;
			foundIt = true;
		} else {
			if (attr[1] != '') 
				attributes += "=" + attr[1];
		}
	}
   if (foundIt == false) {
   		if (attributes != "") 
   			attributes += ",";
		attributes += idName + "=" + newBaseId;
   }
   var new_href = href.substring(0,p) + attributes + "&sysparm_modified=true";
   window.location.href = new_href;
}