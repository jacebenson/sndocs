function ($scope, glideFormFactory, $location, spUtil, $timeout) {
	var c = this;

	// save functionality
	c.save = function() {
		c.data.options.forEach(function (opt) {
			if (!opt.section) {
				opt.section = "other";
			}
			referenceToServer(opt);
			// transform choices
			choiceToServer(opt);
			var f = opt.field;
			if (f.value && opt.type !== 'glyphicon') {
				opt.value = f.value;
				opt.displayValue = f.displayValue;
			}
			delete opt.g_form;
			delete opt.field;
		})
		c.data.action = 'save';
		c.server.update().then(function() {
			addForms();
			c.data.action = '';
			$scope.saveMsg = "Saved";
			$timeout(function() {
				$scope.saveMsg = null;
			}, 2000);

			$scope.$emit('$sp.we20.options_saved', c.data.options);
		})
	}
	c.saveButtonSuffix = spUtil.getAccelerator('s');
	var deregister = $scope.$on('$sp.save', c.save);
	$scope.$on('$destroy', function() {deregister()});

	// add a new option
	c.add = function() {
		var option = {name: "", label: "", type: "string", section:""};
		c.data.options.push(option);
		addForms();
	}

	c.remove = function(opt, $index) {
		c.data.options.splice($index, 1);
	}

	// Automatically provide an ID that is based on the name of the widget
	c.updateName = function(opt, $index) {
		if (opt.name)
			return;

		opt.name = opt.label.toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
    .replace(/^-|-$/g, '');
	}

	c.fixName = function(opt) {
		if (!opt.name)
			return;

		opt.name = opt.name.toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
    .replace(/^-|-$/g, '');
	}
	
	c.onGlyphChange = function(opt) {
		opt.default_value = opt.field.value;
	}

	// a form for each option
	function addForms() {
		c.data.options.forEach(function(opt) {
			if (opt.g_form)
				return;

			opt.g_form = glideFormFactory.create($scope, 'sys_meta', '-2', opt.fields, null, null);
			choiceToClient(opt);
			if (opt.field)
				return;

			var r = opt.field = {};
			r.name = "_blank";
			r.label = "_blank";
			r.value = "";
			r.ed = {}
			r.type = opt.type;
			r.value = opt.value;
			r.displayValue = opt.displayValue;
			r.defaultValue = "";
			if (!opt.section) {
				opt.section = "other";
			}
			r.section = opt.section;
			//r.hint = opt.hint;
		})
	}

	function referenceToServer(opt) {
		if (opt.type != 'reference' && opt.type != 'glide_list')
			return;

		opt.ed = {};
		opt.ed.reference = opt.field.value;

		if (opt.type == 'glide_list')
			opt.display_value_list = [];
	}

	function choiceToServer(opt) {
		if (!opt.choices)
			return;

		opt.choices = opt.choices.split('\n');
		var c = [];
		opt.choices.forEach(function(ch) {
			var nc = {};
			nc.value = ch;
			nc.label = ch;
			c.push(nc);
		})
		opt.choices = c;
	}
	
	function changeSection(sectionValue, opt) {
		option.section.value = sectionValue;
	}

	function choiceToClient(opt) {
		if (!opt.choices)
			return;

		var t = [];
		opt.choices.forEach(function(ch){
			t.push(ch.value);
		})
		opt.choices = t.join("\n");
	}

	// field_name, field_list only available if rectangle has 'table' field
	c.type_options = [
		'string', 'boolean', 'integer', 'reference', 'choice', 'field_name', 'field_list', 'glide_list', 'glyphicon'
	]
	
	c.server.update().then(addForms);
	//c.SP_INSTANCE_CONFIG_VIEW_SYS = "0ce54027b33232007a6de81816a8dca1";
}