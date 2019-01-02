var ScopedAdminMetadataChoiceTables = Class.create();
ScopedAdminMetadataChoiceTables.prototype = {
	initialize: function() {
	},
	
	process: function(tableName) {
		var sysMeta = GlideDBObjectManager.get().getAllExtensions("sys_metadata");
		
		answer = [];
		var l = sysMeta.size();
		for(var i = 0; i < l; i++) {
			var metaTable = sysMeta.get(i);
			if (!metaTable)
				continue;
			if (metaTable.indexOf("usageanalytics_count_cfg") == 0)
				continue;
			if (metaTable.startsWith("pwd_"))
				continue;
			if (metaTable.startsWith("jrobin_"))
				continue;
			if (metaTable.startsWith("round_robin_"))
				continue;
			
			answer.push(metaTable + '');
		}
		return answer;
	},
	
	type: 'ScopedAdminMetadataChoiceTables'
};