var WFStageSet = Class.create();
WFStageSet.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
    /**
     *  Returns the array of choices to display in the select dialog.
     */
    getSetNames: function() {
        var gr = new GlideRecord('stage_set');
		gr.orderBy('name');
        gr.query();
        var clx = [];
        while (gr.next()) 
            clx.push( {value: gr.sys_id+'', label: gr.name+''} );
        return clx;
    },

    exportStageSet: function() {

		// create the stage set
        var setName     = this.getParameter('sysparm_set_name');
        var workflowId  = this.getParameter('sysparm_workflow');
        var queryFilter = this.getParameter('sysparm_filter');
        var set = new GlideRecord('stage_set');
        if (set.get('name', setName))
            return "Error: set already exists";
		
        set.initialize();
        set.name = setName;
        set.insert();

		// create the stage set entries
		var setId = set.sys_id;
		var stage = new GlideRecord('wf_stage');
		stage.addQuery('workflow_version', workflowId);
		if (queryFilter != null)
		    stage.addEncodedQuery(queryFilter);
		stage.query();

		var entry = new GlideRecord('stage_set_entry');
		var toXlate = [];

		while (stage.next()) 
            toXlate.push( cloneStage(entry, stage) );
		
		this.cloneTranslations(toXlate, 'wf_stage', 'stage_set_entry');
		
		gs.addInfoMessage('Created stage set:' + setName);
        return "ok";

		
		function cloneStage(to, from) {
		    to.initialize();
            to.name  = from.name;
            to.value = from.value;
            to.order = from.order;
            to.ola   = from.ola;
            to.set   = setId;
            to.insert();
			return from.name+'';
        }		
		
    },
	
	/** Import the stage entries from the given stage set into the current workflow.
	 */
    importStageSet: function() {
        var stageSetId = this.getParameter('sysparm_set_id');
        var workflowId = this.getParameter('sysparm_workflow');
        var entry = new GlideRecord('stage_set_entry');
        entry.addQuery('set', stageSetId);
        entry.query();
		this.findExistingStages(workflowId);
		
		var toXlate = [];
		var stage = new GlideRecord('wf_stage');
        while (entry.next()) 
		    toXlate.push( this.cloneStage(stage, entry, workflowId) );

		// clone any tranlsated values that were imported
		this.cloneTranslations(toXlate, 'stage_set_entry', 'wf_stage');

        return "ok";
    },

	// clone any designated translations for records copied from one table to another.
	//
	// @param: xlateThese - Array of values to translate.  These are in the 'value' column of 
	//                      sys_translated but can represent any translated_field in any table.
	// @param: tableFrom  - name of the table we are cloning translations from.
	// @param: tableTo    - name of the table we are cloning transations into.
	//  
	cloneTranslations: function(xlateThese, tableFrom, tableTo) {			
	
	    // Filter the xlateThese down to only ones that have not already
	    // been translated.
		var toXlate = determineNamesToXlate(xlateThese, tableTo);

		// read any 'tableFrom' translations matching those in xlateThese 
		// which are not already translated
		var stageTranslation = new GlideRecord('sys_translated');
		stageTranslation.addQuery('name', tableFrom);
	    stageTranslation.addQuery('value', 'IN', toXlate);
		stageTranslation.query();

        // create new cloned translations associated wtih 'toTable'
		var newTranslation = new GlideRecord('sys_translated');
			
		while (stageTranslation.next()) 
		    this.createTranslation(newTranslation, tableTo, stageTranslation);

		function determineNamesToXlate(xlateThese, tableTo) {
		    var language = GlideSession.get().getLanguage();
		    var addThese = {};
		    for (var i = 0; i < xlateThese.length; i++) 
			    addThese[ xlateThese[i] ] = true;

			// find any already translated stage names and remove those
		    var xlate = new GlideRecord('sys_translated');
		    xlate.addQuery('language', language);
		    xlate.addQuery('name',     tableTo);   // table name
		    xlate.addQuery('element',  'name');
		    xlate.addQuery('value', 'IN', xlateThese);
		    xlate.query();
		
		    // skip any that have already been entered in sys_translated
		    while ( xlate.next() ) 
			    delete addThese[ xlate.value ];

			// return as array
			var toAdd = [];
			for (var x in addThese) 
				toAdd.push(x);
			
			return toAdd;
		}			
	},
			
	
	/** Import the choices (if any) from the dictionary choice list of the designated
	 *  stage-field column of the given workflow.
	 */
    importChoiceList: function() {
        var workflowId = this.getParameter('sysparm_workflow');
		this.findExistingStages(workflowId);
		
        var stageGR = new GlideRecord('wf_stage');
        var choiceListGR = this.getChoiceListForVersion(workflowId+'');
		if (choiceListGR == null) {
			gs.log('Cannot obtain GR for choicelist for workflow version:' + workflowId);
			return "error";
		}
		
		
		var translateGR = new GlideRecord('sys_translated');
		
        while (choiceListGR.next()) 
			if (choiceListGR.language == 'en')
			    this.cloneStage(stageGR, choiceListGR, workflowId);
			else 
				this.createTranslation(translateGR, 'wf_stage', choiceListGR);
		
        return "ok";
    },

	getChoiceListForVersion: function(versionId) {
		var version = new GlideRecord("wf_workflow_version");
		if (!version.get(versionId)) {
			gs.log("Cannot location workflow version: " + versionId);
			return null;
		}

		if (version.stage_field.nil()) {
			gs.log("No stage field set for workflow version:" + versionId);
			return null;
		}
		
		var choices = new GlideRecord("sys_choice");
		choices.addQuery("name",    version.table+'');		// note: name is 'Table' in UI
		choices.addQuery("element", version.stage_field+'');
		choices.query();
		return choices;
	},
	
	createTranslation: function(newTranslation, tableTo, source) {
		newTranslation.initialize();
		newTranslation.name     = tableTo;
		newTranslation.value    = source.value+'';
		newTranslation.label    = source.label+'';
		newTranslation.element  = 'name';
		newTranslation.language = source.language+'';
		newTranslation.insert();
	},
	
	/**
	 * Find existing stages for the designated workflow version id.
	 */
	findExistingStages: function(workflowId) {
		this.existing = {};
        var stage = new GlideRecord('wf_stage');
		stage.addQuery('workflow_version', workflowId);
		stage.query();
		while (stage.next()) 
			this.existing[stage.value+''] = stage.name+'';
		return this.existing;
	},
	
	/**
	 * Clone a stage from a source GR into the destination GR
	 * for the workflow version. 
	 *
	 * Before calling this function call findExistingStages(versionId)
	 * to locate any existing stages for a workflow version.
	 *
	 * @return: the 'name' of the stage that was cloned
	 */
    cloneStage: function(to, from, workflowId) {
		// if the stage exists in the target then do not clone it
        if (this.isExistingValue(from.value) || this.isExistingName(from.name))
			return null;

        to.initialize();
        to.name  = from.isValidField('label') ? from.label : from.name;
        to.value = from.value;
        to.order = from.order;
        to.ola   = from.ola;
        to.workflow_version = workflowId;
        to.insert();
		return to.name+'';
    },

	isExistingValue: function(valu) {
       return this.existing[valu] != undefined;
	},
	
	isExistingName: function(nam) {
		for (var valu in this.existing) 
           if (this.existing[valu] != undefined)
			   if (this.existing[valu] == nam)
				   return true;
	   return false;
	},
	
	/**
	 * @qry - the render properties for the list
	 * @return true if the Export and Import links can be displayed
	 */
	canShowLinks: function(rp) {
		var qry = rp.encodedQuery+'';
		var versionId = this.getWorkflowVersionFromQuery(qry);
		if (versionId == null)
			return false;

		var version = new GlideRecord("wf_workflow_version");
		if (!version.get(versionId)) {
			gs.log("Cannot load workflow version:" + versionId);
			return false;
		}
		
	    return true;
	},
	
	getWorkflowVersionFromQuery: function(qry) {
	    if (!qry)
		    return null;
	    var exps = qry.split("^");
	    for (var i = 0; i < exps.length; i++) {
	    	var exp = exps[i];
	    	var parts = exp.split('=');
	    	if (parts.length == 2 && parts[0].trim() == 'workflow_version' && parts[1].trim() != '')
	    		return parts[1].trim();
	    }
	    return null;
	},
	
    /**
	 *  From Ajax return a counter as follows:
	 *  1)  increment the column of the designated counter table (usually a parent record)
	 *  2)  return the incremneted value.
     */
    incrementCounter: function() {
        var counterTable    = this.getParameter('sysparm_table');
        var counterRecordId = this.getParameter('sysparm_sys_id');
        var counterColumn   = this.getParameter('sysparm_column');
        var incrementBy     = parseInt(this.getParameter('sysparm_increment'));
		if (isNaN(incrementBy))
			incrementBy = 100;
		
        var gr = new GlideRecord(counterTable);
        if (!gr.get(counterRecordId))
			gs.log('error, cannot find ' + counterTable + stageSetId);
	    gr.setValue( counterColumn, parseInt(gr.getValue(counterColumn))+ incrementBy);
		gr.update();
        return gr.autonumber;
    },
	
	/** 
	 * Build a ref-qualifier filter for all tables that are not already assigned a default stage set.
	 */
    filterTablesWithNoDefault: function() {
       var gr = new GlideRecord('stage_set_table');
       gr.query();
      
       var tablesWithDefaults = '';
       while (gr.next())
          tablesWithDefaults += ',' + gr.table;
	   var filter = tablesWithDefaults.length == 0 ? '' : 'sys_idNOT IN' + tablesWithDefaults.substr(1);
	   return filter;
    },

    type: 'WFStageSet'
});