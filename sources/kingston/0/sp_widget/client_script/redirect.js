function($location, $window) {
  /* widget controller */
  var c = this;
	c.data.sys_id = $location.search().sys_id;
	//console.log(c.data.sys_id);
	c.server.update().then(function(){
		$window.location.href = c.data.url;
	});
}