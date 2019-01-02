function ($scope, spUtil, $location, spModal, spAriaUtil, $http, $window) {
	var c = this;
	c.m = $scope.data.msgs;

	$scope.$on("$sp.service_catalog.cart.update", function() {
		$scope.server.update().then(function() {
			$scope.$emit("$sp.service_catalog.cart.count", getItemCount());
		});
	});

	c.updateQuantity = function(item) {
		spAriaUtil.sendLiveMessage(c.data.msgs.updatedMsq + " " + item.name + " " + c.data.msgs.quantityToMsg + " " + item.quantity);
		
		c.server.get({
			action: "update_quantity",
			itemID: item.sys_id,
			quantity: item.quantity
		}).then(function(response) {
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
		});
	}
	
	c.checkoutTwo = function() {
		c.server.get({
			cart: c.data.cart,
			disable_req_for: c.disable_req_for,
			action: "checkout_two"
		}).then(function(response) {
			var checkoutCartModalCtrl;
			var unregister = $scope.$on('$sp.service_catalog.cart.place_order', function() {
				checkoutCartModalCtrl.close();
			});

			var checkoutCartModal = angular.copy(response.data.checkoutCartModal);
			checkoutCartModal.options.afterOpen = function(ctrl){
				checkoutCartModalCtrl = ctrl;
			};
			checkoutCartModal.options.afterClose = function() {
				unregister();
				c.checkoutCartModal = null;
				checkoutCartModalCtrl = null;
			};
			c.checkoutCartModal = checkoutCartModal;
		});
	}

	c.triggerCheckout = function($evt) {
		$evt.stopPropagation();
		$evt.preventDefault();

		if (c.data.sys_properties.twostep) {
			c.checkoutTwo();
			return;
		}
		c.checkoutInProgress = true;
		c.data.action = 'checkout';
		c.server.update().then(function(response) {
			c.data.action = null;
			c.checkoutInProgress = false;
			var requestData = $scope.data.requestData;
			handleRedirect(requestData.number, requestData.table, requestData.sys_id);
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
		});
	}

	c.removeItem = function($evt, item) {
		$evt.stopPropagation();
		$evt.preventDefault();

		var urlId = $window.location.search.split('sys_id=')[1];
		if(urlId)
			urlId = urlId.split('&')[0];
		var dialogMsg = urlId === item.sys_id ? c.data.msgs.removeEditingItemMsg : c.data.msgs.removeItemConfirmationMsg;
		spModal.confirm(dialogMsg).then(function(confirmed) {
			if (confirmed) {
				$scope.server.get({
					cartName: "DEFAULT",
					action: "remove_item",
					removeItemID: item.sys_id
				}).then(function(response) {
					c.data.cart = response.data.cart;
					c.data.cartItems = response.data.cartItems;
					spAriaUtil.sendLiveMessage(item.name + " " + c.data.msgs.itemRemovedMsg);
					$rootScope.$broadcast("$sp.service_catalog.cart.update");
					if (urlId === item.sys_id)
						$window.location.href = '?id=sc_cart';
				});
			}
		});
	}

	c.clearCart = function() {
		spModal.confirm(c.data.msgs.clearCartConfirmationMsg).then(function(confirmed) {
			if (confirmed) {
				c.server.get({
					action: "clear_cart"
				}).then(function(response) {
					c.data.cart = response.data.cart;
					c.data.cartItems = response.data.cartItems
					$rootScope.$broadcast("$sp.service_catalog.cart.update");
					spUtil.addTrivialMessage(c.data.msgs.cartEmptiedMsg);
				});
			}
		});
	}
	
	c.saveBundle = function() {
		var saveCartModalCtrl;
		var unregister = $scope.$on('$sp.service_catalog.cart.save_cart', function(){
			saveCartModalCtrl.close();
		});

		var saveCartModal = angular.copy(c.data.saveCartModal);
		saveCartModal.options.afterOpen = function(ctrl){
			saveCartModalCtrl = ctrl;
		};
		saveCartModal.options.afterClose = function() {
			unregister();
			c.saveCartModal = null;
			saveCartModalCtrl = null;
		};
		c.saveCartModal = saveCartModal;
	}
	
	c.showPrice = function(idx) {
		return c.data.cartItems[idx].show_price && c.data.cartItems[idx].sys_class_name != 'sc_cat_item_producer';
	}
	
	c.showQuantity = function(idx) {
		return c.data.cartItems[idx].show_quantity && c.data.cartItems[idx].sys_class_name != 'sc_cat_item_producer';
	}
	
	c.showRecurringPrice = function(idx) {
		return c.data.cartItems[idx].show_recurring_price && c.data.cartItems[idx].sys_class_name != 'sc_cat_item_producer';
	}

	function handleRedirect(n, table, sys_id) {
		$window.location.href = '?id=sc_request&table=sc_request&sys_id=' + sys_id;
	}

	$scope.$emit("$sp.service_catalog.cart.count", getItemCount());

	function getItemCount() {
		return c.data.cartItems.length || 0;
	}
	
	if(c.options.auto_update_cart === true || c.options.auto_update_cart === "true") {
		spUtil.recordWatch($scope, 'sc_cart_item', 'cart.name=DEFAULT', function(resp) {
			$scope.$emit("$sp.service_catalog.cart.update");
			if(resp && (resp.data && resp.data.operation == "insert"))
				$scope.$emit("$sp.service_catalog.cart.add_item");
		});
        $scope.$watch("c.data.cartItems", function() {
            $scope.$emit("$sp.service_catalog.cart.count", getItemCount());
        });
    }
}