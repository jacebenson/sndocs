function ($location, $rootScope) {
	var c = this;
	this.filterText = "";
	this.showFilter = false;

	this.onClick = function($event, item, url, action) {
		$event.stopPropagation();
		$event.preventDefault();
		if (url)
			$location.search(url);
		else {
			var evt = {};
			evt.url = url;
			evt.table = c.data.table;
			evt.sys_id = item.sys_id;
			evt.record = item;
			evt.rectangle_id = c.data.sys_id;
			evt.action = action;
			// put out the selection with simple list "sl_" prefix
			$location.search('sl_sys_id', evt.sys_id);
			$location.search('sl_table', evt.table);
			$location.search('spa', 1); // spa means "I've got this"
			$rootScope.$broadcast('$sp.list.click', evt);
		}
	};
}