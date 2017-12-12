var TourBuilderObjectDataFactory = Class.create();
TourBuilderObjectDataFactory.prototype = {
	_df : new TourBuilderGenericDataFactory(),
	
    initialize: function() {
    },
	
	/* get tour details **
	** input: args.tour_id - sys_id of tour under consideration
	** returns: sys_id of the tour if tour is active
	*/
	getTourdetails : function(args){
		
		var tourSysId = "";
		var query_params = [];
		gs.debug("START: calling Tour BuilderObjectDataFactory.getTourdetails");
		
		query_params.push({"column" : "sys_id", "value" : args.tour_id });
		query_params.push({"column":"active","value":true});
		tourSysId = this._df.getObjects({'table' :'sys_embedded_tour_guide', 'query_params' : query_params});
		
		return tourSysId;
	},
	
	/* get tour steps **
	** input: args.tour_id - sys_id of tour under consideration
	** returns: sys_id's of tour steps in comma separated string
	*/
	getToursteps : function(args){	
		var stepSysIds = "";
		var query_params = [];
		gs.debug("START: calling Tour BuilderObjectDataFactory.getToursteps" +  args.tour_id);	
		
		query_params.push({"column" : "guide", "value" : args.tour_id });
		query_params.push({"column":"active","value":true});
		stepSysIds = this._df.getObjects({'table' :'sys_embedded_tour_step', 'query_params' : query_params});
				
		return stepSysIds;
	},
	
	/* get entity data **
	** input: args - object containing query parameters
	** output: queried entity object
	*/
	getEntityData : function(args) {
		var sys_id = args.sys_id;
		var table = args.table;
		var override_columns = args.override_columns;
		var extract_reference_fields = args.extract_reference_fields;
		var reference_table_name = args.reference_table_name;
		var entityData = {};
		
		gs.debug("START: getEntityData");

		entityData = this._df.getObjectData({'sys_id':sys_id, 'table': table, 'override_columns': override_columns});

		gs.debug("END: getEntityData");
		return entityData;
	},
	
    type: 'TourBuilderObjectDataFactory'
};