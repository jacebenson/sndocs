function PageMap($scope, $location, $rootScope) {
	function nodeSelectionChanged(node) {
		var evt = {};
		var d = node.data;
		evt.sys_id = d.sys_id;
		if (evt.sys_id == display_id)  // get called twice by gojs
			return; 

		evt.table = d.sys_class_name || d.table;
		display_id = evt.sys_id;
		$location.search('table', evt.table).search('sys_id', evt.sys_id).search('spa', 1);
		$rootScope.$broadcast('$sp.list.click', evt);
	}
	
  var display_id = $location.search().sys_id;
  $scope.page = {
		displayValue: $scope.data.title,
		value: $scope.data.id,
		name: 'page'
	};
	
	$scope.$on("field.change", function(evt, parms) {
		if (parms.field.name == 'page')
			changePage(parms.newValue);
	});
	
	function changePage(p){
		var path = $location.path();
		var searchParms = $location.search();
		$location.search({id: searchParms.id, p: p});
	}
	
	if ($scope.data.id) {
		var $go = go.GraphObject.make;  // for conciseness in defining templates
		var node_id = "page_map";
		var diagram =
				$go(go.Diagram, node_id, {
					initialAutoScale: go.Diagram.UniformToFill,
					// define the layout for the diagram
					layout: $go(go.TreeLayout, { nodeSpacing: 5, layerSpacing: 30 })
				});

		diagram.model = new go.TreeModel($scope.data.map);
		var font = "13px Helvetica, Arial, sans-serif";

		// Define a simple node template consisting of text followed by an expand/collapse button
		diagram.nodeTemplate = $go(go.Node, "Horizontal",
				{ selectionAdorned: false, selectionChanged: nodeSelectionChanged },  // this event handler is defined below
				$go(go.Panel, "Auto",
					$go(go.Shape, { strokeWidth: 3 }, 
							new go.Binding("stroke", "isSelected", function(s){
								if (s)
									return "#FFD247";
								else
									return null;
							}).ofObject(""),
							new go.Binding("fill", "table", function(t){ 
						switch(t){
							case "sp_widget":
								return "#0A5A9C";
							case "sp_instance":
								return "#2376BB";
							case "sp_page":
								return "#222";
							default:
								return "#999";
						}
					})),
					$go(go.TextBlock, { font: font, stroke: "white", margin: 3 },
						new go.Binding("text", "name"))
				 )
				//$go("TreeExpanderButton") // this was overkill for small diagrams
			 );

		diagram.select(diagram.findNodeForKey(display_id));

		// Define a trivial link template with no arrowhead
		diagram.linkTemplate = $go(go.Link, { selectable: false }, $go(go.Shape));  // the link shape

		// Resize the graph container height when the graph changes size
		diagram.addDiagramListener('DocumentBoundsChanged', function(){
			var diagramHeight = parseInt(diagram.documentBounds.height);
			jQuery("#" + node_id).height(diagramHeight);
		})
	}
}