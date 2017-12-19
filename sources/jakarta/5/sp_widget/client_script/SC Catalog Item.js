function ($scope, $http, spUtil, nowAttachmentHandler, $rootScope, $sanitize, $window, $sce, i18n, $timeout, $log, spAriaUtil) {
	var c = this;
	c.quantity = 1;
	if ($scope.data.sc_cat_item)
		$scope.data.sc_cat_item.description = $sce.trustAsHtml($scope.data.sc_cat_item.description);
	c.widget._debugContextMenu = [
		[ i18n.getMessage("Open") + " sc_cat_item", function(){
			var item = c.data.sc_cat_item;
			$window.open("/sp_config?id=form&table=" + item.table + "&sys_id=" + item.sys_id); }]
	];
	c.showAddCartBtn = function() {
		return c.options.show_add_cart_button &&
			c.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer" &&
			!c.data.sc_cat_item.no_cart;
	}

	c.showQuantitySelector = function() {
		return c.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer" &&
			!c.data.sc_cat_item.no_quantity &&
			(!c.data.sc_cat_item.no_order_now || !c.data.sc_cat_item.no_cart);
	}

	c.showOrderNowButton = function() {
		return c.data.sc_cat_item.use_sc_layout || !c.data.sc_cat_item.no_order_now;
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

	$scope.$on('dialog.upload_too_large.show', function(e){
		$log.error($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});

	$scope.m = $scope.data.msgs;
	$scope.submitButtonMsg = $scope.m.submitMsg;
	var ah = $scope.attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
	function appendError(error) {
		spUtil.addErrorMessage(error.msg + error.fileName);
	}
	ah.setParams('sp_portal', $scope.data._attachmentGUID, 1024 * 1024 * 24);
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

	// Breadcrumbs
	if ($scope.data.sc_cat_item) {
		var bc = [{label: $scope.page.title, url: '?id=' + $scope.data.sc_catalog_page}];
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

	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance){
		g_form = gFormInstance;

		// This runs after all onSubmit scripts have executed
		g_form.$private.events.on('submitted', function(){
			if ($scope.data.sc_cat_item.item_action === "order")
				getOne();
			else if ($scope.data.sc_cat_item.item_action === "add_to_cart")
				addToCart();
		});
	});

	$scope.triggerAddToCart = function() {
		$scope.data.sc_cat_item.item_action = "add_to_cart";
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
		postCatalogFormRequest().success(function(response) {
			var a = response.result ? response.result : response.answer;
			var n = a.number;
			$scope.$emit("$$uiNotification", a.$$uiNotification);
			$scope.$emit("$sp.sc_cat_item.submitted", a);
			if (n)
				issueMessage(n, a.table, a.sys_id, a.redirect_to, a.redirect_portal_url);
			$scope.submitting = false;
			$scope.submitButtonMsg = $scope.m.submittedMsg;
		}).error(function(response) {
			console.log(response);
		});
	}

	function addToCart() {
		postCatalogFormRequest().success(function(response) {
			$rootScope.$broadcast("$sp.service_catalog.cart.add_item");
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			//spUtil.addInfoMessage("Added item to shopping cart");
			$scope.submitting = false;
			c.status = "Added item to shopping cart";
		});
	}

	function postCatalogFormRequest() {
		setFieldsReadonly();
		$scope.submitted = true;
		$scope.submitting = true;
		var requestUrl;
		var reqData = {};
 		if ($scope.data.sc_cat_item.sys_class_name === "sc_cat_item_producer") {
			requestUrl = '/api/sn_sc/v1/servicecatalog/items/' + $scope.data.sc_cat_item.sys_id + '/submit_producer';
			for(var obj in $scope.data.sc_cat_item._fields)
				reqData[$scope.data.sc_cat_item._fields[obj].variable_name] = $scope.data.sc_cat_item._fields[obj].value;
			reqData = {'variables' : reqData, 'attachment_id' : $scope.data._attachmentGUID, 'attachment_table': 'sp_portal', 'get_portal_messages': 'true'};
		}
		else {
			requestUrl = spUtil.getURL('sc_cat_item');
			reqData = $scope.data.sc_cat_item;
			reqData._attachmentGUID = $scope.data._attachmentGUID;
		}
		return $http.post(requestUrl, reqData);
	}

	// spModel populates mandatory - hasMandatory is called by the submit button
	$scope.hasMandatory = function(mandatory) {
		return mandatory && mandatory.length > 0;
	};

	// switch catalog items
	var unregister = $scope.$on('$sp.list.click', onListClick);
	$scope.$on("$destroy", function() {
		unregister();
	});

	function onListClick(evt, arg) {
		$scope.data.sys_id = arg.sys_id;
		spUtil.update($scope);
	}

	function setFieldsReadonly(){
		var allFields = g_form.getFieldNames();
		for(var fieldName in allFields){
			g_form.setReadOnly(allFields[fieldName], true);
		}
	}

	function issueMessage(n, table, sys_id, redirectTo, redirectUrl) {
		var page = table == 'sc_request' ? 'sc_request' : 'ticket';
		if (c.options.page) {page = c.options.page;}
		if (c.options.table) {table = c.options.table;}
		if (redirectTo == 'catalog_home') page = 'sc_home';
		var url = spUtil.format(c.options.url, {page: page, table: table, sys_id: sys_id});
		if (c.options.auto_redirect == "true") {
			if (redirectUrl)
				$window.location.href = redirectUrl;
			else
			$window.location.href = url;
			return;
		}

		var t = $scope.m.createdMsg + " " + n + " - ";
		t += $scope.m.trackMsg;
		t += ' <a href="' + url + '">' + $scope.m.clickMsg + '</a>';
		spUtil.addInfoMessage(t);
	}
}