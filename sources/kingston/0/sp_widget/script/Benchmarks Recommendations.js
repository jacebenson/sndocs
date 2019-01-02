function updateState(mgr, recoId, state) {
  var result = {success: false};
  var activity = null;

  if (gs.nil(recoId))
    return result;

  if (state === 'accepted')
    activity = mgr.accept(recoId);

  else if (state === 'rejected')
    activity = mgr.reject(recoId);

  else if (state === 'implemented')
    activity = mgr.setImplemented(recoId);

  if (!gs.nil(activity))
    result = {success: true, activity: activity};

  return result;
}



(function() {
  /* translated messages */
  data.messages = {
    confirmReject: gs.getMessage('This will remove the recommendation permanently and you will not see this in current or future recommendation list.')
  };
  options.maxResults = 5;

  var mgr = new RecommendationManager();

  if (!input) {
    var indicatorId = $sp.getParameter('iid');
    data.indicatorId = indicatorId;
    data.recommendations = mgr.getLastMonth(indicatorId);

    var counts = data.recommendations.counts;
    options.showLimits = {all: Math.min(options.maxResults, counts.all),
                          current: options.maxResults,
                          accepted: Math.min(options.maxResults, counts.accepted),
                          implemented: Math.min(options.maxResults, counts.implemented)};

  } else {
    var action = input.action;
    if (gs.nil(action))
      return;

    if (action == 'update_state') {
      var result = updateState(mgr, input.reco_id, input.state);
      data.success = result.success;
      data.activity = result.activity;
    }
  }
})();