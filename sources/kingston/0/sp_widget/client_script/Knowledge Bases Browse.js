function($http,$rootScope) {
	var c = this;
	c.options.title = c.options.title || "${Explore our Knowledge Bases}";
	c.options.post_question_label = c.options.post_question_label || "${Ask a Question}";
	c.options.create_article_label = c.options.create_article_label || "${Create Article}";
	c.action_menu = "${Action Menu. Please click for available actions}";
	c.isFirefox = false;
	c.showMoreLink = true;
	c.subscribedText = "${Subscribed}";
	c.unSubscribeText = "${Unsubscribe}";

	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
		c.isFirefox = true;
	}
	$rootScope.kb_count = c.data.total_kb_count;
	$rootScope.articles_count = c.data.total_articles_count;
	$rootScope.socialqa_count = c.data.total_socialqa_count;
	$rootScope.isMobile = c.data.isMobile;

	c.toggleKbTiles = function(elm){
		$('.kb-browse-content .kb-hidden-tile').toggleClass('kb-hide-me');
		c.showMoreLink = !c.showMoreLink;

		if(elm == "more"){
			$('.kb-browse-content .kb-tile-block:nth-child(5) a:first').focus();
		}
	}

	c.updateSubscription = function(item){
		var input = {};
		input.id = item.sys_id;
		var notifySub = "";
		if(item.subscribed){
			input.action = 'unsubscribe';
			notifySub = "${Unsubscribed from knowledge base} "+ item.title;
		}else{
			input.action = 'subscribe';
			notifySub = "${Subscribed to knowledge base} "+ item.title;
		}

		c.server.get(input).then(function(r) {
			item.subscribed = !item.subscribed
			c.notity_subscription = notifySub;
		});
	};

	c.getKBLabel = function(kb,articleCount,questionCount,qaEnable){
		var kBLabel = '';
		if(qaEnable){
			kBLabel = c.data.kb_label_qa;
			kBLabel = kBLabel.toString().replace('{0}',kb).replace('{1}',articleCount).replace('{2}',questionCount);
		}else{
			kBLabel = c.data.kb_label;
			kBLabel = kBLabel.toString().replace('{0}',kb).replace('{1}',articleCount);
		}

		return kBLabel;
	};

	c.updateSubText = function(item,focus){

		if(focus)
			$('.unsub_'+item.sys_id).html("<span>"+c.subscribedText+"</span>");
		else
			$('.unsub_'+item.sys_id).html("<span>"+c.unSubscribeText+"</span>");

	};

	c.trimTitle = function(title){
		return title.substring(0,27);
	};
}