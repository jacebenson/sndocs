var ManifestFieldMap = Class.create();
(function () {
	ManifestFieldMap.prototype = {
		initialize: function (manifest) {
			var additionalFields = extractAdditionalFields(manifest);
			this._defaultMap = function (source) { return source; }
			this._maps = {
				"runtime_access_tracking": function (source, manifest) {
					var restrict = additionalFields["restrict_runtime_access"] || {};
					var mapped = {};
					mapped.field_name = source.field_name;
					mapped.value = !gs.nil(source.value) ||
						!!restrict.value ? "enforcing" : "";
					return mapped;
				},
				"restrict_runtime_access": function (source, manifest) {
					var mapped = {};
					mapped.field_name = "runtime_access_tracking";
					mapped.value = source.value ? "enforcing" : "";
					return mapped;
				}
			};
		},

		getMap: /*Function*/ function (/*String*/ sourceFieldName) {
			if (this._maps.hasOwnProperty(sourceFieldName))
				return this._maps[sourceFieldName];
			return this._defaultMap;
		},


		type: 'ManifestFieldMap'
	};
	
	function extractAdditionalFields(manifest) {
		var fieldsByName = {}, fieldList, field, i;
		if (!manifest.hasOwnProperty("additional_fields"))
			return {};
		
		fieldList = manifest.additional_fields;
		for (i = 0; i < fieldList.length; i++) {
			field = fieldList[i];
			fieldsByName[field.field_name] = field;
		}
		return fieldsByName;
	}
}());