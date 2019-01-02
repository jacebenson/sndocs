function setViewportForMobile() {
	var CONTENT = 'width=device-width, initial-scale=1.0, minimum-scale=1.0';
	
	var viewportElem = $j("meta[name='viewport']");	
	if (viewportElem.length)
		viewportElem.attr("content", CONTENT);
	else
		$j('head').append('<meta name="viewport" content="' + CONTENT + '">');
}
