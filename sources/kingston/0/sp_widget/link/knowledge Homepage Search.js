function(scope,element,attr){
	function openedInIframe () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}
	
	if(openedInIframe())
		$("header nav").css("display","none");
		
	if(scope.data.set_foccus)
		setTimeout(function(){
			element.find('input[name=query]').focus();
		},0);
}