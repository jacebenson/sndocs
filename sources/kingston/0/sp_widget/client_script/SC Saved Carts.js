function($scope, $rootScope, $uibModal, spModal, spAriaUtil) {
  /* widget controller */
  var c = this;

	var modalInstance;
	c.loadCart = function(cart) {
		c.server.get({
			action: "retrieve_bundle_items",
			cartName: cart.name
		}).then(function(response) {
			modalInstance = $uibModal.open({
				ariaLabelledBy: 'modal-title',
				ariaDescribedBy: 'modal-body',
				templateUrl: 'myModalContent.html',
				size: 'lg',
				controller: modalCtrl,
				resolve: {
					cartID: function() {
						return cart.sys_id;
					},
					bundleItems: function() {
						return response.data.bundleItems;
					},
					cartCount: function() {
						return c.data.cartCount;
					},
					bundleName: function() {
						return cart.name;
					}
				}
			});
		})
	}

	function modalCtrl($scope, cartID, bundleItems, cartCount, bundleName) {
		$scope.bundleName = bundleName;
		$scope.cartCount = cartCount;
		$scope.bundleItems = bundleItems;
		$scope.cartID = cartID;
		$scope.addBundleToCart = addBundleToCart;
		$scope.replaceCartWithBundle = replaceCartWithBundle;
	}

	function addBundleToCart(cartID) {
		c.server.get({
			action: "load_cart",
			cartID: cartID
		}).then(function(response) {
			spAriaUtil.sendLiveMessage($scope.data.msgs.bundleAddedMsg);
			c.data = response.data;
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			modalInstance.dismiss();
		});
	}

	function replaceCartWithBundle(cartID) {
		c.server.get({
			action: "replace_cart",
			cartID: cartID
		}).then(function(response) {
			spAriaUtil.sendLiveMessage($scope.data.msgs.bundleLoadedMsg);

			c.data = response.data;
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			modalInstance.dismiss();
		});
	}

	$scope.$on("$sp.service_catalog.cart.save_cart", function() {
		c.server.update();
	});

	$scope.$on("$sp.service_catalog.cart.update", function() {
		c.server.update();
	})

	c.removeBundle = function(cart) {
		spModal.confirm(c.data.msgs.deleteBundleConfirmation).then(function(confirm) {
			if (confirm) {
				c.data.action = "remove_bundle";
				c.data.cartID = cart.sys_id;
				c.server.get({
					action: "remove_bundle",
					cartID: cart.sys_id
				}).then(function(response) {
					spAriaUtil.sendLiveMessage(cart.name + " " + $scope.data.msgs.bundleRemovedMsg);
					c.data = response.data;
				});
			}
		});
	}
}