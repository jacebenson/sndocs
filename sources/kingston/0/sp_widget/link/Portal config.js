function(scope, element, attrs, c, transclude){

	var iframeContext;
	var $el;
	var iframeScope;
	var saveCount = 0;
	var $timeout = $injector.get('$timeout');

	//$(window).on('resize', function(){
	//	setFrameHeight();
	//});

	element.find('iframe').load(init);

	scope.$on('this.renderPreviewPage', function(e, url){
		c.isPreviewLoading = false;
		c.previewPageUrl = null;

		if (url) {
			c.isPreviewLoading = true;
			// This is crazy but necessary to properly attach the onload
			// handler after the pageUrl changes.
			$timeout(function(){
				c.previewPageUrl = url;
				$timeout(function(){
					element.find('iframe').load(init);
				});
			})
		}
	});

	function init(){
		try {
			iframeContext = element.find('iframe').get(0).contentWindow;
			$el = iframeContext.$('body');
		}catch(e){
			return;
		}

		var iframeBody = iframeContext.$('body');
		
		if (typeof(iframeBody) === "undefined" || iframeBody === null)
			return;
		
		iframeScope = iframeBody.scope();
		//setFrameHeight();
		scope.$apply(function(){
			c.isPreviewLoading = false;
		});
	}

	function setFrameHeight(){
		var navbarHeight = $('nav').height();
		var windowHeight = $(window).height();
		var extra = 20;
		element.find('iframe').height(windowHeight - navbarHeight - extra);
	}

	scope.$on('this.setLogo', function(e, logo){
		iframeScope.$apply(function() {
			iframeScope.portal.logo = logo;
		});
	});

	scope.$on('this.setTitle', function(e, title){
		iframeScope.$apply(function() {
			iframeScope.portal.title = title;
		});
	});

	scope.$on('this.refreshTagline', function(e, rectSysId){
		var rectScope = $el.find('#x' + rectSysId).scope();
		rectScope.server.refresh();
	});

	scope.$on('this.setHero', function(e, container, image) {
		var containerSelector = '.c' + container.sys_id;

		var bg = {};
		bg["background-color"] = container.background_color;
		bg["background-image"] = "url('"+ image +"')";

		switch (container.background_style){
			case "default":
				bg["background-size"] = "initial";
				bg["background-position"] = "center center";
				break;
			case "cover":
				bg["background-size"] = "cover";
				bg["background-position"] = "center center";
				break;
			case "contain":
				bg["background-size"] = "contain";
				bg["background-repeat"] = "no-repeat";
				bg["background-position"] = "center center";
				break;
			case "repeat":
				bg["background-repeat"] = "repeat";
				break;
		}

		iframeScope.$apply(function(){
			$el.find(containerSelector).scope().container.background = JSON.stringify(bg);
		});

	});

	scope.$on('this.resetPageCss', function(e){
		$el[0].innerHTML = "";
		var iframe = element.find('iframe');
		iframe.attr("src",iframe.attr("src"));
		return;

		var href;
		iframeContext.$('link[type="text/css"]').each(function(){
			href = $(this).attr('href')
			if (href.indexOf('.scss') > -1) {
				$(this).attr('href', href += '&' + (saveCount++));
			}
		})
	});


}