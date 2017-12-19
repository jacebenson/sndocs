function($scope, $timeout) {
	var c = this;

	// modal form handling
	var data = null;
	var mf = this.data.modalForm;

	mf.options.beforeRender = function(d) {
		if (d.table == 'sp_instance'){
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

	c.modalForm = mf;

	function modalController(instance){
		this.close = function(){
			instance.close();
		};

		return this;
	}

	// schema extension
	function massageView(form) {
		var fields = $scope.data.field_list;
		var s = getSchema();
		if (!fields && !s) // no fields, no schema, don't change the view
			return;

		fields = fields.split(",");
		form._sections = null;
		form._view = [];
		fields.forEach(function(f) {
			var t = {
				name : f,
				type : 'field'
			}
			form._view.push(t);
		})
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

		// add schema
		var v;
		s.forEach(function (si) {
			// make a field
			form._fields[si.name] = si;
			si.ed = si.ed || {};
			si.attributes = si.attributes || {};
			si.visible = true;
			si.displayValue = si.value = "";
			if (si.default_value)
				si.placeholder = si.default_value;

			if (o[si.name]) {
				v = o[si.name];
				// user could have typed
				// zone: 'xxx'
				// but we store as
				// zone: {value: 'xxx'}
				console.log(v);
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
			// watch each value
			var n = "f._fields." + si.name + ".value";
			$scope.$watch(n , watcher);
		})
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