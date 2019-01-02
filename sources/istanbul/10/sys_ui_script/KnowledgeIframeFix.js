(function() {
	var contentWindow = '',
		iframeArray = [],
		pollingDelay = 250,
		prevHeight,
		src = '',
		blacklist = [],
		bottomMargin = 80;

	/**
 	* Executes the proper calculation strategy and returns the internal height of the iframe.  You should edit this function if you find strategies that are not accounted for
 	* @function getHeight
 	*/
	var getHeight = function() {
		if (contentWindow.$j('body')[0].style.overflow != 'hidden') {
			contentWindow.$j('body')[0].style.overflow = 'hidden';
		}
		//if (iframePageIs('$knowledge.do') || iframePageIs('knowledge_home_launcher.do')) {
		if (iframePageIs('$knowledge.do')) {
			// Knowledge v3 UI
			// Shrink iframe when the src changes to force a recalculation
			if (src != contentWindow.location.href) {
				src = contentWindow.location.href;
				return 700;
			}

			return getTotalHeight(['.application'], 0);
		}
		else if (iframePageIs('kb_view.do')) {
			return getTotalHeight([
				'body > .outputmsg_div',
				'body > .navbar',
				'.kb-view-content-wrapper',
				'.snc-article-header-author',
				'.snc-article-footer-section',
				'.snc-article-footer'
			], bottomMargin);
		}
		else if (iframePageIs('kb_home.do')) {
			return getTotalHeight([
				'body .navbar',
				'body > .kb_main'
			], bottomMargin);
		}
		else 
			return null;
	};

	/**
 	* @function getTotalHeight
 	* @param {array} divs - Array of CSS selectors that identify the div's whose height should be added in the calculation
 	* @param {int} modifier - Number of additional pixels to add as a modifier
 	*/
	var getTotalHeight = function(divs, modifier) {
		var h = 0;

		$j.each(divs, function(ix, val) {
			h = h + contentWindow.$j(val).height();
		});

		return h + modifier;
	};

	/**
 	* Determines if the url contains the given fragment
 	* @function iframePageIs
 	* @param {string} urlFragment - String to search for in the iframe url
 	*
 	*/
	var iframePageIs = function (urlFragment) {
		return (contentWindow.location.href.indexOf(urlFragment) != -1);
	};

	/**
 	* A recursive polling function that gets the internal height of the iframe and resizes the it accordingly.
 	* @function resizeIframeFix
 	*/
	var resizeIframeFix = function(iframe) {
		setTimeout(function() {
			var curHeight;
			var i;

			for (i = 0; i < blacklist.length; i++) {
				if (iframePageIs(blacklist[i])) {
					return;
				}
			}

			if ($j && contentWindow.$j) {
				curHeight = getHeight();

				if (curHeight !== null && prevHeight != curHeight) {
					$j(iframe).height(curHeight);
					prevHeight = getHeight();
					if(iframePageIs("kb_home.do"))
						$j(iframe)[0].style = "min-height:700px";
				}
			}

			resizeIframeFix(iframe);
		}, pollingDelay);
	};

	// Initiate knowledge page resize if we are in iframe and not in platform UI iframe
	if (top != window && top.location.pathname != '/' && top.location.pathname != '/navpage.do' && top.location.pathname != '/nav_to.do') {
		//detect end of page - scrolling
		$j(top).scroll(function() {
			if(top && typeof angular !== 'undefined'){
				if($j(top).scrollTop() + $j(top).height() == $j(top.document).height()) {
					var articleScope = angular.element($j('div[articles-container]')[0]).scope(),
						searchScope = angular.element($j('.search-results')[0]).scope();

					if(articleScope)
						articleScope.$parent.$parent.getArticlesAndQuestions();
					if(searchScope)
						searchScope.$parent.$parent.executeSearch(searchScope.filterQuery.keywords);
				}
			}
		});
		//resizing
		parent.addAfterPageLoadedEvent(function() {
			contentWindow = window; //iframe window
			resizeIframeFix(parent.window.$j('iframe'));
		});
	}
})();