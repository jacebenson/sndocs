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

  data.months      =  scoreData.months
  data.groups      =  scoreData.groups;
  data.categories  =  scoreData.categories;
  data.indicators  =  scoreData.indicators;

  if (!input || input.all == 'true') {
    data.breakdowns  =  bu.getBreakdowns();
    data.industries  =  bu.getIndustryHistory();
  }
})();