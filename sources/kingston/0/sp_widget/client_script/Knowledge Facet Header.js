function($scope,$rootScope) {
	var c = this;
	//set tile from options
	c.options.title = c.options.title || "${Refine Results}";
	c.visible = true;
	c.isLoading = true;
	
	$rootScope.$on('sp.kb.updated.article.count',function (event,data){
		var count = 0;
		if(data.count &&  data.count != 0){
			count =  data.count;
			c.visible = true;
			c.isLoading = false;
		}else if(data.loading){
			c.visible = true;
			c.isLoading = true;
		}else if(data.selections == 0){
				c.visible = false;
		}else{
			c.isLoading = false;
		}
	});
}