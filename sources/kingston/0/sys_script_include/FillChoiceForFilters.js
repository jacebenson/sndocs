var FillChoiceForFilters = Class.create();
FillChoiceForFilters.prototype = {
	initialize: function() {
	},
 
	fillChoice:function() {
		
		var compositeElement = new GlideCompositeElement(current.source_field, current.source_table);
		var ed = compositeElement.getTargetED();
		var grTarget = new GlideRecord(current.source_table);
		var isDatabaseView = grTarget.isView();
		var tableName = current.source_table;
		var columnName = ed.getColumnName();

		if(compositeElement.isSimple() && !isDatabaseView){//single field on table
			tableName = current.source_table;
		}else if (compositeElement.isSimple() && isDatabaseView){//single field on view
			tableName = ed.getChoiceTable();
		}else if (!compositeElement.isSimple()){ // Dotwalking field
			tableName = compositeElement.getTargetTD().getED().getName();;
		}

		var grp = GlideChoiceListGenerator(tableName,columnName).getRecordList();
		var gp = [];
		while(grp.next()) {
			gp.push('' + grp.getValue('sys_id'));
		}
		return 'sys_idIN' + gp.toString();
	},
   choiceWithoutExcludedItems:function(){
		var gp = [];
		var grpExclusions = [];
		var grFilter = new GlideRecord("sys_ui_hp_publisher");
		grFilter.addQuery('sys_id',current.sys_id);
		grFilter.query();

		while(grFilter.next()) {
			grpExclusions.push('' + grFilter.getValue('exclusion_choice_list'));
		}

		var compositeElement = new GlideCompositeElement(current.source_field, current.source_table);
		var ed = compositeElement.getTargetED();
	    var grTarget = new GlideRecord(current.source_table);
		var isDatabaseView = grTarget.isView();
	    var tableName = current.source_table;
		var columnName = ed.getColumnName();

		if(compositeElement.isSimple() && !isDatabaseView){//single field on table
			tableName = current.source_table;
		}else if (compositeElement.isSimple() && isDatabaseView){//single field on view
			tableName = ed.getChoiceTable();
		}else if (!compositeElement.isSimple()){ // Dotwalking field
			tableName = compositeElement.getTargetTD().getED().getName();;
		}

		var grp = GlideChoiceListGenerator(tableName,columnName).getRecordList();
		while(grp.next()) {
			gp.push('' + grp.sys_id);
		}
		return 'sys_idIN' + gp.toString()+'^sys_id NOT IN'+grpExclusions.toString();

	},

	referenceTableChoices:function(){
		var gp = [];
		var grpExclusions = [];
		var grFilter = new GlideRecord("sys_ui_hp_publisher");
		grFilter.addQuery('sys_id',current.sys_id);
		grFilter.query();

		while(grFilter.next()) {
			grpExclusions.push('' + grFilter.getValue('exclusion_choice_list'));
		}

		var grp = new GlideRecord(current.reference_table);
		grp.addQuery('sys_id','NOT IN',grpExclusions.toString());
		if(current.reference_conditions)
		  grp.addEncodedQuery(current.reference_conditions);
		grp.orderBy('sequence');
		grp.query();
		while(grp.next()) {
			gp.push('' + grp.sys_id);
		}
		return 'sys_idIN' + gp.toString();
	},


	type: 'FillChoiceForFilters'
};