function($scope,$rootScope) {
	var c = this;
	//set tile from options
	c.options.title = c.options.title || "${Refine Results}";
	c.visible = true;
	c.isLoading = true;
	c.clearAllEnable = false;
	
	c.items = [];
	c.articleCount = "";

	c.doneClick = function(){
		$rootScope.showFacet = false;
	}
	$rootScope.$on('sp.kb.refresh.filter',function (event,data){
		if(data){
			c.items = data;
		}
		if(c.items.length>0){
			c.clearAllEnable = true;
		}else{
			c.clearAllEnable = false;
		}
	});
	c.clearAllFiters = function(){
		c.clearAllEnable = false;
		c.items = [];
		$rootScope.$emit('sp.kb.updated.filter','clearall');
	};
	$rootScope.$on('sp.kb.updated.article.count',function (event,data){
		var count =0;
		if(data.count &&  data.count != 0){
			count =  data.count;
			c.articleCount = count + " ${Articles}";
			c.visible = true;
			c.isLoading = false;
		}else if(data.loading){
			c.visible = true;
			c.isLoading = true;
		}else
			c.articleCount = count + " ${Articles}";
			c.visible = false;
	});
}