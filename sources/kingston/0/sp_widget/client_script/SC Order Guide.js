function ($scope, $http, nowServer, $timeout, spUtil, spModal, i18n, $window, spAriaUtil, nowAttachmentHandler, $log) {
	$scope.guide_step = 0;
	$scope.m = $scope.data.msgs;
	$scope.evaluatingIncludes = false;

	$scope.showItem = function(index) {
		if($scope.itemShown == index)
			$scope.itemShown = -1;
		else
			$scope.itemShown = index;
	}
	
	$scope.goPrev = function() {
		$scope.guide_step--;
	}
	
	$scope.toggleItemState = function(item) {
		if(item.included) {
			$scope.totalIncluded--;
			angular.element('#item_details_' + item.sys_id).find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').attr('tabindex', -1);
		}
		else {
			$scope.totalIncluded++;
			angular.element('#item_details_' + item.sys_id).find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').removeAttr('tabindex');
		}
	}
	
	$scope.goNext = function() {
		var gForm;
		if($scope.guide_step == 0) {
			gForm = includedGformInstances[$scope.data.sys_id];
			if(gForm.submit()) {
				evalIncludes();
				$scope.guide_step++;
				$scope.itemShown = 0;
			}
		}
		else if($scope.guide_step == 1) {
			var canSubmit = true;
			for (var i = 0; i < $scope.includedItems.length; i++) {
				if ($scope.includedItems[i].included) {
					gForm = includedGformInstances[$scope.includedItems[i].sys_id];
					if (gForm && !gForm.submit()) {
						canSubmit = false;
						$scope.includedItems[i].isOpen = true;
						$timeout(function(){
							var mandatory = $scope.includedItems[i]._mandatory;
							if (mandatory && mandatory.length > 0) {
								var elems = angular.element("[name*='" + mandatory[0].name + "']");
								if (elems && elems.length > 0) //set focus the first element
									elems[0].focus();
							}
						});
						break;
					}
				}
			}
			if(canSubmit) {
				evalGuidePrice();
				$scope.guide_step++;
			}
		}
	}
	
	// Breadcrumbs
	if ($scope.data.sc_cat_item) {
		$scope.data.categories.unshift({label: $scope.data.sc_catalog || $scope.page.title, url: '?id=' + $scope.data.sc_catalog_page});
		$scope.data.categories.push({label: $scope.data.sc_cat_item.name, url: '#'});
		
		$timeout(function() {
			$scope.$emit('sp.update.breadcrumbs', $scope.data.categories);
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
	});
	
	$scope.$on('spModel.gForm.destroyed', function(e, sys_id){
		delete includedGformInstances[sys_id];
	});
	
	function getFieldsData(item) {
		var fieldData = {"variables":{}};
		for(var field in item._fields)
			fieldData.variables[item._fields[field].variable_name] = item._fields[field].value;
		return fieldData;
	}
	
	function getGuideItems(cartname) {
		var items = [];
		var item;
		for(var i = 0; i < $scope.includedItems.length; i++) {
			if($scope.includedItems[i].included) {
				item = getFieldsData($scope.includedItems[i]);
				item.sysparm_id = item.sysparm_active = $scope.includedItems[i].sys_id;
				item.sysparm_quantity = $scope.includedItems[i].quantity;
				item.sysparm_cart_name = cartname;
				item.sysparm_item_guid = $scope.includedItems[i].sysparm_item_guid;
				items.push(item);
			}
		}
		return items;
	}

	$scope.triggerAddToCart = function() {
		if($scope.submitted)
			return;
		$scope.server.get({
			action: 'log_request',
			itemDetails: {sys_id: $scope.data.sc_cat_item.sys_id, 
										name: $scope.data.sc_cat_item.name,
										sys_class_name: $scope.data.sc_cat_item.sys_class_name}
		});
		$scope.submitted = true;
		$scope.server.get({
			action: "add_to_cart",
			items: getGuideItems(""),
			sys_id: $scope.data.sys_id
		}).then(function(response) {
			$rootScope.$broadcast("$sp.service_catalog.cart.add_item");
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			$scope.$emit("$sp.sc_order_guide.add_to_cart");
			
			spModal.open({
					message: i18n.getMessage('Items have been added successfully'),
					size: 'sm',
				  backdrop: 'static',
					keyboard: false,
				  noDismiss: true,
					buttons: [
							{label: i18n.getMessage('Catalog Home'), cancel:true},
							{label: i18n.getMessage('View Cart'), primary:true}
						]
			}).then(function() {
					$window.location.href = "?id=sc_cart";
				}, function() {
					$window.location.href = "?id=sc_home";
				})
			
		});
	}

	// order / create request
	$scope.triggerSubmit = function() {
		if ($scope.submitted)
			return;

		$scope.server.get({
			action: 'log_request',
			itemDetails: {sys_id: $scope.data.sc_cat_item.sys_id, 
										name: $scope.data.sc_cat_item.name,
										sys_class_name: $scope.data.sc_cat_item.sys_class_name}
		});

		$scope.submitted = true;
		if ($scope.data.sys_properties.twostep) {
			$scope.server.get({
				cart: '' + $scope.data.sys_id,
				items: getGuideItems('' + $scope.data.sys_id),
				action: "order_guide"
			}).then(function(response) {
				var orderGuideModalCtrl;
				var unregister = $scope.$on('$sp.service_catalog.cart.place_order', function(){
					orderGuideModalCtrl.close();
					$scope.submitted = false;
				});

				var orderGuideModal = angular.copy(response.data.orderGuideModal);
				orderGuideModal.options.afterOpen = function(ctrl){
					orderGuideModalCtrl = ctrl;
				};
				orderGuideModal.options.afterClose = function() {
					unregister();
					$scope.orderGuideModal = null;
					orderGuideModalCtrl = null;
				};
				$scope.orderGuideModal = orderGuideModal;
			});
		} else {
			$scope.server.get({
				action: 'checkout_guide',
				items: getGuideItems('' + $scope.data.sys_id),
				guide_id: $scope.data.sys_id
			}).then(function(response) {
				if (response && response.data && response.data.result && response.data.result.request_id)
					$window.location.href = "?id=sc_request&is_new_order=true&table=sc_request&sys_id=" + response.data.result.request_id;
				else
					spUtil.addInfoMessage('Thank you, your request has been submitted.');
			});
		}
	}

	function evalGuidePrice() {
		$scope.price = 0;
		var frequencyMap = {};
		for (var i = 0; i < $scope.includedItems.length; i++) {
			if ($scope.includedItems[i].included) {
				var pricing = $scope.includedItems[i]._pricing;
				var qty = parseInt($scope.includedItems[i].quantity);
				var effectivePrice = 0;
				var effectiveRecurringPrice = 0;
				
				if(typeof pricing.recurring_total != "undefined") {
					effectiveRecurringPrice = pricing.recurring_total;
				} else {
					effectiveRecurringPrice = pricing.recurring_price;
				}
				if (typeof pricing.price_total != "undefined") {
					effectivePrice = pricing.price_total;
				} else {
					effectivePrice = pricing.price;
				}
				
				if (effectiveRecurringPrice >= 0) {
					if(frequencyMap[pricing.rfd])
						frequencyMap[pricing.rfd] += effectiveRecurringPrice * qty;
					else
						frequencyMap[pricing.rfd] = effectiveRecurringPrice * qty;
				}
				if (effectivePrice >= 0)
					$scope.price += effectivePrice * qty;
			}
		}
		frequencyMap.price = $scope.price;
		$scope.server.get({
			action: "format_prices",
			prices: frequencyMap
		}).then(function(response) {
			$scope.frequencySequence = response.data.frequencySequence;
			$scope.price_display = response.data.frequencyMap.price;
			$scope.frequencyMap = response.data.frequencyMap;
			
		});
	}
	
	function evalIncludes() {
		// don't allow submit while waiting on included items eval
		$scope.evaluatingIncludes = true;
		$scope.includedItems = [];
		var guideData = getFieldsData($scope.data.sc_cat_item);
		guideData.sysparm_id = $scope.data.sys_id;
		guideData.without_cart = true;
		guideData._fields = $scope.data.sc_cat_item._fields;
		guideData.cascade = $scope.data.sc_cat_item.cascade;
		$scope.server.get({
			action: "init_guide",
			orderGuideData: guideData
		}).then(function(response) {
			$scope.includedItems = response.data.items;
			$scope.showIncludeToggle = response.data.showIncludeToggle;
			initAttachmentHandlers();
			$scope.totalIncluded = $scope.includedItems.length;
			$scope.evaluatingIncludes = false;
		});
	}
	
	$scope.$on('dialog.upload_too_large.show', function(e){
		$log.error($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});
	
	$scope.initAttachmentCallbacks = function (itemIndex) {
		$scope.includedItems[itemIndex].attachmentHandler.setAttachments = function (attachments, action) {
			$scope.includedItems[itemIndex].attachments = attachments;
			if (action === "renamed")
				spAriaUtil.sendLiveMessage($scope.m.renameSuccessMsg);
			if (action === "deleted")
				spAriaUtil.sendLiveMessage($scope.m.deleteSuccessMsg);
		};
		
		$scope.includedItems[itemIndex].confirmDeleteAttachment = function(attachment) {
			$rootScope.$broadcast("dialog.delete_attachment.show", {
				parms: {
					ok: function() {
						$scope.includedItems[itemIndex].attachmentHandler.deleteAttachment(attachment);
						$rootScope.$broadcast("dialog.delete_attachment.close");
					},
					cancel: function() {
						$rootScope.$broadcast("dialog.delete_attachment.close");
					},
					details: attachment.name
				}
			});
	  };
	}
	
	function initAttachmentHandlers() {
			var setAttachments;
			var appendError = function (error) {
					spUtil.addErrorMessage(error.msg + error.fileName);
			};
			for (var i = 0; i < $scope.includedItems.length; i++) {
				$scope.includedItems[i].attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
				$scope.includedItems[i].attachmentHandler.setParams($scope.includedItems[i].targetTable, $scope.includedItems[i].sysparm_item_guid, 1024 * 1024 * $scope.data.maxAttachmentSize);
			}
	}
}