/*! RESOURCE: /scripts/app.guided_tours/controller.guidedTours.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursService == 'undefined') {
  function processUrlParameters(paramString) {
    var paramsArr = paramString.split('&');
    var params = {};
    paramsArr.forEach(function(p) {
      var keyval = p.split('=');
      params[keyval[0]] = keyval[1];
    });
    if (top.NOW.guidedToursAnalytics) top.NOW.guidedToursAnalytics.isEnabled = (params.mode === 'preview') ? false : true;
  }
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_START, function(args) {
    if (Array.isArray(args)) {
      top.NOW.guidedToursService.log("observing hopscotch: " + args[0] + " " + args[1]);
      top.NOW.guidedToursService.startTour(args[0], Number(args[1]));
    } else {
      top.NOW.guidedToursService.startTour(args, 0);
    }
  });
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_END, function() {
    top.NOW.guidedToursService.endTour();
  });
  CustomEvent.observe("page_loaded_fully", function(args) {
    if (top.NOW.isGTDenabled) {
      if (args.location && args.location.search) {
        processUrlParameters(args.location.search.substring(1));
      }
      if (sessionStorage.getItem('guided_tour:tour.state') != null) {
        top.NOW.guidedToursService.startTourFromState(sessionStorage.getItem('guided_tour:tour.state'));
      } else if (top.hopscotch !== undefined) {
        top.NOW.guidedToursService.log("page_loaded_fully event: hopscotch state is: " + hopscotch.getState());
        if (top.hopscotch.getState() !== null) {
          top.NOW.guidedToursService.startTourFromState(hopscotch.getState());
        } else {
          if (top.NOW.user && top.NOW.user.name && top.NOW.user.name != "" && top.NOW.user.name != "guest") {
            sessionStorage.removeItem('guided_tour:auto_launch_tour');
            var currentPage = args.location.pathname;
            var context = currentPage.substr(1, currentPage.indexOf('.do') - 1);
            top.NOW.guidedToursService.autoLaunchTour(context);
          }
        }
      }
    }
  });
};