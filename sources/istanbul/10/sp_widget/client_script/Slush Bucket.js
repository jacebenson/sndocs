// sample use of ng-sortable
function() {
	var c = this;
	c.selected = [];

	// ng-sortable clone means cannot reorder
	c.availableAs = {
		itemMoved: function (event) {
			event.source.itemScope.item.used = true;
		},
		clone: true // clone this side
	}

	c.selectedAs = {
		itemMoved: function (event) {
			// moved back to available
			var item = event.source.itemScope.item;
			moveToAvailable(item);
			removeItem(c.data.all, item);
		},
		dragStart: function () {
			c.availableAs.clone = false;
		},
		dragEnd: function () {
			c.availableAs.clone = true;
		}
	}

	// double moves from Available to Selected
	c.onDblClick = function(item) {
		var t = angular.copy(item);
		item.used = true; // original is now used
		c.selected.push(t);
	}

	// double on selected removes and unsets Available used
	c.onSelDblClick = function(item) {
		moveToAvailable(item);
		removeItem(c.selected, item);
	}

	function removeItem(array, item) {
		var n = array.indexOf(item);
		if (n !== -1)
			array.splice(n, 1);		
	}
	
	function moveToAvailable(item) {
		var t = item.sys_id.value;
		angular.forEach(c.data.all, function(target) {
			if (target.sys_id.value == t)
				target.used = false;
		})		
	}
}