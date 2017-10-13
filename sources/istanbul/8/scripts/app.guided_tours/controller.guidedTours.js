/*! RESOURCE: /scripts/app.guided_tours/controller.guidedTours.js */
angular.module('sn.guided_tours').controller('guidedTours', function(guidedToursService, $http) {
  _startTour = function() {
    var re = /tour_(\w+):(\d+)/;
    var state = re.exec(hopscotch.getState());
    var step = Number(state[2]);
    if (guidedToursService.isImplicitNext()) {
      step++;
    }
    guidedToursService.startTour(state[1], step);
  };
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_START, function(args) {
    if (Array.isArray(args)) {
      guidedToursService.log("observing hopscotch: " + args[0] + " " + args[1]);
      guidedToursService.startTour(args[0], Number(args[1]));
    } else {
      guidedToursService.startTour(args, 0);
    }
  });
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_END, function() {
    guidedToursService.endTour();
  });
  CustomEvent.observe("page_loaded_fully", function(args) {
    guidedToursService.log("page_loaded_fully event: hopscotch state is: " + hopscotch.getState());
    if (hopscotch.getState() !== null && !guidedToursService.hasRelatedLists(window)) {
      _startTour();
    }
  });
  CustomEvent.observe("related_lists.ready", function(args) {
    guidedToursService.log("related_lists.ready event: hopscotch state is: " + hopscotch.getState());
    if (hopscotch.getState() !== null && guidedToursService.hasRelatedLists(window)) {
      setTimeout(_startTour, 100);
    }
  });
  guidedToursService.registerHelpers(hopscotch, window);
});;