function ($scope, spUtil, $location, $timeout, $window, $rootScope, $uibModal, spPreference, $compile) {
	var c = this;
	var specialCodeBlocks = ['documentation', 'preview'];

	setReadOnly();
	c.isReadOnly = function(value) {
		return c.readOnly || value;
	}

	c.codeBlocks = {
		template: {title: $scope.data.htmlBlockMsg, display: true, type: 'html', enabled: true},
		css: {title: $scope.data.cssBlockMsg, display: false, type: 'css', enabled: true},
		client_script:{ title: $scope.data.clientScriptMsg, display: true, type: 'script', enabled: true},
		script:{title: $scope.data.serverScriptMsg, display: true, type: 'script', enabled: true},
		link: {title: $scope.data.linkMsg, display: false, type: 'script', enabled: true},
		demo_data: {title: $scope.data.demoDataMsg, display: false, type: 'script', enabled: false},
		preview: {title: $scope.data.previewMsg, display: false, widget: true, enabled: true},
		documentation: {title: $scope.data.docMsg, display: false, mode: 'preview', edit: false, enabled: true}
	}

	c.getCodeBlocks = function() {
		var result = {};
		angular.forEach(c.codeBlocks, function(value, key) {
			if (!~specialCodeBlocks.indexOf(key)) {
				result[key] = value;
			}
		});
		return result;
	}

	c.demoOptions = {mode: 'JSON'};
	c.transition = {event: '$sp.widget-edit-panel-css-transition-end'};
	c.updated = true;
	c.codeHasChanged = false;
	c.data.updatedDocContent = c.data.docContent;
	$scope.$watch("c.data.docContent", function() {
		c.data.updatedDocContent = c.data.docContent;
	})

	c.saveLayout = function() {
		var str = c.data.layoutPref || "{}";
		var layout = JSON.parse(str);

		var codeBlocks = c.codeBlocks;
		angular.forEach(codeBlocks, function(codeBlock, key) {
			layout[key] = c.codeBlocks[key].display;
		});

		c.data.layoutPref = JSON.stringify(layout);
		spPreference.set("wep-layout", c.data.layoutPref);
	};

	c.closeBlock = function(section) {
		section.display = false;
		c.saveLayout();
	}

	c.closeDep = function(dependency, type) {
		dependency.show = false;
		$rootScope.$broadcast('$sp.wep-' + type, 'close', c.data.sys_id);
	}

	function loadLayout() {
		var str = c.data.layoutPref || "{}";
		var layout = JSON.parse(str);

		c.codeBlocks.demo_data.enabled = (c.data.f._fields.has_preview.value == 'true') ? true : false;

		if (layout.documentation)
			c.codeBlocks.documentation.display = layout.documentation;

		angular.forEach(layout, function(display, key) {
			if (c.codeBlocks[key])
				c.codeBlocks[key].display = display;
		});
		
		var oneVisible = false;
		angular.forEach(c.codeBlocks, function(codeBlock, key) {
			if (c.codeBlocks[key].display == true)
				oneVisible = true;
		});
		if (!oneVisible) {
			c.codeBlocks.template.display = true;
			c.codeBlocks.client_script.display = true;
			c.codeBlocks.script.display = true;
		}
	}

	//prevent the config options dropdown when an input checkbox is clicked.
	$('.config-dropdown').click(function(e) {
		e.stopPropagation();
	});

	function setReadOnly() {
		c.readOnly = (c.data.sys_id && c.data.canRead && c.data.f._fields.template.sys_readonly);
	}

	function setPageTitle(){
		$window.document.title = (c.data.title) ? '${Editing:} ' + c.data.title : '${Widget Editor}';
	}

	function transition() {
		$timeout(function() {
			$rootScope.$broadcast(c.transition.event);
		}, 100);
	}

	function setUrlParams(list) {
		var s = $location.search();
		for (var x in list)
			s[x] = list[x];
		s.spa = 1;
		$location.search(s).replace();
	}

	setPageTitle();
	var search = $location.search();

	// for the widget picker
	c.ed_widget = {
		displayValue: c.data.title,
		value: c.data.sys_id,
		name: 'widget'
	}

	$scope.$on('field.change', function(evt, params) {
		if (params.field.name != 'widget')
			return;

		c.codeBlocks.documentation.edit = false;
		c.codeBlocks.documentation.mode = 'preview';
		c.codeHasChanged = false;
		c.data.sys_id = params.newValue;
		c.data.action = 'get';
		c.server.update().then(function() {
			loadLayout();
			c.updated = false;
			$timeout(function() {
				c.updated = true;
				setReadOnly();
				setPageTitle();
				$rootScope.$broadcast('$sp.wep-provider', 'clear');
				$rootScope.$broadcast('$sp.wep-provider', 'load');
				
				$rootScope.$broadcast('$sp.wep-template', 'clear');
				$rootScope.$broadcast('$sp.wep-template', 'load');
				
				$scope.$broadcast('$sp.preview', 'reload');
				transition();
			});

		});

		if (params.newValue.length > 0) {
			setUrlParams({sys_id: c.data.sys_id});
		}
	})

	c.saveButtonSuffix = spUtil.getAccelerator('s');

	c.save = function() {
		$scope.status = '${Saving}';
		$scope.data.action = 'save';
		
		$rootScope.$broadcast('$sp.wep-provider', 'save', c.data.sys_id);		
		$rootScope.$broadcast('$sp.wep-template', 'save', c.data.sys_id);
		
		$scope.server.update().then(function(data) {
			$scope.$broadcast('$sp.preview', 'reload');
			spUtil.addTrivialMessage('Saved');
			$scope.status = 'Saved';

			$timeout(function() {
				c.status = "";
			}, 1500);
		}, function(error) {
			spUtil.addErrorMessage($scope.data.errorMsg + ": " + error.status + " " + error.statusText);
		})
	}

	c.toggle = function(type) {
		c.codeBlocks[type].display = !c.codeBlocks[type].display;

		if (type === 'preview')
			c.codeBlocks.demo_data.enabled = c.codeBlocks.preview.display;

		c.saveLayout(type, c.codeBlocks[type].display);
	}

	c.docToggleMode = function() {
		c.codeBlocks.documentation.mode = (c.codeBlocks.documentation.mode === 'preview') ? 'edit' : 'preview';
		$rootScope.$broadcast('$sp.widget-edit-panel-toggle-mode', c.codeBlocks.documentation.mode);
	}

	c.docEdit = function() {
		c.codeBlocks.documentation.edit = true;
		c.codeBlocks.documentation.mode = 'edit';
		transition();
	}

	var instance;  // modal instance

	c.add = function() {
		var options = {
			size: 'sm',
			scope: $scope,
			templateUrl: 'add-widget-modal.html'
		};

		instance = $uibModal.open(options)
	}

	c.clone = function() {
		var options = {
			size: 'sm',
			scope: $scope,
			templateUrl: 'clone-widget-modal.html'
		}

		instance = $uibModal.open(options);
		instance.result.then(function() {}, function() {
			$rootScope.$broadcast("widget_clone_modal_close");
		});
	}

	c.cancel = function() {
		instance.dismiss('cancel');
	}

	c.editOptionSchema = function(event){
		var myModalCtrl;
		event.preventDefault();
		event.stopPropagation();
		var unregister = $scope.$on('$sp.we20.options_saved', function(event, savedOptions){
			c.data.f._fields.option_schema = savedOptions;
			myModalCtrl.close();
		});

		var myModal = angular.copy($scope.data.widgetOptionSchemaModal);
		myModal.options.afterOpen = function(ctrl){
			myModalCtrl = ctrl;
		};
		myModal.options.afterClose = function() {
			unregister();
			c.widgetOptionSchemaModal = null;
			myModalCtrl = null;
		};
		c.widgetOptionSchemaModal = myModal;
	}

	var deregister = $scope.$on('$sp.save', c.save);
	$scope.$on('$destroy', function() {deregister()});
	if (c.data.sys_id)
		loadLayout();
	
	// data shared with empty state widget
	var shared = c.data['x-we-empty-state'].options.shared;
	shared.ed_widget = c.ed_widget;
	shared.add = c.add;
}