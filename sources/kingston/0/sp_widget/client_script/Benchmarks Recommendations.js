function($scope, $sce, spModal, $rootScope) {
  /* widget controller */
  var c = this;
  c.KEYS = {TAB: 9, LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40};

  var sortRecos = function(recos) {
    var implList = recos.idList.filter(function(id) {return recos.idMap[id].state === c.states.implemented});
    var otherList = recos.idList.filter(function(id) {return recos.idMap[id].state != c.states.implemented});
    implList.sort(function(a, b) {
      return recos.idMap[b].implementedDateNumeric - recos.idMap[a].implementedDateNumeric;
    });
    otherList.sort(function(a, b) {
      return recos.idMap[b].weightedScore - recos.idMap[a].weightedScore;
    });

    recos.idList = otherList.concat(implList);
  };

  c.sort = function() {
    sortRecos(c.data.recommendations);
  };

  var init = function () {
    c.states = {
      all: 'all',
      none: 'none',
      accepted: 'accepted',
      rejected: 'rejected',
      implemented: 'implemented'
    };
	c.tabs = ['all', 'implemented', 'accepted'];
    c.tab = c.states.all;
    c.counts = c.data.recommendations.counts;
    c.sort();

    // Broadcast the selected tab so that trends can be updated
    $scope.$watch('c.tab', function() {
      var showImplemented = (c.tab === c.states.implemented);
      var data = {
		activeTab: c.tab,
        showImplemented: showImplemented,
        recommendations: showImplemented ? getImplemented(c.data.recommendations) : []
      };
      updateCurrentLimit();

      $rootScope.$broadcast('recommendations.tab', data);
    });
  };
  init();

  c.trustAsHtml = function(html) {
    return $sce.trustAsHtml(html);
  };

  c.recoFilter = function(id) {
    var state = c.data.recommendations.idMap[id].state;
    return (state != c.states.rejected)
        && ((c.tab === c.states.all && state != c.states.implemented)
          || c.tab === state);
  };

  /* Helper functions */
  var updateCurrentLimit = function() {
    c.options.showLimits.current = c.options.showLimits[c.tab];
  };

  var setTabLimit = function(tab, limit) {
    c.options.showLimits[tab] = limit;
    updateCurrentLimit();
  };

  var getImplemented = function(recos) {
    return recos.idList.filter(function(id) {
      return recos.idMap[id].state == c.states.implemented;
    }).map(function(id) {
      return recos.idMap[id];
    });
  };

  var updateCount = function(state, delta) {
    if(state === c.states.all || state === c.states.accepted || state === c.states.implemented) {
       c.counts[state] += delta;
       if(c.counts[state] <= c.options.maxResults)
        setTabLimit(state, c.counts[state]);
    }
  };

  /* View handler functions */
  c.canShowMore = function(tab) {
    return c.options.showLimits.current < c.counts[tab];
  };

  /* Click handlers */
  c.getStarted = function() {
  };

  c.showMore = function(tab) {
    setTabLimit(tab, c.counts[tab]);
  };

  c.showLess = function(tab) {
    setTabLimit(tab, Math.min(c.counts[tab], c.options.maxResults));
  };

  c.remove = function(id) {
    spModal.confirm(c.data.messages.confirmReject).then(function() {
      c.updateState(id, c.states.rejected);
    });
  };

  c.focusActiveTab = function() {
	$('#tab-' + c.tab).focus();
	$('#tab-' + c.tab + ' > a').focus();
  };

  c.switchTab = function(event, index) {
	var key = null;
	if (event.keyCode === c.KEYS.LEFT || event.keyCode === c.KEYS.UP) {
		key = event.keyCode === c.KEYS.LEFT;
	}
	else if (event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN) {
		key = event.keyCode === c.KEYS.RIGHT;
	}
	else if (event.keyCode === c.KEYS.TAB) {
		if(event.shiftKey) {
			$('#chart-container').focus();
		}
		else {
			$('#get-started-0').focus();
		}
		event.preventDefault();
	}

	if(key == null)
		return;

	if(event.keyCode === c.KEYS.LEFT) {
		c.tab =  ((index - 1) < 0) ? c.tabs[c.tabs.length - 1] : c.tabs[index - 1];
	} else if(event.keyCode === c.KEYS.RIGHT){
		c.tab =  ((index + 1) > c.tabs.length - 1) ? c.tabs[0] : c.tabs[index + 1];
	}
	c.focusActiveTab();
	event.preventDefault();

  };

  c.focusTabs = function(event, index){
	  if(event.keyCode === c.KEYS.TAB && event.shiftKey && index == 0){
		  c.focusActiveTab();
		  event.preventDefault();
	  }
  };

  c.updateState = function(id, state) {
    c.server.get({reco_id: id, state: state, action: 'update_state'}).then(function (r) {
      if (!r.data.success || !r.data.activity)
        return;

      /* Decrease old state count and increase new state count */
      var reco = c.data.recommendations.idMap[id];
      if(reco.state === c.states.none) {
        if(state !== c.states.accepted)
          updateCount(c.states.all, -1);
      }
      else if(reco.state === c.states.accepted) {
        updateCount(c.states.accepted, -1);
        updateCount(c.states.all, -1);
      }
      updateCount(state, 1);
      reco.state = state;

      /* Update the activity dates */
      reco.actionDate = r.data.activity.actionDate;
      reco.savedDisplay = r.data.activity.savedDisplay;
      reco.implementedDisplay = r.data.activity.implementedDisplay;
      reco.implementedDateNumeric = r.data.activity.implementedDateNumeric;
    });
  };
}