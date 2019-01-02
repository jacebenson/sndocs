function ($scope, $http, nowServer, $timeout, spUtil) {
	$scope.m = $scope.data.msgs;
	$scope.evaluatingIncludes = false;
	// field changed event comes from glideFormFactory
	$scope.submitButtonMsg = $scope.m.submitMsg;
	$scope.$on("field.change", function(evt, parms) {
		if (parms.newValue == parms.oldValue)
			return;

		if (!parms.field.guide_implications)
			return;

		if ($scope.data.sc_cat_item.cascade)
			cascadeSingleVarToItems(parms.field);
		evalIncludes();
	})

	// When the mandatory list changes inside sp-model
	$scope.$on("variable.mandatory.change", function() {
		flattenMandatory();
	})

	$scope.$on("guide.item.price.change", function(evt, parms) {
		evalGuidePrice();
	})

	$scope.scrollTo = function(item) {
		spUtil.scrollTo("#" + item.sys_id);
	}

	$scope.scrollToVar = function(v) {
		spUtil.scrollTo("#" + v.sys_id);
	}

	// Breadcrumbs
	if ($scope.data.sc_cat_item) {
		var bc = [{label: $scope.options.title || $scope.m.scHomeMsg, url: '?id=' + $scope.data.sc_catalog_page}];
		if ($scope.data.category)
			bc[bc.length] = {label: $scope.data.category.name, url: $scope.data.category.url};

		bc[bc.length] = {label: $scope.data.sc_cat_item.name, url: '#'};
		$timeout(function() {
			$scope.$emit('sp.update.breadcrumbs', bc);
		});
		spUtil.setSearchPage('sc');
	} else {
		var notFoundBC = [{label: $scope.page.title, url: '?id=' + $scope.data.sc_catalog_page}];
		$timeout(function() {
			$scope.$emit('sp.update.breadcrumbs', notFoundBC);
		});
		spUtil.setSearchPage('sc');
	}

	var includedGformInstances = {};
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		includedGformInstances[gFormInstance.getSysId()] = gFormInstance;
		if ($scope.data.sc_cat_item.cascade)
			cascadeVarsToSingleItem(gFormInstance);

		// This runs after all onSubmit scripts have executed
		gFormInstance.$private.events.on('submitted', function() {
			gFormInstance.submitted = true;
			trySubmit();
		});
	});

	$scope.$on('spModel.gForm.destroyed', function(e, sys_id){
		delete includedGformInstances[sys_id];
	});

	$scope.triggerOnSubmit = function() {
		if ($scope.evaluatingIncludes) {
			$timeout($scope.triggerOnSubmit, 100);
			return;
		}
		
		var gForm;
		// Run onSubmit scripts for every included g_form instance
		for(var gf in includedGformInstances) {
			gForm = includedGformInstances[gf];
			if (gForm)
				gForm.submit();
		}
	};

	// cascade a single Order Guide variable to all items
	function cascadeSingleVarToItems(field /* "IO:sys_id" */) {
		var varName = field.variable_name;
		for (var gf in includedGformInstances) {
			var gForm = includedGformInstances[gf];
			if (!gForm.hasField(varName))
				continue;

			if (gForm.getValue(varName) != field.value)
				gForm.setValue(varName, field.value, field.displayValue);
		}
	}

	// cascade all Order Guide variables to a single item
	function cascadeVarsToSingleItem(gForm) {
		var guide = $scope.data.sc_cat_item;
		if (!guide)
			return;

		for (var guideField in guide._fields) {
			if (!gForm.hasField(guide._fields[guideField].variable_name))
				continue;

			if (gForm.getValue(guide._fields[guideField].variable_name) != guide._fields[guideField].value)
				gForm.setValue(guide._fields[guideField].variable_name, guide._fields[guideField].value, guide._fields[guideField].displayValue);
		}
	}

	// order / create request
	function trySubmit() {
		var gForm;
		// verify every gForm instance has finished its validation
		for(var gf in includedGformInstances) {
			gForm = includedGformInstances[gf];
			if (gForm && gForm.submitted !== true)
				return;
		}

		if ($scope.submitted)
			return;

		$scope.submitted = true;
		$scope.submitting = true;
		setFieldsReadonly();
		$http.post(spUtil.getURL('sc_cat_item_guide'), {"items": $scope.included, "sc_cat_item_guide": $scope.data.sys_id}).success(function(response) {
			var a = response.answer;
			var n = a.number;
			$scope.$emit("$$uiNotification", response.$$uiNotification);
			$scope.$emit("$sp.sc_order_guide.submitted", a);
			if (n)
				issueMessage(n, a.table, a.sys_id);
			$scope.submitting = false;
			$scope.submitButtonMsg = $scope.m.submittedMsg;
		})
	}

	function setFieldsReadonly() {
		var gForm, allFields;
		for(var gf in includedGformInstances) {
			gForm = includedGformInstances[gf];
			allFields = gForm.getFieldNames();
			for(var fieldName in allFields) {
				gForm.setReadOnly(allFields[fieldName], true);
			}
		}
	}

	var mandatoryCollectionBounce;
	$scope.flatMandatory = [];
	function flattenMandatory() {
		$timeout.cancel(mandatoryCollectionBounce);
		mandatoryCollectionBounce = $timeout(function(){
			$scope.flatMandatory = [];
			angular.forEach($scope.data.sc_cat_item._mandatory, function(field) {
					$scope.flatMandatory.push(field);
				});
			angular.forEach($scope.included, function(item) {
				angular.forEach(item._mandatory, function(field) {
					$scope.flatMandatory.push(field);
				});
			});
		}, 80);
	}

	// spModel populates mandatory - this is called the submit button
	$scope.hasMandatory = function() {
		return $scope.flatMandatory.length;
	}

	function issueMessage(n, table, sys_id) {
		var page = table == 'sc_request' ? 'sc_request' : 'ticket';
		var t = $scope.m.createdMsg + " " + n + " - ";
		t += $scope.m.trackMsg;
		t += ' <a href="?id=' + page + '&table=' + table + '&sys_id=' +
			sys_id + '">' + $scope.m.clickMsg + '</a>';
		spUtil.addInfoMessage(t);
	}

	function evalGuidePrice() {
		$timeout(function(){
			var price = 0;
			var rprice = 0;
			for (var i = 0; i < $scope.included.length; i++) {
				var pricing = $scope.included[i]._pricing;
				if (typeof pricing.price_total != "undefined")
					price += pricing.price_total;
				else
					price += pricing.price;
			}
			$scope.price = price;
			var o = {price: price};
			$http.post(spUtil.getURL('format_prices'), o).success(function(response) {
				$scope.price_display = response.price;
			})
		})
	}

	function evalIncludes(name, value) {
		// don't allow submit while waiting on included items eval
		$scope.evaluatingIncludes = true;
		$http.post(spUtil.getURL('sc_order_guide_eval'), $scope.data.sc_cat_item).success(function(response) {
			$scope.includes = response;
			$scope.included = [];
			if ($scope.data.sc_cat_item) {
				$scope.data.sc_cat_item._items.forEach(function(item) {
					if (response.hasOwnProperty(item._item.sys_id)) {
						// Used by spModel for "g_form.isOrderGuideItem()"
						item._item.isOrderGuideItem = true;
						$scope.included.push(item._item);
					}
				})
			}

			evalGuidePrice();
			flattenMandatory();
			$scope.evaluatingIncludes = false;
		}).error(function() {
			$scope.evaluatingIncludes = false;
		});
	}
	if ($scope.data.sc_cat_item)
		$timeout(evalIncludes);
}