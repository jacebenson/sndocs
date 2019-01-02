function(scope,element,attr){
	if(scope.data.set_foccus)
	setTimeout(function(){
		element.find('#kb_search_input').focus();
	},0);
}