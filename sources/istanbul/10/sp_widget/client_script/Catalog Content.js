function($scope) {
	var c = this;
	addItemsToCategories(c.data.categories, c.data.items);
	function addItemsToCategories(cats, items) {
		cats.forEach(function(cat) {
			cat.items = [];
			items.forEach(function (item) {
				if (item.category != cat.sys_id)
					return; 
				
				cat.items.push(item);
			})
		})
	}
}