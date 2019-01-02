var SPPageMapHelper = Class.create();
SPPageMapHelper.prototype = {
	initialize: function() {
	},

	getPageGR: function(gr) {
		if (gr.getTableName() == "sp_container")
			return gr.sp_page.getRefRecord();

		if (gr.getTableName() == "sp_page")
			return gr;
		
		if (gr.getTableName() == "sp_row")
			return this.getPageGRFromRowGR(gr);

		if (gr.getTableName() == "sp_column")
			return this.getPageGRFromColumnGR(gr);
		
		// we are a rectangle
		return this.getPageGRFromRectangleGR(gr);
	},

	getPageGRFromRectangleGR: function(rectGR) {
		return this.getPageGRFromColumnGR(rectGR.sp_column.getRefRecord());
	},
	
	getPageGRFromColumnGR: function(columnGR) {
		return this.getPageGRFromRowGR(columnGR.sp_row.getRefRecord());
	},

	getPageGRFromRowGR: function(rowGR) {
		if (!rowGR.sp_container.nil()) {
			var gr = new GlideRecord("sp_page");
			if (!gr.get(rowGR.sp_container.sp_page))
				return null;

			return gr;
		}

		if (!rowGR.sp_column.sp_row.nil())
			return getPageGRFromRow(rowGR.sp_column.sp_row);

		return null;
	},

	type: 'SPPageMapHelper'
};