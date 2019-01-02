function(){
		function openedInIframe () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}
	
	if(openedInIframe()){
		$("header nav").css("display","none");
	  $(".container").css("width","100%");	
	}
}