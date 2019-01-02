function($rootScope,$scope) {
	/* widget controller */
	var c = this;
	c.visible = true;
	c.items = [];

	//set selections from data
	var refreshFilter = $rootScope.$on('sp.kb.refresh.filter',function (event,data){
		if(data){
			c.items = data;
			c.visible = true;
		}else{
			c.visible = false;
		}
	});

	//throw event on selection removal
	c.removeSelection = function(item,index){
		c.items.splice(index,1);
		if(item.id == "kb_clear_url_filter"){
			c.clearAllFiters();
		}else{
			$rootScope.$emit('sp.kb.updated.filter',item);
		}
	};

	//clear all filter
	c.clearAllFiters = function(){
		c.items = [];
		$rootScope.$emit('sp.kb.updated.filter','clearall');
	};

	$scope.$on('$destroy',function(){
		refreshFilter();
	});
}