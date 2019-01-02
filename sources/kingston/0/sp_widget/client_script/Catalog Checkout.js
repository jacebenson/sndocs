function($scope, $http, $window, spScUtil, nowAttachmentHandler, spUtil, $log, spAriaUtil) {
  var c = this;
	c.showSpecialInstructions = false;
	c.showDeliveryAddr = false;
	
	c.updateDetails = function() {
		c.deliverTo = c.data.cart.delivery_address;
		c.special_instructions = c.data.cart.special_instructions;
		c.requestedFor = {
			displayValue: c.data.cart.requested_for_display_name,
			value: c.data.cart.requested_for,
			name: 'requested_for'
		};
	}
	
	$scope.$on('dialog.upload_too_large.show', function(e){
		$log.error($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});

	$scope.m = $scope.data.msgs;
	var ah = $scope.attachmentHandler = new nowAttachmentHandler(function (attachments, action) {
		$scope.attachments = attachments;
		if (action === "added")
			$scope.setFocusToAttachment();
		if (action === "renamed")
			spAriaUtil.sendLiveMessage($scope.m.renameSuccessMsg);
		if (action === "deleted")
			spAriaUtil.sendLiveMessage($scope.m.deleteSuccessMsg);
	}, function (error) {
		spUtil.addErrorMessage(error.msg + error.fileName);
	});
	
	ah.setParams('sc_cart', c.data.cart.sys_id, 1024 * 1024 * $scope.data.maxAttachmentSize);
	
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

	c.changeShippingInfo = function() {
		if (c.data.action !== 'order_now')
			c.server.get({
						action: "change_shipping_info",
						requestedFor: c.requestedFor.value,
						special_instructions: c.special_instructions,
						deliverTo: c.deliverTo,
						cart: {name: c.data.cart.name}
					}).then(function(response) {
						c.data.cart = response.data.cart;
						c.updateDetails();
					});
	}
	
	c.triggerCheckout = function() {
		c.checkoutInProgress = true;
		var additionalParms = {'sysparm_requested_for': c.requestedFor.value, 'special_instructions': c.special_instructions, 'delivery_address': c.deliverTo};
		if (c.data.action == 'order_now') {
			spScUtil.orderNow(c.data.item.sys_id, c.data.item.quantity, c.data.item.fields, c.data.item.newRecordID, additionalParms).then(function(response) {
				var a = response.data.result;
				$scope.$emit("$$uiNotification", a.$$uiNotification);
				$scope.$emit("$sp.sc_cat_item.submitted", a);
				$window.location.href = '?id=sc_request&is_new_order=true&table=sc_request&sys_id=' + a.sys_id;
			});
		} else if (c.data.action == 'order_now_wishlisted_item') {
			spScUtil.orderWishlistedItem(c.data.item.sys_id, c.data.item.quantity, c.data.item.fields, c.data.item.newRecordID, additionalParms).then(function(response) {
				var a = response.data.result;
				$scope.$emit("$$uiNotification", a.$$uiNotification);
				$scope.$emit("$sp.sc_cat_item.submitted", a);
				$rootScope.$broadcast("$sp.service_catalog.wishlist.update");
				$window.location.href = '?id=sc_request&is_new_order=true&table=sc_request&sys_id=' + a.sys_id;
			});
		}
		else {
			c.data.delivery_address = c.deliverTo;
			c.data.special_instructions = c.special_instructions;
			c.data.requested_for = c.requestedFor.value;
			var isOrderGuide = c.data.action == 'order_guide';
			c.server.update().then(function(response) {
				c.data.action = null;
				$rootScope.$broadcast("$sp.service_catalog.cart.update");
				if (isOrderGuide)
					$scope.$emit("$sp.sc_order_guide.submitted", $scope.data.result);
				else
					$scope.$emit("$sp.cart.submitted", $scope.data.result);
				$window.location.href = '?id=sc_request&is_new_order=true&table=sc_request&sys_id=' + $scope.data.result.sys_id;
			});
		}
	}
	
	$scope.$on("field.change", function(evt, parms) {
		if (parms.field.name == 'requested_for') {
			c.data.cart.requested_for = parms.newValue;
			var getShippingAddrURL = '/api/sn_sc/v1/servicecatalog/cart/delivery_address/' + parms.newValue;
			$http.get(getShippingAddrURL).then(function handleSuccess(response) {
				if (response.data.result) {
					c.deliverTo = response.data.result.trim();
				} else {
					c.deliverTo = '';
				}
				c.changeShippingInfo();
			});
		}
	});

	c.cancel = function() {
		$rootScope.$broadcast("$sp.service_catalog.cart.place_order", true);
	}
	c.updateDetails();
}