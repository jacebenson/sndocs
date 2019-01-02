function($rootScope,$scope) {
	/* widget controller */

	var c = this;
	c.selected_order = "sys_view_count" ;
	c.sort_items = c.data.sort_items;
	c.hide_relevancy = c.data.hide_relevancy;
	c.order_desc = true;
	c.showRelevancy = false;
	c.title = "";
	c.sortOverlay = false;
	c.sortLabel = "${Views}";
	c.doneClick = function (){
		c.sortOverlay = !c.sortOverlay;
	}
	var refreshSort = $rootScope.$on('sp.kb.refresh.sortorder',function (event,data){
		var count = "";
		if(data){
			count = data.article_count || '0';
			if(data.hasOwnProperty("article_count")) {
				if(data.keyword){
					c.showRelevancy = true;
					if($rootScope.isMobile){
						c.title = count + " ${Results}";
					}else{
						c.title = data.keyword ? count + ' ${Results for} "'+data.keyword+'"':"";
					}
				}else{
					c.showRelevancy = false;
					c.title = count + " ${Results}";
				}
			}

			if(data.order){
				if(data.order){
					c.selected_order = data.order;
					for(var sortItem in c.data.sort_items) {
						if(c.data.sort_items[sortItem].id == c.selected_order){
							c.sortLabel = c.data.sort_items[sortItem].label;
							c.data.sort_items[sortItem].order_desc = data.order_desc;
						}
					}
				}
				if(data.order_desc){
					c.order_desc = data.order_desc;
				}
				if(data.order == "relevancy"){
					c.sortLabel = "${Relevance}";
				}
			}
		}
	});

	c.updateResultOrder = function(item){
		//reverse order direction if same field is clicked again
		if(c.selected_order == item.id && item.id != 'relevancy')
			item.order_desc = !item.order_desc;

		//update other widgets with new order
		if(!(c.selected_order == 'relevancy' && item.id =='relevancy')){
			$rootScope.$emit('sp.kb.updated.sortorder',item);

			if(item.id != 'relevancy'){
				var input ={};
				var orderType = "desc";
				if(item.order_desc == false){
					orderType = "asc";
				}
				$rootScope.dafaultSortId = item.id;
				$rootScope.dafaultSortDesc = item.order_desc;
				var preferOrder = item.id+":"+orderType;
				input.preferOrder = preferOrder;
				input.requestType = "setUserPreference";
				c.server.get(input).then(function(r){

				});
			}
		}
		c.selected_order = item.id;
		c.order_desc = item.order_desc;
		if(c.selected_order == "relevancy"){
			c.sortLabel = "${Relevance}";
			c.notity_order = "${Sorted by} ${Relevance}"
		}else{
			c.sortLabel = item.label;
			if(item.order_desc)
				c.notity_order = "${Sorted by} ${"+item.label+"} ${Descending}. ${Again press enter to sort by ascending}";
			else
				c.notity_order = "${Sorted by} ${"+item.label+"} ${Ascending}. ${Again press enter to sort by descending}";
		}
	};

	c.getSortLabel = function(item){
		if(item.order_desc)
			return "${Sort by} ${"+item.label+"} ${Descending}";
		else
			return "${Sort by} ${"+item.label+"} ${Ascending}";
	};

	$scope.$on('$destroy',function(){
		refreshSort();
	});
}