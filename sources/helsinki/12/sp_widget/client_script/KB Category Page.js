function ($scope, $rootScope) {			
	setInnerText();	
  $rootScope.$broadcast('sp.update.breadcrumbs', $scope.data.breadcrumbs);
	function setInnerText() {
		for (var i = 0; $scope.data.items.length > i; i++) {
			var item = $scope.data.items[i];
			if (item.text.indexOf(">") == -1) {
				item.inner_text = item.text.trim();
				return;
			}

			var t = $("<div>" + item.text + "</div>");
			t = t.text();
			item.inner_text = t.trim();
		}
	}
}