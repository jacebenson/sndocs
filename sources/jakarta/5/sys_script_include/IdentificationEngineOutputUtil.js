var IdentificationEngineOutputUtil = Class.create();
IdentificationEngineOutputUtil.prototype = {
    initialize: function(output) {
		this.json = new JSON();
		this.result = this.json.decode(output);
		this.Unknown = 'Unknown';
    },

	// Get all sys_ids of items returned in output payload
	getAllItems: function() {
		var sysIds = [];
        if (!JSUtil.nil(this.result)) 
			sysIds = this.getSysIds(this.result.items);
    return sysIds;
	},
	
	// Get all sys_ids of relations returned in output payload
	getAllRelations: function() {
		var sysIds = [];
        if (!JSUtil.nil(this.result)) 
			sysIds = this.getSysIds(this.result.relations);
    return sysIds;
	},

	// Get all errors of items returned in output payload
	getItemErrors: function() {
		var errors = [];
        if (!JSUtil.nil(this.result)) 
			errors = this.getErrors(this.result.items, -1);
    return errors;
	},
	
	// Get errors of specific item returned in output payload
	getErrorsForItem: function(index) {
		var errors = [];
        if (!JSUtil.nil(this.result)) 
			errors = this.getErrors(this.result.items, index);
    return errors;
	},
	
	// Get all errors of relations returned in output payload
	getRelationErrors: function() {
		var errors = [];
        if (!JSUtil.nil(this.result)) 
			errors = this.getErrors(this.result.relations, -1);
    return errors;
	},
	
	// Get errors of specific relation returned in output payload
	getErrorsForRelation: function(index) {
		var errors = [];
        if (!JSUtil.nil(this.result)) 
			errors = this.getErrors(this.result.relations, index);
    return errors;
	},
	
	// Get related sys_ids returned in output payload
	getRelatedSysIds: function() {
		var sysIds = [];
        if (!JSUtil.nil(this.result) && !JSUtil.nil(this.result.items)) {
			for (var i = 0; i < this.result.items.length; i++) {
				var item = this.result.items[i];
				if (!JSUtil.nil(item.relatedSysIds)) {
 					for (var j = 0; j < item.relatedSysIds.length; j++) {
						sysIds.push(item.relatedSysIds[j]);
					}
				}
			}
		}
    return sysIds;
	},
	
	// Get all duplicate indices returned in output payload
	getDuplicateIndices: function() {
		var indices = [];
        if (!JSUtil.nil(this.result) && !JSUtil.nil(this.result.items)) {
			for (var i = 0; i < this.result.items.length; i++) {
				var item = this.result.items[i];
				if (!JSUtil.nil(item.duplicateIndices)) {
 					for (var j = 0; j < item.duplicateIndices.length; j++) {
						indices.push(item.duplicateIndices[j]);
					}
				}
			}
		}
    return new ArrayUtil().unique(indices);
	},
	
	// Get sys_ids of CI's that has a relationship with given sys_id as mentioned in output payload
	getCIsWithRelations: function(sysId) {
		var sysIds = [];
        var gr = new GlideRecord('cmdb_rel_ci');
		var relSysIds = this.getAllRelations();
		for (var i = 0; i < relSysIds.length; i++) {
			var relSysId = relSysIds[i];
			if (gr.get(relSysId)) {
				if (gr.getValue('parent') === sysId)
					sysIds.push(gr.getValue('child'));
				else if (gr.getValue('child') === sysId)
					sysIds.push(gr.getValue('parent'));
			}
		}

    return new ArrayUtil().unique(sysIds);
	},
	
	getSysIds: function(list) {
		var sysIds = [];
        if (!JSUtil.nil(list)) 
		{
		    for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item.sysId != this.Unknown) 
                sysIds.push(item.sysId);
		    }
		}
    return sysIds;
	},
	
	getErrors: function(list, index) {
		var errors = [];
        if (!JSUtil.nil(list)) 
		{
			if (index >= 0 && index < list.length) {
				var item = list[index];
				return this.getFormatedErrors(item);
			}
			else {
				for (var i = 0; i < list.length; i++) {
					var itemOne = list[i];
					var itemOneErrs = this.getFormatedErrors(itemOne);
					for (var j = 0; j < itemOneErrs.length; j++) {
						errors.push(itemOneErrs[j]);
					}
				}
			}
				
		}
    return errors;
	},
	
	getFormatedErrors: function(item) {
		var errors = [];
		if (!JSUtil.nil(item.errors)) {
            item.errors.forEach(function(error) {
				errors.push(error.error + ': ' + error.message);
            });
		}
		return errors;
	},
	
    type: 'IdentificationEngineOutputUtil'
};