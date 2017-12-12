(function() {  /* populate the 'data' object */  /* e.g., data.table = $sp.getValue('table'); */
  data.isMobile    =  gs.isMobile();
  options.params   =  {iid:     $sp.getParameter('iid'),
                      view:     $sp.getParameter('view'),
                      type:     $sp.getParameter('type'),
                      value:    $sp.getParameter('value'),
                      group:    $sp.getParameter('group'),
                      layout:   $sp.getParameter('layout'),
                      category: $sp.getParameter('category')
                      };

  if (input && !!input.iid)
    options.params.iid = input.iid;

  var bu           =  new BenchmarkUtil();
  data.optedIn     =  bu.getOptIn();

  /* If not opted; don't query scores */
  if (!data.optedIn)
    return;

  /* Get score data */
  var scoreData    =  (!!options.params.iid) ? bu.getScores(6, options.params.iid) : bu.getScores(2);

  data.months      =  scoreData.months;
  data.groups      =  scoreData.groups;
  data.categories  =  scoreData.categories;
  data.indicators  =  scoreData.indicators;
  data.timeUnit    =  gs.getProperty('sn_bm_client.dashboard_display_unit');
	data.i18n = {};
	data.i18n.kpiDisplay = {
		hours : gs.getMessage('{0} hours'),
		days_hours : gs.getMessage('{0}d {1}h'),
		days : gs.getMessage('{0} days')
	};
	data.i18n.recoText = gs.getMessage("Recommendation '{0}' is implemented on {1}");
	data.i18n.alertMsg = gs.getMessage('No breakdown score exist for {0} in {1}');
	data.i18n.noRankText = gs.getMessage('(Percentile rank is not available for this KPI)');
	data.i18n.noPAScoreText = gs.getMessage('(Data unavailable in Performance Analytics scorecard)');
	data.i18n.chart = {
		ourTrendNoPA: gs.getMessage('{0}: Your Instance, {1} (Data unavailable in Performance Analytics scorecard), Percentile rank, {2}'),
		ourTrend: gs.getMessage('{0}: Your Instance, {1}, Percentile rank, {2}'),
		miniTrend: gs.getMessage('{0}: Your Instance, {1}, Monthly Change, {2}'),
		miniTrendIncreased: gs.getMessage('{0}: Your Instance, {1}, Monthly Change, Increased by {2}%'),
		miniTrendDecreased: gs.getMessage('{0}: Your Instance, {1}, Monthly Change, Decreased by {2}%'),
		theirTrend: gs.getMessage('{0}: {1}, {2}')
	};

  var categories   =  bu.getCategoryByRoles(data.categories);
  data.authorized  =  (data.categories.idList.length == 0) ? true : categories.length > 0;
  data.categories.idList  =  categories;
  data.clientConfig = bu.getClientConfig();
  var value = gs.nil(options.params.value) ? '' : options.params.value;
  var config = data.clientConfig;
  data.showRank =  value == config.sn_bm_common_size_bucket ||
                   value == config.sn_bm_client_region ||
                   value == config.sn_bm_common_industry ||
                   value == '';
  data.activeGlobalIndicators = bu.getActiveGlobalIndicators();
  if (!input || input.all == 'true') {
	data.breakdowns   = bu.getBreakdowns();
    data.breakdownMap = bu.getAvailableBreakdownMap(data.categories.idList);
    data.industries   = bu.getIndustryHistory();
  }

})();