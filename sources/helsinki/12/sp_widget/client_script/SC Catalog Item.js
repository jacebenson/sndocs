function ($scope, $http, spUtil, nowAttachmentHandler, $rootScope, $sanitize, $window, $sce) {
	var c = this;
	c.quantity = 1;
	$scope.data.sc_cat_item.description = $sce.trustAsHtml($scope.data.sc_cat_item.description);

	c.showAddCartBtn = function() {
		return c.options.show_add_cart_button &&
			c.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer" &&
			!c.data.sc_cat_item.no_cart;
	}

	c.showQuantitySelector = function() {
		return c.data.sc_cat_item.sys_class_name !== "sc_cat_item_producer" &&
			!c.data.sc_cat_item.no_quantity;
	}

	$scope.$on('dialog.upload_too_large.show', function(e){
		console.log($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});
	
	$scope.m = $scope.data.msgs;
	$scope.submitButtonMsg = $scope.m.submitMsg;
	var ah = $scope.attachmentHandler = new nowAttachmentHandler(setAttachments, function() {});
	ah.setParams('sp_portal', $scope.data._attachmentGUID, 1024 * 1024 * 24);
	function setAttachments(attachments, action) {
		$scope.attachments = attachments;
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
		$rootScope.$broadcast('sp.update.breadcrumbs', bc);
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
			var a = response.answer;
			var n = a.number;
			$scope.$emit("$$uiNotification", response.$$uiNotification);
			$scope.$emit("$sp.sc_cat_item.submitted", a);
			if (n)
				issueMessage(n, a.table, a.sys_id);
			$scope.submitting = false;
			$scope.submitButtonMsg = $scope.m.submittedMsg;
		});
	}

	function addToCart() {
		postCatalogFormRequest().success(function(response) {
			$rootScope.$broadcast("$sp.service_catalog.cart.add_item");
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			//spUtil.addInfoMessage("Added item to shopping cart");
			$scope.submitting = false;
		});
	}

	function postCatalogFormRequest() {
		setFieldsReadonly();
		$scope.submitted = true;
		$scope.submitting = true;
		var t = getPayload($scope.data.sc_cat_item);
		t._attachmentGUID = $scope.data._attachmentGUID;
		// calls into SPCatalogForm.getItem()
		return $http.post(spUtil.getURL('sc_cat_item'), t);
	}

	function getPayload(formModel) {
		var out = angular.copy(formModel);
		out._pricing = null;
		out._sections = null;
		out._view = getFlatView(formModel);
		return out;
	}

	function getFlatView(formModel) {
		var view = [];
		formModel._view.forEach(function(f1){
			if (f1.type == "field" ||
					f1.type == "label" ||
					f1.type == "container_start" ||
					f1.type == "container_end")
				view.push(f1);

			if (typeof f1.containers !== "undefined") {
				f1.containers[0].fields.forEach(function(f2){
					view.push(f2);
				});
			}
		});
		return view;
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

	function issueMessage(n, table, sys_id) {
		var page = table == 'sc_request' ? 'sc_request' : 'ticket';
		if (c.options.page) {page = c.options.page;}
		if (c.options.table) {table = c.options.table;}
		var url = spUtil.format(c.options.url, {page: page, table: table, sys_id: sys_id});
		if (c.options.auto_redirect == "true") {
			$window.location.href = url;
			return;
		}

		var t = $scope.m.createdMsg + " " + n + " - ";
		t += $scope.m.trackMsg;
		t += ' <a href="' + url + '">' + $scope.m.clickMsg + '</a>';
		spUtil.addInfoMessage(t);
	}
}