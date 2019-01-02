var PwdVerificationParameterUtility = Class.create();
PwdVerificationParameterUtility.prototype = {
	initialize: function() {
	},
	
	/*
	Delete all the parameters related to this verification
	except the paramaters given as an array
 	*/
	clearOthers: function(params) {
		if (params == undefined)
			return;
		
		var g = new GlideRecord('pwd_verification_param');
		g.addQuery('verification', current.sys_id);
		for (var index in params) {
			g.addQuery('name', '<>', params[index]);			
		}
		g.query();
		g.deleteMultiple();
	},
	
	/**
	property: system property name for default value
	order: the order of the parameter
	desc: description of the parameter
 	*/
	addParamWithProperty: function(param, property, order, desc) {
		var g = new GlideRecord('pwd_verification_param');
		g.addQuery('verification', current.sys_id);
		g.addQuery('name', param);
		g.query();
		if (!g.next()) {
			var p = new GlideRecord('pwd_verification_param');
			p.initialize();
			p.setValue('name', param);
			p.setValue('verification', current.sys_id);
			
			if (property) {
				p.setValue('value', GlideProperties.get(property,'0'));
			}
			if (order) {
				p.setValue('order', order);
			}
			if (desc) {
				p.setValue('description', desc);
			}
			return p.insert();
		}
		return false;
	},
	
	/**
	value: value to be set for the parameter
	order: the order of the parameter
	desc: description of the parameter
 	*/
	addParamWithValue: function(param, value, order, desc) {
		var g = new GlideRecord('pwd_verification_param');
		g.addQuery('verification', current.sys_id);
		g.addQuery('name', param);
		g.query();
		if (!g.next()) {
			var p = new GlideRecord('pwd_verification_param');
			p.initialize();
			p.setValue('name', param);
			p.setValue('verification', current.sys_id);
			
			if (value) {
				p.setValue('value', value);
			}
			if (order) {
				p.setValue('order', order);
			}
			if (desc) {
				p.setValue('description', desc);
			}
			return p.insert();
		}
		return false;
	},
	// returns true/false whether the column on the table exists in the system
	validateColumnExists:  function(table, column) {
		var tableGr = new GlideRecord(table);
		var columnExists = tableGr.isValidField(column);
		tableGr.close();
		return columnExists;
	},
	
	isInteger:function (text) {
		return /^-{0,1}\d+$/.test(text);
	},
	
	
	isPositiveInteger:function(text) {
		return /^[0-9]\d*$/.test(text);
	},
	contains: function(list, value) {
		for (var index in list) {
			if (list[index] == value) {
				return true;
			}
		}
		return false;
	},
	
	type: 'PwdVerificationParameterUtility'
}