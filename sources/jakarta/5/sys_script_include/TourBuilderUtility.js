var TourBuilderUtility = Class.create();
TourBuilderUtility.prototype = {
	_df : new TourBuilderGenericDataFactory(),
	_odf : new TourBuilderObjectDataFactory(),
	
	initialize: function() {
	},
	
	/* check if given tour_id corresponds to a valid tour **
	** input: tour_id - tour_id under consideration
	** returns: true/false
	*/
	
	isValidTour : function(tour_id){
		var args = {};
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		
		args.tour_id = tour_id;
		var tourSysId = this._odf.getTourdetails(args);
		
		if(tourSysId !== "")
			return true;
		
		return false;
	},
	
	/* fetch a tour object from tour_id **
	** input: tour_id - tour_id of the tour to be fetched
	** returns: object
	*/
	getTourObject : function(tour_id,objectFields){
		var tourObject = {};
		var overrideColumns = {};
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		
		for(var i=0;i<objectFields.length;i++)
			overrideColumns[objectFields[i]] = objectFields[i];
		
		if(gtbRecordingDisabled == "false")
			tourObject = this._df.getObjectData({'sys_id':tour_id, 'table':'tour_builder_guide', 'override_columns' : overrideColumns});
		else 
			tourObject = this._df.getObjectData({'sys_id':tour_id, 'table':'sys_embedded_tour_guide', 'override_columns' : overrideColumns});
		
		return tourObject;
	},
	
	tourNameExists : function(tour_name){
		if(this.getTourByName(tour_name)!=null)
			return true;
		else
			return false;
	},
	
	getTourByName : function(tour_name){
		var query_params = [];
		query_params.push({"column" : "name", "value" : tour_name });
		var tourRecord = this._df.getObjects({'table' :'sys_embedded_tour_guide', 'query_params' : query_params});
		
		if(tourRecord==='')
			return null;
		
		var tourObject = this._df.getObjectData({'sys_id':tourRecord, 'table': 'sys_embedded_tour_guide'});
		return tourObject;
	},
	
	isValidTourUrl : function(startUrl){
		
		var urlWhitelist = ['home'];
		
		var urlLength = startUrl.length;
		
		//if url is of the format 'abc.do?xxxx', e.g. 'incident.do?sys_id=abc'
		//truncate everythign after '?'
		if(startUrl.indexOf('?')>0){
			startUrl = startUrl.substring(0,startUrl.indexOf('?'));
			urlLength = startUrl.length;
		}
		
		//truncate string after and including '.do'
		if(startUrl.indexOf('.do')>0){
			//after truncation url should end with '.do'
			//following code intercepts error case scenarios e.g. '.doxx'
			if(startUrl.substring(startUrl.indexOf('.do'),startUrl.length)!='.do')
				return false;
			
			//ui page endpoints end with .do
			//therefore validate the startUrl for valid ui page endpoint before truncating .do
			if(this.isValidUiPageEndpoint(startUrl))
				return true;
			
			startUrl = startUrl.substring(0,startUrl.indexOf('.do'));
			urlLength = startUrl.length;
		}
		
		//truncate '_list' from end of string
		if(startUrl.indexOf('_list')>0){
			//after truncation url should end with '.do'
			//following code intercepts error case scenarios e.g. '_listxx'
			if(startUrl.substring(startUrl.indexOf('_list'),startUrl.length)!='_list')
				return false;
			
			startUrl = startUrl.substring(0,startUrl.indexOf('_list'));
			urlLength = startUrl.length;
		}
		
		//do not allow tour creation on tour_builder table itself
		if(startUrl.indexOf('tour_builder')==0)
			return false;
		
		//if startUrl corresponds to a valid table
		if(gs.tableExists(startUrl))
			return true;
		
		//if startUrl corresponds to a valid UI page
		if(this.isValidUiPageName(startUrl))
			return true;
		
		//if startUrl corresponds to a valid processor
		//note: to be un-commented when processor names are considered as valid Application Page Names
		/*
		if(this.isValidProcessorPath(startUrl)){
			return true;
		}
		*/
		
		//if startUrl corresponds to a valid whitelisted url
		if(urlWhitelist.indexOf(startUrl)>=0)
			return true;	
		
		return false;
	},
	
	isValidUiPageEndpoint: function(endpoint){
		var query_params = [];
		query_params.push({"column" : "endpoint", "value" : endpoint});
		var uiPageRecord = this._df.getObjects({'table' :'sys_ui_page', 'query_params' : query_params});
		
		if(uiPageRecord==='')
			return false;
		else
			return true;
	},
	
	isValidUiPageName : function(uipagename){
		var query_params = [];
		query_params.push({"column" : "name", "value" : uipagename});
		var uiPageRecord = this._df.getObjects({'table' :'sys_ui_page', 'query_params' : query_params});
		
		if(uiPageRecord==='')
			return false;
		else
			return true;
	},
	
	isValidProcessorPath: function(processorpath){
		var query_params = [];
		query_params.push({"column" : "path", "value" : processorpath});
		var processorRecord = this._df.getObjects({'table' :'sys_processor', 'query_params' : query_params});
		
		if(processorRecord==='')
			return false;
		else
			return true;
	},
	
	getActionSysid : function (elementObj) {
		var query_params = [];
		query_params.push({"column" : "table", "value" : elementObj.actionTable});
		query_params.push({"column" : "name", "value" : elementObj.actionName});
		var uiActionRecord = this._df.getObjects({'table' :'sys_ui_action', 'query_params' : query_params});
		
		if(uiActionRecord!==''){
			return uiActionRecord;
		}
			
		return "submit";
	},
	
	/* check if Guided tours tables are accessible from GTD
	** Access may be refused due to the table's cross-scope access policy or ACLs
	** GTD dependent upon all 3 guided tours tables, so check all
	** returns: true/false
	*/
	
	canGTDAccessGT : function(){
		var grTbl, canAccess = true;
		var gRecord = new GlideRecord('sys_db_object');
		if(gRecord.canRead()){
			var gr = gRecord.addQuery('name', 'sys_embedded_tour_guide');
			gr.addOrCondition('name', 'sys_embedded_tour_element');
			gr.addOrCondition('name', 'sys_embedded_tour_step');
			gRecord.query();

			while(gRecord.next()) {
				grTbl = new GlideRecord(gRecord.name);
				if(!grTbl.canRead() || !grTbl.canCreate() || !grTbl.canWrite() || !grTbl.canDelete() || !gRecord.read_access || !gRecord.create_access || !gRecord.update_access || !gRecord.delete_access || gRecord.access == "package_private"){
					canAccess = false;
					break;
				}
			}
		}
		return canAccess;
	},
	
	type: 'TourBuilderUtility'
};