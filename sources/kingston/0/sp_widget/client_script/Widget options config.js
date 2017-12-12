function($scope, $timeout) {
	var c = this;

	// modal form handling
	var data = null;
	var mf = this.data.modalForm;

	mf.options.beforeRender = function(d) {
		if ($scope.data.isInstance) {
			data = d;
			massageView(d.f);
			massageOptions(d.f);
			$scope.f = d.f; // need to $watch this data, put in scope
		}
	}
	

	mf.options.afterClose = function() {
		$scope.closePopovers();
		if (c.options.afterClose)
			c.options.afterClose();
		c.mf = null;
	}

	mf.options.afterOpen = function(modalController) {
		if (c.options.afterOpen)
			c.options.afterOpen.call(null, modalController);
	};
	
	mf.options.modalBodyClass = "widget-options-config";

	c.modalForm = mf;

	function modalController(instance){
		this.close = function(){
			instance.close();
		};

		return this;
	}

	// schema extension
	function massageView(form) {
		var c = $scope.data;
		var fields = c.field_list;
		var s = getSchema();
		if (!fields && !s) // no fields, no schema, don't change the view
			return;

		// cleaning up the sections based on the widget fields
		fields = fields.split(",");
		form._sections = removeExtraFields(form._sections, fields);
	}
	
	function removeExtraFields(formSections, fieldList) {
		var sections = JSON.parse(JSON.stringify(formSections));
		for (var sec in formSections) {
			sections[sec].columns[0].fields = []; // remove all the fields in that section
			for (var f in formSections[sec].columns[0].fields) {
				var fieldName = formSections[sec].columns[0].fields[f].name;
				if (fieldList.indexOf(fieldName) != -1) {
					var newField = {
							name : fieldName,
							type : 'field'
					};
					sections[sec].columns[0].fields.push(newField);
				}
			}
		}
		return sections;
	}

	function getSchema() {
		var s = $scope.data.option_schema;
		if (!s)
			return null;

		return JSON.parse(s);
	}

	function massageOptions(form) {
		if (!form._fields.widget_parameters) {
			var wp = form._fields.widget_parameters = {};
			wp.ed = {};
			wp.attributes = {};
			wp.visible = false;
			wp.displayValue = wp.value = $scope.data.wp || "";
		}

		// don't show widget_parameters field - options display individually
		form._fields.widget_parameters.visible = false;
		var s = getSchema();
		if (!s)
			return;

		var o = form._fields.widget_parameters.value;
		try {
			o = JSON.parse(o);
		} catch(e) {
			o = {};
		}

		addSchema(o , s , form);
		$timeout(setDependentValues);
	}

	function addSchema(o , s , form) {
		var v;
		var otherArray = [];
		for(var i in s) {
			// make a field
			var si = s[i];
			form._fields[si.name] = si;
			si.ed = si.ed || {};
			si.attributes = si.attributes || {};
			si.visible = true;
			si.displayValue = si.value = "";
			// PRB758382: add empty choice so select can show it for nil value
			if (si.choices && si.choices.length > 0)
				si.choices.unshift({value: "", label: c.data.emptyChoiceMsg});
			if (si.default_value) {
				si.placeholder = si.default_value;
				// PRB822604: for boolean option, show as checked if not in
				// widget_parameters but default value is true
				if (si.type == 'boolean')
					si.value = si.displayValue = si.default_value;
			}

			if (o[si.name]) {
				v = o[si.name];
				// user could have typed
				// zone: 'xxx'
				// but we store as
				// zone: {value: 'xxx'}
				
				if (v.hasOwnProperty('value')) {
					si.value = v.value;
					si.displayValue = v.displayValue;
				} else {
					si.value = si.displayValue = v;
				}
			}
			// allow for a name other than table
			if ('field_name' == si.type || 'field_list' == si.type) {
				si.dependentField = si.dependentField || 'table';
			}
			
			// put in view
			v = {};
			v.name = si.name;
			v.type = 'field';
			form._view.push(v);
			
			var found = false;
			if (si.section) {
				for (var sect in form._sections) {
					if (si.section == form._sections[sect].caption) {
						form._sections[sect].columns[0].fields.push(v);
						found = true;
						break;
					}
				}
			}
			
			if (!si.section || !found){
				otherArray.push(v);  // handing the empty section case, will not be needed if we make section mandatory
			}
			
			// watch each value
			var n = "f._fields." + si.name + ".value";
			$scope.$watch(n , watcher);
		}
		
		var sec = {
				visible: true,
				_bootstrap_cells: 6,
				_count: otherArray.length,
				columns:[{fields : otherArray}],
				caption: $scope.data.otherOptionsText
			};
		if (otherArray.length > 0) {
			form._sections.push(sec); 
		}
		
		// remove empty sections out of the view
		for (var emptySect = form._sections.length -1 ; emptySect >= 0 ; emptySect--) {
			var sectionLength = form._sections[emptySect].columns[0].fields.length;
			if (sectionLength == 0 || (sectionLength == 1 && form._sections[emptySect].columns[0].fields[0].name == 'widget_parameters'))
				form._sections.splice(emptySect,1);
		}
		$timeout(setDependentValues);
	}
	
	// glideform should have done this - nneded to load
	// the dropdowns for field_name and field_list types
	function setDependentValues() {
		angular.forEach(data.f._fields, function(field) {
			if (!field.dependentField)
				return;

			var n = field.dependentField;
			n = data.f._fields[n].value;
			field.dependentValue = n;
		})
	}

	// on each change, the JSON is rebuilt and put back into
	// rectangle widget_parameters field
	function watcher(nv, ov) {
		if (!angular.isDefined(nv))
			return;

		var s = getSchema();
		if (!s)
			return;

		var fields = data.f._fields;
		var o = fields.widget_parameters.value;
		try {
			o = JSON.parse(o);
		} catch(e) {
			o = {};
		}

		// whatever is in the schema goes in the widget_parameters
		s.forEach(function(si) {
			var v = o[si.name] || {}
			if (!v.hasOwnProperty('value'))
				o[si.name] = v = {};

			if (si.type == "integer")
				v.value = parseInt(fields[si.name].value);
			else
				v.value = fields[si.name].value;
			v.displayValue = fields[si.name].displayValue;
		})

		fields.widget_parameters.value = JSON.stringify(o, null, '\t');
	}
}