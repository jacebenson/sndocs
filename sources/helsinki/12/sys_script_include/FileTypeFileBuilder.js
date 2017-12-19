var FileTypeFileBuilder = (function() {
	
	return {
		newFile : function() {
			var file = {};
			var builder = {
				withId : valueSetter('id'),
				withName : valueSetter('name'),
				withSysId : valueSetter('sysId'),
				withAlternateName : valueSetter('alternateName'),
				addCustom : function (field, value) {
					if (!file.extra)
						file.extra = {};
					file.extra[field] = value;
					return builder;
				},
				build : function() {
					checkProperty('id');
					checkProperty('name');
					checkProperty('sysId');
					return file;
				}
			};
			
			return builder;
			
			function valueSetter(field) {
				return _.partial(setValue, field);
			}
			
			function setValue(field, value) {
				file[field] = value;
				return builder;
			}
			
			function checkProperty(propertyName) {
				if (typeof file[propertyName] === 'undefined')
					throw new Error("Property " + propertyName + " must be defined to build a file");
			}
		}
	}
	
})();