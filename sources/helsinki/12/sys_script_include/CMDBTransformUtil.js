var CMDBTransformUtil = Class.create();
CMDBTransformUtil.prototype = {
	initialize: function() {
		this.json = new JSON();
		this.dataSource = 'ImportSet';
		this.transformEntryTable = 'sys_transform_entry';
		this.CmdbAPI = SNC.IdentificationEngineScriptableApi;
	},
	
	// Identify and Reconcile given source record and transform map
	identifyAndReconcile: function(source, map, log) {
		var inputPayload = this.buildInputPayload(source, map);
		var outputPayload = this.CmdbAPI.createOrUpdateCI(this.dataSource, this.json.encode(inputPayload));
		log.info("Identification and Reconciliation Result: " + outputPayload);
	},
	
	// Builds inputPayload for given source record and transform map
	buildInputPayload: function(source, map) {
		var inputPayload = {};
		inputPayload.items = [];
		var item = {};
		item.className = map.target_table;
		item.values = this.getTransformValues(source, map.source_table);
		inputPayload.items.push(item);
		
		return inputPayload;
	},
	
	// Get values that need to be transformed for given source record
	getTransformValues: function(source, sourceTable) {
		var values = {};
		var entryGr = new GlideRecord(this.transformEntryTable);
		entryGr.addQuery('source_table', sourceTable);
		entryGr.query();
		while(entryGr.next()){
			var sourceField = entryGr.getValue('source_field');
			var targetField = entryGr.getValue('target_field');
			values[targetField] = source.getValue(sourceField);
		}
		
		return values;
	},
	
	type: 'CMDBTransformUtil'
};