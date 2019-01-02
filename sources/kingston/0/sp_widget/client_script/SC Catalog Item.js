function ($scope, $http, spScUtil, spUtil, nowAttachmentHandler, $rootScope, $sanitize, $window, $sce, i18n, $timeout, $log, spAriaUtil, $document, spModal) {
	var c = this;
	c.quantity = c.data.quantity ? parseInt(c.data.quantity) : 1;
	c.mandatory = [];
	$scope.stickyHeaderTop = '0px';

	c.widget._debugContextMenu = [
		[ i18n.getMessage("Open") + " sc_cat_item", function(){
			var item = c.data.sc_cat_item;
			$window.open("/sp_config?id=form&table=" + item.table + "&sys_id=" + item.sys_id); }]
	];
	c.showAddCartBtn = function() {
		return c.options.show_add_cart_button &&
			c.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer" &&
			!c.data.sc_cat_item.no_cart && !c.data.is_cart_item;
	}
	
	c.showQuantitySelector = function() {
		return c.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer" &&
			!c.data.sc_cat_item.no_quantity &&
			(!c.data.sc_cat_item.no_order_now || !c.data.sc_cat_item.no_cart);
	}

	c.showOrderNowButton = function() {
		return !$scope.data.is_cart_item && (c.data.sc_cat_item.use_sc_layout || !c.data.sc_cat_item.no_order_now);
	}

	c.allowOrder = function() {
		if (c.data.sc_cat_item.use_sc_layout)
			return true;

		if (c.data.sc_cat_item.no_order)
			return false;

		if (c.data.sc_cat_item.no_order_now && c.data.sc_cat_item.no_cart)
			return false;

		return true;
	}
	
	c.hideCartMsg = function () {
		$scope.data.showMsg = false;
	}

	$scope.$on('dialog.upload_too_large.show', function(e){
		$log.error($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});

	$scope.m = $scope.data.msgs;
	var ah = $scope.attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
	function appendError(error) {
		spUtil.addErrorMessage(error.msg + error.fileName);
	}
	ah.setParams($scope.data._attachmentTable, $scope.data._generatedItemGUID, 1024 * 1024 * $scope.data.maxAttachmentSize);
	function setAttachments(attachments, action) {
		$scope.attachments = attachments;
		if (action === "added")
			$scope.setFocusToAttachment();
		if (action === "renamed")
			spAriaUtil.sendLiveMessage($scope.m.renameSuccessMsg);
		if (action === "deleted")
			spAriaUtil.sendLiveMessage($scope.m.deleteSuccessMsg);
	}
	$scope.attachmentHandler.getAttachmentList();

	$scope.confirmDeleteAttachment = function(attachment, $event) {
    $rootScope.$broadcast("dialog.delete_attachment.show", {
      parms: {
        ok: function() {
          $scope.attachmentHandler.deleteAttachment(attachment);
          $rootScope.$broadcast("dialog.delete_attachment.close");
        },
        cancel: function() {
          $rootScope.$broadcast("dialog.delete_attachment.close");
        },
        details: attachment.name
      }
    })
  }

	$scope.dismissWishListMessage = function() {
		$scope.is_update_wishlist = false;
	}
	
  if ($scope.data.sc_cat_item) {
		$scope.data.sc_cat_item.description = $sce.trustAsHtml($scope.data.sc_cat_item.description);
		if (angular.equals($scope.data.sc_cat_item._fields, {}))
				$scope.data.no_fields = true;
		if ($scope.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer")
			$scope.submitButtonMsg = $scope.m.orderNowMsg;
		else
			$scope.submitButtonMsg = $scope.m.submitMsg;
		
		// Breadcrumbs
		if (!$scope.data.categories)
		$scope.data.categories = [];
		if ($scope.data.is_wishlist_item) {
			$scope.data.categories.unshift({label: $scope.m.wishlistMsg, url: '?id=sc_wishlist'});
			$scope.data.categories.push({label: $scope.data.sc_cat_item.name, url: '#'});
		}
		else if ($scope.data.is_cart_item) {
			$scope.data.categories.unshift({label: $scope.m.cartMsg, url: '?id=sc_cart'});
			$scope.data.categories.push({label: $scope.data.sc_cat_item.name, url: '#'});
		}
		else {
			$scope.data.categories.unshift({label: $scope.data.sc_catalog || $scope.page.title, url: '?id=' + $scope.data.sc_catalog_page});
			$scope.data.categories.push({label: $scope.data.sc_cat_item.name, url: '#'});
		}
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

	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance){
		g_form = gFormInstance;

		// This runs after all onSubmit scripts have executed
		g_form.$private.events.on('submitted', function(){
			if ($scope.data.sc_cat_item.item_action === "order")
				getOne();
			else if ($scope.data.sc_cat_item.item_action === "add_to_cart")
				addToCart();
			else if ($scope.data.sc_cat_item.item_action == "update_cart")
				updateCart();
		});
	});

	function getVarData(fields) {
		var reqData = {};
		for(var obj in fields)
			reqData[fields[obj].variable_name] = fields[obj].value;
		return reqData;
	}

	function addLink(url, msg) {
		return " <a href=" + url + ">" + msg + "</a>";
	}
	
	$scope.$on("$sp.service_catalog.wishlist.update", function(evt, item) {
		if (item === $scope.data.sys_id)
			$scope.data.show_wishlist_msg = false;
	});

	$scope.addToWishlist = function() {
		$scope.submitting = true;
		$scope.m.actionMsg = $scope.data.is_wishlist_item ? $scope.m.wishlistUpdateMsg : $scope.m.wishlistAddMsg;
		$scope.m.actionMsg += addLink('?id=sc_wishlist', $scope.m.viewWishListMsg);
		$scope.m.actionMsg += '<i class="fa fa-close pull-right pointer" ng-click="c.hideCartMsg()"/>';
		$scope.m.actionMsg = $sce.trustAsHtml($scope.m.actionMsg);
		$scope.is_update_wishlist = false;
		spScUtil.addToWishlist($scope.data.sc_cat_item.sys_id, c.quantity, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID).then(function(response){
			var cartItemId = "";
			for (var i=0; i<response.data.result.items.length; i++) {
				var item = response.data.result.items[i];
				if (item.catalog_item_id === $scope.data.sc_cat_item.sys_id) {
					cartItemId = item.cart_item_id;
					break;
				}
			}
			$rootScope.$broadcast("$sp.service_catalog.wishlist.add_item");
			$rootScope.$broadcast("$sp.service_catalog.wishlist.update", cartItemId);
			$scope.data.showMsg = $scope.is_update_wishlist = true;
			$scope.data.is_wishlist_item = true;
			$scope.data.show_wishlist_msg = false;
			$scope.submitting = false;
			spUtil.scrollTo('#sc_cat_item', 300);
		});
	}

	$scope.triggerAddToCart = function() {
		$scope.data.sc_cat_item.item_action = "add_to_cart";
		$scope.data.sc_cat_item.quantity = c.quantity;
		if (g_form)
			g_form.submit();
	}

	$scope.triggerUpdateCart = function() {
		$scope.data.sc_cat_item.item_action = "update_cart";
		$scope.data.sc_cat_item.quantity = c.quantity;
		if (g_form)
			g_form.submit();
	}

	$scope.triggerOnSubmit = function(){
		$scope.data.sc_cat_item.item_action = "order";
		$scope.data.sc_cat_item.quantity = c.quantity;
		if (g_form)
			g_form.submit();
	}

	// order / create request
	function getOne() {
		$scope.server.get({
			action: 'log_request',
			itemDetails: {sys_id: $scope.data.sc_cat_item.sys_id, 
										name: $scope.data.sc_cat_item.name,
										sys_class_name: $scope.data.sc_cat_item.sys_class_name}
		});

		if ($scope.data.sys_properties.twostep && $scope.data.sc_cat_item.sys_class_name != "sc_cat_item_producer") {
			$scope.server.get({
				cart: 'cart_' + $scope.data.sc_cat_item.sys_id,
				itemDetails: {sys_id: $scope.data.sc_cat_item.sys_id, quantity: $scope.data.sc_cat_item.quantity, fields: getVarData($scope.data.sc_cat_item._fields), newRecordID: $scope.data._generatedItemGUID},
				action: $scope.data.is_wishlist_item ? "order_wishlist_item" : "order_item"
			}).then(function(response) {
				var orderItemModalCtrl;
				var unregister = $scope.$on('$sp.service_catalog.cart.place_order', function(){
					orderItemModalCtrl.close();
				});

				var orderItemModal = angular.copy(response.data.orderItemModal);
				orderItemModal.options.afterOpen = function(ctrl){
					orderItemModalCtrl = ctrl;
				};
				orderItemModal.options.afterClose = function() {
					unregister();
					c.orderItemModal = null;
					orderItemModalCtrl = null;
				};
				c.orderItemModal = orderItemModal;
			});
		} else {
			postCatalogFormRequest().then(function(response) {
				var a = response.data.result;
				$scope.$emit("$$uiNotification", a.$$uiNotification);
				$scope.$emit("$sp.sc_cat_item.submitted", a);
				if ($scope.data.is_wishlist_item)
					$rootScope.$broadcast("$sp.service_catalog.wishlist.update");
				if (a.number)
					handleRedirect(a.number, a.table, a.sys_id, a.redirect_to, a.redirect_portal_url);
				$scope.submitting = false;
				$scope.submitButtonMsg = $scope.m.submittedMsg;
			});
		}
	}

	function addToCart() {
		$scope.server.get({
			action: 'log_request',
			itemDetails: {sys_id: $scope.data.sc_cat_item.sys_id, 
										name: $scope.data.sc_cat_item.name,
										sys_class_name: $scope.data.sc_cat_item.sys_class_name}
		});
		
		postCatalogFormRequest().then(function(response) {
			$rootScope.$broadcast("$sp.service_catalog.cart.add_item");
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			$scope.$emit("$sp.sc_cat_item.add_to_cart");
			if ($scope.data.is_wishlist_item) {
				$rootScope.$broadcast("$sp.service_catalog.wishlist.update");
				$scope.data.is_wishlist_item = false;
			}
			c.status = i18n.getMessage("Added item to shopping cart");
			$scope.server.get({action: 'init_item'}).then(function(response) {
				$scope.data._generatedItemGUID = response.data._generatedItemGUID;
				ah.setParams($scope.data._attachmentTable, $scope.data._generatedItemGUID, 1024 * 1024 * $scope.data.maxAttachmentSize);
				$scope.attachmentHandler.getAttachmentList();
				$scope.m.actionMsg = $scope.m.cartAddMsg + addLink('?id=sc_cart', $scope.m.viewCartMsg);
				$scope.m.actionMsg += '<i class="fa fa-close pull-right pointer" ng-click="c.hideCartMsg()"/>';
				$scope.m.actionMsg = $sce.trustAsHtml($scope.m.actionMsg);
				$scope.data.showMsg = true;
				$scope.submitting = false;
				spUtil.scrollTo('#sc_cat_item', 300);
			});
		});
	}

	function updateCart() {
		postCatalogFormRequest().then(function(response) {
			c.status = i18n.getMessage("Updated Item to shopping cart.");
			$window.location.href = '?id=sc_cart';
		})
	}

	function postCatalogFormRequest() {
		$scope.submitting = true;
		if ($scope.data.is_wishlist_item) {
			$scope.is_update_wishlist = false;
			$scope.data.show_wishlist_msg = false;
			if ($scope.data.sc_cat_item.sys_class_name === "sc_cat_item_producer")
				return spScUtil.submitWishlistedProducer($scope.data.sc_cat_item.sys_id, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID);
			else if ($scope.data.sc_cat_item.item_action === "order")
				return spScUtil.orderWishlistedItem($scope.data.sc_cat_item.sys_id, $scope.data.sc_cat_item.quantity, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID);
			else if ($scope.data.sc_cat_item.item_action === "add_to_cart")
				return spScUtil.addWishlistedItemToCart($scope.data.sc_cat_item.sys_id, $scope.data.sc_cat_item.quantity, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID);
		}
		else if ($scope.data.is_cart_item)
			return spScUtil.updateCart($scope.data._generatedItemGUID, $scope.data.sc_cat_item.quantity, getVarData($scope.data.sc_cat_item._fields));
		else if ($scope.data.sc_cat_item.sys_class_name === "sc_cat_item_producer")
			return spScUtil.submitProducer($scope.data.sc_cat_item.sys_id, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID);
		else if ($scope.data.sc_cat_item.item_action === "order")
			return spScUtil.orderNow($scope.data.sc_cat_item.sys_id, $scope.data.sc_cat_item.quantity, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID);
		else if ($scope.data.sc_cat_item.item_action === "add_to_cart")
			return spScUtil.addToCart($scope.data.sc_cat_item.sys_id, $scope.data.sc_cat_item.quantity, getVarData($scope.data.sc_cat_item._fields), $scope.data._generatedItemGUID);
	}

	// spModel populates mandatory - hasMandatory is called by the submit button
	$scope.hasMandatory = function() {
		return c.mandatory && c.mandatory.length > 0;
	};

	// switch catalog items
	var unregister = $scope.$on('$sp.list.click', onListClick);
	$scope.$on("$destroy", function() {
		$rootScope.$broadcast("$sp.service_catalog.item.close");
		unregister();
	});

	function onListClick(evt, arg) {
		$scope.data.sys_id = arg.sys_id;
		spUtil.update($scope);
	}

	function handleRedirect(n, table, sys_id, redirectTo, redirectUrl) {
		var page = table == 'sc_request' ? 'sc_request' : 'ticket';
		
		if (redirectTo == 'catalog_home') 
			page = 'sc_home';
		if (c.options.page) {page = c.options.page;}
		if (c.options.table) {table = c.options.table;}
		var url = spUtil.format(c.options.url, {page: page, table: table, sys_id: sys_id});
		if ($scope.data.sc_cat_item.sys_class_name === "sc_cat_item_producer") {
			if (redirectUrl)
				$window.location.href = redirectUrl;
			else
				$window.location.href = url;
			return;
		}
		$window.location.href = spUtil.format(c.options.url, {page: 'sc_request', table:'sc_request', sys_id: sys_id});
		return;
	}
    
    $timeout(function() {
        if ($document[0].getElementsByClassName('sc-sticky-item-header').length > 0) {
            var titleHeight = $document[0].getElementsByClassName('sc-sticky-item-header')[0].clientHeight;
            $scope.stickyHeaderTop = '-' + (titleHeight - 20 - $document[0].getElementsByClassName('sc-cat-item-short-description')[0].clientHeight) + 'px;';
        }
    });
}