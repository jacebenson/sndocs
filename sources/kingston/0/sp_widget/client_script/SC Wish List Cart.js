function ($scope, spUtil, $location, spModal, spAriaUtil, $window) {
	var c = this;
	c.m = $scope.data.msgs;
	
	$scope.$on("$sp.service_catalog.wishlist.update", function(evt, item_id) {
		$scope.wishlist_item_id = item_id;
		$scope.server.update().then(function() {
			$scope.$emit("$sp.service_catalog.wishlist.count", getItemCount());
		});
	});
	
	$scope.$on("$sp.service_catalog.item.close", function() {
		$scope.wishlist_item_id = null;
	});

	c.removeItem = function($evt, item) {
		var urlId = $window.location.search.split('sys_id=')[1];
		if(urlId)
			urlId = urlId.split('&')[0];
		var isEdited = $scope.wishlist_item_id === item.sys_id || urlId === item.sys_id;
		var dialogMsg = isEdited ? c.data.msgs.removeEditingItemMsg : c.data.msgs.removeItemConfirmationMsg;
		spModal.confirm(dialogMsg).then(function(confirmed) {
			if (confirmed) {
				$scope.server.get({
					cartName: "saved_items",
					action: "remove_item",
					removeItemID: item.sys_id
				}).then(function(response) {
					c.data.cartItems = response.data.cartItems;
					spAriaUtil.sendLiveMessage(item.name + " " + c.data.msgs.itemRemovedMsg);
					$rootScope.$broadcast("$sp.service_catalog.wishlist.update", item.item_id);
					if (isEdited)
						$window.location.href = '?id=sc_wishlist';
				});
			}
		});
	}

	c.clearCart = function() {
		spModal.confirm(c.data.msgs.clearWishlistConfirmationMsg).then(function(confirmed) {
			if (confirmed) {
				c.server.get({
					action: "clear_cart"
				}).then(function(response) {
					c.data.cartItems = response.data.cartItems
					$rootScope.$broadcast("$sp.service_catalog.wishlist.update");
				});
			}
		});
	}
	
	$scope.orderByDate = function (item) {
		 var date = new Date(item.sys_updated_on).getTime();
		 return date;
	}

	$scope.$emit("$sp.service_catalog.wishlist.count", getItemCount());

	function getItemCount() {
		return c.data.cartItems.length || 0;
	}

	if(c.options.auto_update_wishlist === true || c.options.auto_update_wishlist === "true") {
		spUtil.recordWatch($scope, 'sc_cart_item', 'cart.name=saved_items', function(resp) {
			$rootScope.$broadcast("$sp.service_catalog.wishlist.update", $scope.wishlist_item_id);
		});
	}
}