var UserPreferences = (function() {
	var prefsTable = 'sn_devstudio_user_preferences',
		defaults = {};
	
	return {
		get: function(userId) {
			return _.values(_.extend(getDefaults(), getUserPreferences(userId)));
		},
		getPreference: function(userId, prefName) {
			var prefs = _.extend(getDefaults(), getUserPreferences(userId));
			return prefs[prefName] && prefs[prefName].value || '';
		},
		set: function(userId, prefs) {
			var gr = new GlideRecord(prefsTable);
			gr.addQuery('user', userId);
			gr.addQuery('preference', prefs.id);
			gr.query();

			if (!gr.next()) {
				gr.newRecord();
				gr.setValue('user', userId);
				gr.setValue('preference', prefs.id);
			}
		
			gr.setValue('value', prefs.value);
			return (gr.isNewRecord() ? gr.insert() : gr.update());		
		}
	};
	
	function getUserPreferences(userId) {
		var prefs = {},
			gr = new GlideRecord(prefsTable);
		gr.addQuery('user', userId);	
		gr.query();
		
		while (gr.next()) {
			if (!gr.preference.enabled)
				continue;
			prefs[gr.preference.name.toString()] = newPreferenceObject(gr);
		}
		return prefs;
	}
	
	function getDefaults() {
		if (_.isEmpty(defaults))
			defaults = getUserPreferences('');
		return defaults;
	}
	
	function newPreferenceObject(gr) {
		var pref = gr.preference;
		return {
			name: pref.name.toString(),
			value: gr.getValue('value'),
			id: pref.sys_id.toString(),
			label: pref.label.toString(),
			type: pref.type.toString(),
			category: pref.category.getDisplayValue(),
			enabled: pref.enabled,
			choices: pref.type.toString() === 'choice' ? getChoices(pref.allowed_values.toString()) : []
		};
	}
	
	function coerceToType(type, value) {
		switch (type) {
			case 'boolean':
				return value === 'true';
			case 'integer':
				return parseInt(value);
			default:
				return value;
		}
	}
	
	function getPreference(prefName) {
		var gr = new GlideRecord('sn_devstudio_studio_preferences');
		gr.addQuery('name', prefName);
		gr.query();
		if (gr.next())
			return gr.getUniqueValue();
	}
	
	function setValues(gr, userData) {
		_.each(userData, function(val, key) {
			gr.setValue(key, val);
		});
	}
	
	function getChoices(choices) {
		var retVals = [],
			translated = {
				Window: gs.getMessage('Window'),
				Tab: gs.getMessage('Tab')
			};
		
		try {
			retVals = _.map(JSON.parse(choices), function(choice) {
				return {
					label: translated[choice.label] || choice.label,
					value: choice.value
				};
			});
		} catch (e) {
			gs.debug('Error parsing user preferences: ', e.message);
		}
		
		return retVals;
	}
})();
