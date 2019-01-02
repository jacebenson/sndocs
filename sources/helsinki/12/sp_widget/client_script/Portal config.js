function($scope, $rootScope, $timeout, $http){
	var c = this;

	$timeout(function(){
		c.initModel();
		c.initListeners();
	});

	c.isValidSysId = function(sys_id) {		
		return _.hasIn(c, "data.portal_id") ? (c.data.portal_id === sys_id) : false;
	}
		
	c.changePortal = function(portal_id) {
		if (c.data.portal_id && c.data.portal_id === portal_id) return;

		c.isPreviewLoading = false;
		c.previewPageUrl = null;
		c.canUndo = false;
		c.data.portal = null;
		c.data.portal_id = portal_id;

		c.server.update().then(function() {
			c.initModel();
		});
	}

	c.initModel = function(){
		c.undoModel = angular.copy(c.data.fieldModel);
		c.themePreviewPage = 'theme_preview';
		c.quickSetupPreviewPage = c.data.portal.homepage;
		c.setPagePreview(c.quickSetupPreviewPage, true);
		$scope.hasTagLineProperties = hasTagLineProperties();
	}

	c.initListeners = function() {
		$rootScope.$on("snImageUploader:complete", c.onUploadComplete); 
		$rootScope.$on("snImageUploader:delete", c.onUploadDelete); 
	}
	
	c.undo = function(){
		// Sets all of the fields back to their previous values
		c.data.doUndo = true;
		c.data.portal = null;
		c.canUndo = false;
		c.server.update().then(function(){
			c.data.doUndo = false;
			c.setPagePreview(c.activePreviewPage, true);
		});
	};

	c.activePreviewPage = null;
	c.setPagePreview = function (pageId, forceReload) {
		_.defer(setPagePreview, pageId, forceReload);
	};
	
	function setPagePreview(pageId, forceReload) {
		if (c.activePreviewPage == pageId && !forceReload)
			return;

		var url = null;
		c.activePreviewPage = pageId;
		if (angular.isDefined(pageId) && pageId != null && _.hasIn(c, "data.portal.url_suffix"))
			url = '/' + c.data.portal.url_suffix + '?id=' + pageId;
		$scope.$broadcast('this.renderPreviewPage', url);
	}

	// defer invoking until current call stack has clear, avoid blocking UI rendering
	
	
	c.refreshPreview = function(){
		var el = angular.element("iframe[data-portal-id='" + c.data.portal_id+ "']");
		var iframe = el.get(0);
		if (iframe)
			iframe.contentWindow.location.reload(true);
	}
	
	c.onLogoChange = function(g_form, field, oldValue, newValue) {
		c.canUndo = true;
		field.displayValue = newValue;
		$rootScope.$broadcast('this.setLogo', newValue.split('?')[0]);
	};

	c.onHeroChange = function(g_form, field, oldValue, newValue) {
		c.canUndo = true;
		$rootScope.$broadcast('this.setHero', c.data.fieldModel.hero.container, newValue.split('?')[0]);
	};

	c.onUploadComplete = function(event, sys_id, response) {
		if (!c.isValidSysId(sys_id)) return;
		c.refreshPreview();
	}
	
	c.onUploadDelete = function(event, sys_id) {
		if (!c.isValidSysId(sys_id)) return;
		c.refreshPreview();
	}
	
	var titleChangeBounce;
	c.onTitleChange = function(g_form, field, oldValue, newValue) {
		if (titleChangeBounce) $timeout.cancel(titleChangeBounce);
		titleChangeBounce = $timeout(function() {
			c.canUndo = true;
			$scope.$broadcast('sp.spEditableField.save', field);
			$rootScope.$broadcast('this.setTitle', newValue);
		}, 200);
	}

	var tagLineBounce;
	c.onTagLineChange = function(g_form, field, oldValue, newValue) {
		if (tagLineBounce) $timeout.cancel(tagLineBounce);
		tagLineBounce = $timeout(function() {
			$scope.$broadcast('sp.spEditableField.save', field);
			c.canUndo = true;
			$rootScope.$broadcast('this.refreshTagline', c.data.fieldModel.tagline.sys_id);
		}, 250);
	}

	var theme = $scope.theme = {};
	var delaySaveThemeCss = _.debounce(saveThemeCss, 500);
	
	theme.logoPaddingX = function(val) {
		val = _.isNil(val) ? c.data.cssVariables['$sp-logo-margin-x'] : val;
		val = parseNumber(val, 0);
		return val;
	}

	theme.logoPaddingY = function(val) {
		val = _.isNil(val) ? c.data.cssVariables['$sp-logo-margin-y'] : val;
		val = parseNumber(val, 0);
		return val;
	}
	
	$scope.setLogoPaddingX = function(event, value) {		
		c.data.cssVariables['$sp-logo-margin-x'] = value + 'px';
		delaySaveThemeCss();
	}
	
	$scope.setLogoPaddingY = function(event, value) {		
		c.data.cssVariables['$sp-logo-margin-y'] = value + 'px';
		delaySaveThemeCss();
	}	
	
	$scope.setThemeProp = function(g_form, field, oldValue, newValue) {
		var v = c.data.cssVariables[field.name];
		if (v == newValue)
			return;
		c.data.cssVariables[field.name] = newValue;
		delaySaveThemeCss();
	}

	function hasTagLineProperties() {
		return _.hasIn(c, "data.fieldModel.tagline.field") || 
			_.hasIn(c, "data.fieldModel.taglineColor") || 
			_.hasIn(c, "data.fieldModel.homepageBackgroundColor") || 
			_.hasIn(c, "data.fieldModel.hero.field");
	}
	
	var saving = false;
	var saveTimeout;
	
	function saveThemeCss() {
		if (saving) return;
		if (_.isNil(c.data.portal_id)) {
			console.warn("Save: portal_id is undefined");
			return;
		}
						
		$timeout.cancel(saveTimeout);
		saveTimeout = $timeout(function(){
			c.canUndo = true;
			saving = true;
			var data = {css_variables: getFlatCssVariables()};
			$http.put('/api/now/ui/table_edit/sp_portal?sysparm_records='+ c.data.portal_id +'&sysparm_view=default&sysparm_fields=css_variables', data).success(function(){
				$rootScope.$broadcast('this.resetPageCss');
				saving = false;
			});
		}, 0);
	}

	function getFlatCssVariables() {
		var out = "";
		for (var key in c.data.cssVariables){
			var val = c.data.cssVariables[key];
				out += key + ': ' + val + ';\n';
		}
		return out;
	}
	
	function getDescendantProp(obj, key) {
			var arr = key.split(".");
      while(arr.length && (obj = obj[arr.shift()]))
			return obj;
	}

	function parseNumber(val, defaultValue) {
		if (_.isNil(val) || _.isEmpty(val))
			return defaultValue;		
		
		val = _.isString(val) ? parseInt(val, 10) : val;
		val = _.isNaN(val) ? defaultValue : val;	
		return val;
	}
}