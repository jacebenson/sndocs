function ($scope, $location, $rootScope, spUtil, $interpolate) {
	var c = this;

	this.data.filterText = "";
	this.showFilter = false;

	this.onClick = function($event, item, url, action) {
		$event.stopPropagation();
		$event.preventDefault();
		if (typeof url == "string") {
			var urlExp = $interpolate(url);
			url = urlExp(item);
			$location.url(url);
		} else if (url && typeof url == "object")
			$location.search(url);
		else {
			var evt = {};
			evt.url = url;
			evt.table = item.className;
			evt.sys_id = item.sys_id;
			evt.record = item;
			evt.rectangle_id = c.options.sys_id;
			evt.action = action;
			// put out the selection with simple list "sl_" prefix
			$location.search('sl_sys_id', evt.sys_id);
			$location.search('sl_table', evt.table);
			$location.search('spa', 1); // spa means "I've got this"
			$rootScope.$broadcast('$sp.list.click', evt);
		}
	};

	if (c.options.table)
		spUtil.recordWatch($scope, c.options.table, c.options.filter);

	this.getMaxShownLabel = function(maxEntries, totalCount) {
		if (totalCount == c.data.maxCount)
			return "${First [0] of more than [1]}".replace('[0]', maxEntries).replace('[1]', totalCount);

		return "${First [0] of [1]}".replace('[0]', maxEntries).replace('[1]', totalCount);
	};

	this.seeAllPage = c.options.list_page_dv || 'list';
	this.targetPageID = (c.options.sp_page) ? "&target_page_id=" + c.options.sp_page : "";

	c.getActionColor = function(action) {
		return "text-" + action.color;
	};

	c.update = function update() {
			c.server.update();
	}

	c.toggleFilter = function() {
		c.showFilter = !c.showFilter;
	}

}