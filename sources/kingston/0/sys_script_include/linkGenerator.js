var linkGenerator = Class.create();
linkGenerator.prototype = {
    initialize: function() {},
	/**
	* Get generated links for a record
	* @param links array List of link_generator_mapping sys_id's to get generated links for
	* @param recordTable String table name of the record to generate links for
	* @param recordSysId String sys_id of the record to generate links for
	* @return Array List of generated links for a record
	*/
	getLinks: function(links, recordTable, recordSysId) {
		var linksArray = [];
		if (!links || !links.length)
			return linksArray;
		
		var linkMappingGr = new GlideRecord("link_generator_mapping");
		linkMappingGr.addActiveQuery();
		linkMappingGr.addQuery("sys_id", "IN", links.join(","));
		linkMappingGr.query();
		while (linkMappingGr.next()) {
			var link = this._createJSONRecord(linkMappingGr, recordTable, recordSysId);
			if (link)
				linksArray.push(link);
		}
		
		return linksArray;
	},
	getGeneratedURL:function(name){
		var linkGeneratorService = new GlideRecord('link_generator_service');
		linkGeneratorService.addQuery('value',name.toString());
		linkGeneratorService.query();
		if(linkGeneratorService.next()){
			var params = this._getScriptValueForGeneratedURL(linkGeneratorService); 
			var systemName = this._getSystemName(linkGeneratorService.sys_id).toString();
			var baseUrl = this._getBaseURL(systemName).toString();	
			return baseUrl+params;
		}
		return " ";
		
	},
	_getScriptValueForGeneratedURL:function(linkGeneratorService){
		var currentRecord = this._getCurrentSysUserRecord();
            var vars = {
                current: currentRecord
            };
            try {
                var evaluator = new GlideScopedEvaluator();
                var parameters = evaluator.evaluateScript(linkGeneratorService, 'script', vars);
                return parameters.toString();
            } catch (err) {
                gs.error("Error while evaluating the script " + err);
            }
	},
	_getCurrentSysUserRecord:function(){
		var currentRecord;
        currentRecord = new GlideRecord('sys_user');
        currentRecord.get(gs.getUserID());
        return currentRecord;
	},
    getActiveFormLinks: function(mappedfield, tableRecordSysId) {
        var tableName = mappedfield.substr(0, mappedfield.indexOf('.'));
        var field = mappedfield.substr(mappedfield.indexOf('.') + 1);
        var linkMapping = new GlideRecord('link_generator_mapping');
        linkMapping.addQuery('map_table', tableName);
        linkMapping.addQuery('map_field_name', field);
        linkMapping.addActiveQuery();
        linkMapping.query();
        var listOfActivelinks = [];
        while (linkMapping.next()) {
            var params = this._createJSONRecord(linkMapping, tableName, tableRecordSysId);
            listOfActivelinks.push(params);
        }
        return listOfActivelinks;
    },
    addAttributesTofield: function(col, table) {
        var tableHierarchy = SNC.TableEditor.getTableAncestors(table);
        var tables = new String(tableHierarchy);
        tables = tables.replace(/[\[\]']+/g, '');
        var parentTables = tables.split(',');
        var baseTable = parentTables[parentTables.length - 1];
        var updatedAttributes = new global.updateAttributesLinkGenerator().addAttributesTofield(col, table, parentTables, baseTable);
    },
    addAttributes: function(col, table) {
        var updatedAttributes = new global.updateAttributesLinkGenerator().addAttributesinSysDictionary(col, table);
    },
    _createJSONRecord: function(linkMapping, mappingItem, mappingItemSysid) {
        var iconImage = "";
        var linkGenerator_sys_id = linkMapping.link_generator.toString();
        var buttonName = linkMapping.btn_name.toString();
        var parameters = this._getScriptValue(linkGenerator_sys_id, mappingItem, mappingItemSysid);
        var systemName = this._getSystemName(linkGenerator_sys_id);
        var baseUrl = this._getBaseURL(systemName);
        var params = {};
        params.url = baseUrl + parameters;
        params.btnName = buttonName;
        return params;
    },
    _getScriptValue: function(linkGenerator_sys_id, mappingItemName, mappingItemSysId) {
        var linkService = new GlideRecord('link_generator_service');
        linkService.addQuery('sys_id', linkGenerator_sys_id);
        linkService.query();
        if (linkService.next()) {
            var currentRecord = this._getCurrentRecord(mappingItemName, mappingItemSysId);
            var vars = {
                current: currentRecord
            };
            try {
                var evaluator = new GlideScopedEvaluator();
                var parameters = evaluator.evaluateScript(linkService, 'script', vars);
                return parameters.toString();
            } catch (err) {
                gs.error("Error while evaluating the script " + err);
            }
        }
    },
    _getCurrentRecord: function(mappingItemName, mappingItemSysId) {
        if(mappingItemName){
					var currentRecord;
					currentRecord = new GlideRecord(mappingItemName);
					currentRecord.get(mappingItemSysId);
					return currentRecord;
		}
		return "";
    },
    _getSystemName: function(linkGenerator_sys_id) {
        var linkService = new GlideRecord('link_generator_service');
        linkService.addQuery('sys_id', linkGenerator_sys_id);
        linkService.query();
        if (linkService.next()) {
            return linkService.system_name.system_name.toString();
        }
        return null;
    },
    _getBaseURL: function(systemName) {
        var linkSource = new GlideRecord('link_generator_source');
        linkSource.addQuery('system_name', systemName);
        linkSource.query();
        if (linkSource.next()) {
            return linkSource.base_url.toString();
        }
        return null;
    },
    type: 'linkGenerator'
};
