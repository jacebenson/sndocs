(function () {		
	var start = $sp.getParameter('p') || gs.getUserID();

	// Default Values
	options.table_layout = options.table_layout || {margin: 4, maxSize: '{new go.Size(180, NaN)}'}
	options.row_layout = options.row_layout || {column: 0, stretch: '{go.GraphObject.Horizontal}', alignment: '{go.Spot.Left}'};
	options.node_layout = options.node_layout || {cursor: "pointer", isShadowed: true}
	options.user_background_color = options.user_background_color || 'lightblue';
	options.node_background_color = options.node_background_color || 'azure';
	options.url = options.url || '?id={page}&sys_id={sys_id}';
	options.line = options.line || {stroke: '#222'};
	options.page = options.page || 'user_profile';
	options.card_fields = options.card_fields || {
			name: {row: 0, column: 0, columnSpan: 2, font: 'bold 9pt sans-serif', alignment: '{go.Spot.Top}',  maxSize: '{new go.Size(160, NaN)}'},
			title: {row: 1, column: 0, columnSpan: 2, font: '8pt sans-serif'},
			department: {row: 2, column: 0, columnSpan: 2, font: '8pt sans-serif'},
			email: {row: 3, column: 0, columnSpan: 2, font: '8pt sans-serif'},
			phone: {row: 4, column: 0, columnSpan: 2, font: '8pt sans-serif'},
			location: {row: 5, column: 0, columnSpan: 2, font: '8pt sans-serif'}
	};

	options.tree_layout = options.tree_layout || {
				treeStyle: '{go.TreeLayout.StyleLastParents}',
				angle: 90,
				layerSpacing: 80,
				alternateAngle: 0,
				alternateAlignment: '{go.TreeLayout.AlignmentStart}',
				alternateNodeIndent: 20,
				alternateNodeIndentPastParent: 1,
				alternateNodeSpacing: 20,
				alternateLayerSpacing: 40,
				alternateLayerSpacingParentOverlap: 1,
				alternatePortSpot: '{new go.Spot(0, 0.999, 20, 0)}',
				alternateChildPortSpot: '{go.Spot.Left}'
			};

	options.picture_layout = options.picture_layout || {
		name: 'Picture',
		desiredSize: '{new go.Size(55, 65)}',
		margin: '{new go.Margin(2, 2, 2, 6)}',
		imageStretch: '{go.GraphObject.UniformToFill}'
	};


	createNodes(start);

	function createNodes() {
		var gr = new GlideRecord('sys_user');
		gr.get(start);
		data.start = start;
		data.name = gr.getDisplayValue('name');
		var n = data.nodes = [];
		// anchor user
		var u = getUser(gr);
		u.color = options.user_background_color;
		n.push(u);

		if (u.manager && gr.manager.active) {
			gr.get(u.manager);
			var m = getUser(gr);
			n.push(m);
			getSubs(u.manager, n, start);
		}

		getSubs(u.sys_id, n);

		function getSubs(manager, n, start) {
			var gr = new GlideRecord('sys_user');
			gr.addActiveQuery();
			gr.addQuery('manager', manager);
			gr.query();
			while (gr.next()) {
				var u = getUser(gr);

				if (start && u.sys_id == start)
					continue;

				n.push(u);
			}
		}

		function getUser(gr) {
			var u = {};
			$sp.getRecordDisplayValues(u, gr, 'sys_id,' + Object.keys(options.card_fields));
			$sp.getRecordValues(u, gr, 'manager');
			u.key = u.sys_id;

			var profile = new GlideRecord("live_profile");
			profile.addQuery("document", u.sys_id);
			profile.query();

			while (profile.next()){
				var photo = profile.getDisplayValue("photo");
				if (photo.length > 0) {
					u.photo = photo + '?t=small';
				}
			}

			u.color = options.node_background_color;
			return u;
		}
	}
})();
