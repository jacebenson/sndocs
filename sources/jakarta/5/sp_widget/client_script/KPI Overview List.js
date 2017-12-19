function($scope, $rootScope, i18n, $location, $window) {  /* widget controller */  var c = this;

c.LIST_VIEW = 'list';

c.getUrlParams = function(linkType, linkParams) {
  var params = {};

  if (!!linkParams && !!linkParams.iid)
    params.id = 'details';

  // Save the view
  if (linkType == 'details' && !!c.view.id && !c.view.overview) {
    params.iid = c.view.id;
  }

  // Save the layout
  if (c.options.listView)
    params.layout = c.LIST_VIEW;

  // Save the breakdowns
  if (!!c.data.breakdown.type && !!c.data.breakdown.value) {
    params.type = c.data.breakdown.type;
    params.value = c.data.breakdown.value;
  }

  // Save the category
  if (linkType != 'overview')
    params.category = c.category.id;

  // Save the group
  if (linkType != 'overview' && !!c.category.group)
    params.group = c.category.group;

  if (!!linkParams)
    Object.keys(linkParams).forEach(function(key) {params[key] = linkParams[key]});

  return params;
};

c.getUrl = function(linkType, linkParams) {
  var params = c.getUrlParams(linkType, linkParams);

  return '?' + Object.keys(params).map(function(key) {return key + '=' + params[key]}).join('&');
};

c.updateUrl = function(linkType, linkParams) {
  var params = c.getUrlParams(linkType, linkParams);
  $location.search(params);
};

c.setConfig = function() {
  var params = c.options.params;

  // Set overview or detailed view
  if (!!params.iid) {
    c.view.id = params.iid;
    c.view.overview = false;
  }

  // Set the layout
  c.options.listView = (params.layout == c.LIST_VIEW)

  // Set the breakdowns
  if (!!params.type && !!params.value) {
    c.data.breakdown.type = params.type;
    c.data.breakdown.value = params.value;
  }

  // Set the category
  if (!!params.category && params.category in c.data.categories.idMap)
    c.category.id = params.category;

  // Set the group
  if (!!params.group && params.group in c.data.groups.idMap)
    c.category.group = params.group;
};

var updateBreadcrumbs = function(bc) {
  var breadcrumbs = [];

  if (!!c.category.id)
    breadcrumbs.push({label: c.data.categories.idMap[c.category.id].display, url: c.getUrl('category')});

  if ((!!bc && !bc.length) || !!c.view.id)
    breadcrumbs.push({label: c.data.indicators.idMap[c.view.id].display, url: '#'});

  $rootScope.$broadcast('sp.update.breadcrumbs', breadcrumbs);
};

c.toggleSelector = function($event, opt) {
  c.categorySelector = (opt != null && opt != undefined) ? opt : !c.categorySelector;
  $event.stopPropagation();
};

c.changeCategory = function($event, id) {
  c.category.id = id;
  c.category.group = '';
  c.makeSelect();
  c.toggleSelector($event, false);
  updateBreadcrumbs();
};

// Fetch trend from server
c.getTrend = function(item, callback) {
  var id = item.sys_id;
  c.server.get({iid: id}).then(function(response) {

    var updated = false;
    if (!!response && !!response.data) {
      var months = response.data.months;
      c.data.indicators.idMap[id].scores = response.data.indicators.idMap[id].scores;
      item.ourTrend = c.getOurTrend(item, months.idList.concat().reverse());
      updated = true;
    }

    callback(item, months, updated);
  });
};

// Set variables with trend data
c.getOurTrend = function(item, months) {
  return {
    name: i18n.getMessage('Your Instance'),
    data: months.map(function(m) {
      return (m in item.scores) ? item.scores[m].local.value : null;
    })
  };
};

c.getTheirScore = function(item, bd, month, months) {
	var score = {value: 0, display: "0"};
	var trend = {name: '', data: null};

	/* Check if a breakdown is selected */
	if (!!bd.type && !!bd.value) {

		/* Set the trend name and data */
		trend.data  =  months.map(function (m) {
			var value = null;
			try { value = item.scores[m].breakdowns[bd.type].elements[bd.value].mean; }
			catch (err) {}
			return value;
		});

		/* Try to set the score values */
		try {
			/* Set the trend name */
			trend.name     =  c.data.breakdowns[bd.type].idMap[bd.value].display;

			/* Set the score values */
			score.value    =  item.scores[month].breakdowns[bd.type].elements[bd.value].mean;
			score.display  =  item.scores[month].breakdowns[bd.type].elements[bd.value].display.toLowerCase();
		}
		catch (err) {}
	}
	else {

		/* Trend values */
		trend.name = i18n.getMessage('Global Benchmark');
		trend.data = months.map(function (m) {
			var value = null;
			try { value = item.scores[m].global.mean }
			catch (err) {}
			return value;
		});

		try {
			/* Set global score value */
			score.value = item.scores[month].global.mean;

			/* Set global score display value */
			if (!!item.scores[month].global.display)
				score.display = item.scores[month].global.display.toLowerCase();
		} catch (err) {}
	}

	return {score: score, trend: trend};
};

c.getOurScore = function(item, month, prevMonth){
	/* Function to check which direction the change is better */
    var isBetter  = function(minimizeDirection, a, b) {
        return (minimizeDirection) ? (a <= b) : (a >= b);
    };

	if (month in item.scores)
		item.ourScore  =  {value: item.scores[month].local.value, display: (!item.scores[month].local.display ? '0' : item.scores[month].local.display.toLowerCase())};
	else
		item.ourScore = {value: null, display: '0'};

	var display = item.ourScore.display.replace('days', '<span class="os-sm">days</span>').replace('%', '<span class="os-sm">%</span>')
	var replaceStr = (display.indexOf('hours') != -1) ? 'hours' : 'hour';
	item.ourScore.display = display.replace(replaceStr, '<span class="os-sm">' + replaceStr + '</span>');

	try {
		var lastMonthValue  =  item.scores[prevMonth].local.value;
		item.difference     =  parseInt(Math.abs((item.ourScore.value - lastMonthValue) / lastMonthValue).toFixed(2) * 100);
		item.color          =  isBetter(item.minimize, item.ourScore.value, lastMonthValue) ? 'success' : 'danger';
		item.direction      =  (item.ourScore.value < lastMonthValue) ? 'glyphicon-triangle-bottom' :  'glyphicon-triangle-top';

		if (isNaN(item.difference))
			throw TypeError;
	}
	catch (err) {
		var lastMonthValue  =  0;
		item.difference     =  'NA';
		item.color          =  'grey';
		item.direction      =  'glyphicon-stop';
	}
};

c.setScores = function(month) {

    var updateScores = function(item, month) {
        var result       =  c.getTheirScore(item, c.data.breakdown, month, months);
        item.theirTrend  =  result.trend;

        $('.their-score-val').css('opacity', 0);
        setTimeout(function(){
          $('.their-score-val').css('opacity', 1);
          item.theirScore  =  result.score;
          item.textColor   =  ((!item.minimize && item.ourScore.value >= item.theirScore.value) || (item.minimize && item.ourScore.value <= item.theirScore.value)) ? 'text-success' : 'text-danger';
          $scope.$apply();
        }, 400);
    };

    /* List of months and previous month */
    var months    = c.data.months.idList.concat().reverse();
    var prevMonth = c.data.months.idMap[month].previous;

    /* Set the scores for all instances */
    c.data.indicators.idList.forEach(function(id, index) {
        var item       =  c.data.indicators.idMap[id];

        /* Set controls for trends on card view */
        item.trendView = {show: false};

        /* Get our scores */
        c.getOurScore(item, month, prevMonth);

        item.ourTrend  =  c.getOurTrend(item, months);

        /* Get their scores */
        updateScores(item, month);

    });

    /* If the breakdown has changed */
    $scope.$watch('c.data.breakdown.value', function() {
        c.data.indicators.idList.forEach(function(id, index) {
            updateScores(c.data.indicators.idMap[id], month);
        });
        updateBreadcrumbs();
    });
};

c.isTouchDevice = function(){
  return ('ontouchstart' in $window);
}

c.getHoursDisplay = function(value) {
    var hours = value;
    var display = [hours, (hours == 1) ? i18n.getMessage('hour') : i18n.getMessage('hours')];
    return display.join(' ').toLowerCase();
  };

c.getYDisplayValue = function(value, item) {
  var display = value;
  if (item.unit.indexOf('Hrs') != -1)
    display = c.getHoursDisplay(value);
  else if (item.unit.length)
    display = item.unit.replace('{0}', value);
  return display;
};

c.accessibilityFormatter = function(point, item) {
  return point.category + ': ' + point.series.name + ', ' + c.getYDisplayValue(point.y, item);
};

c.getChart = function(chartConfig){

	var item   = (!!chartConfig && !!chartConfig.item)   ? chartConfig.item   : '';
	var months = (!!chartConfig && !!chartConfig.months) ? chartConfig.months : '';
	var title  = (!!chartConfig && !!chartConfig.title)  ? chartConfig.title  : '';
	var divId  = (!!chartConfig && !!chartConfig.divId)  ? chartConfig.divId  : '';
	var width  = (!!chartConfig && !!chartConfig.width)  ? chartConfig.width  : '';
	var height = (!!chartConfig && !!chartConfig.height) ? chartConfig.height : '';
	var escape = (!!chartConfig && !!chartConfig.escape) ? chartConfig.escape : '';

	var monthList  = ('idList' in months) ? months.idList : months;
	var monthMap   = ('idMap' in months) ? months.idMap  : c.data.months.idMap;

	var chartObj = {
		accessibility: {
			pointDescriptionFormatter: function(point) {
				return c.accessibilityFormatter(point, item);
			}
		},
		chart: {
			spacingLeft: 20,
			spacingRight: 20,
			renderTo: 'chart-container',
			type: 'spline',
			plotBorderWidth: 1,
			style: {
				fontFamily: '"SourceSansPro", Helvetica, Arial, sans-serif'
			}
		},
		lang: {
			noData: i18n.getMessage('No data to display')
		},
		tooltip: {
			pointFormatter: function() {
				var display = c.getYDisplayValue(this.y, item);

				var ourTrend = this.series.name == item.ourTrend.name
				var noData = true;
				if (ourTrend) {
					try {
						var month = monthMap[monthList[this.x]];
						noData = !item.scores[month.display].local.v2_score;
					} catch (err) {
						noData = true;
					}
				}

				var ttip = '<span style="color:' + this.color + '">\u25CF</span> '
				+ this.series.name + ': <b>' + display + '</b> ';

				return ttip + (noData && ourTrend ? ('(' + i18n.getMessage('Data unavailable in Performance Analytics scorecard') + ')') : '') + '<br/>';
			},
			shared: true
		},
		xAxis: {
			categories: monthList.map(function(m) {
				var date = monthMap[m];
				var month = ('0' + date.month).slice(-2);
				var year  = ('' + date.year).slice(-2);
				return month + '/' + year;
			})
		},
		yAxis: {
			title: {text: ''},
			labels: {
				formatter: function() {
					if (item.unit.indexOf('Hrs') != -1) {
						return c.getHoursDisplay(this.value);
					}

					if (item.unit.length)
						return item.unit.replace('{0}', this.value);

					return this.value;
				}
			},
			minTickInterval: 1
		},
		title: {
			y: 30,
			align: 'left',
			margin: 50,
			style: {'fontSize': '16px'},
			text: title
		},
		credits: {enabled: false},
		exporting: {enabled: false},
		series: [
			{
				name:  item.theirTrend.name,
				data:  item.theirTrend.data,
				color: '#5cb85c',
				marker: {
					radius: 3,
					symbol: 'circle'
				}
			},
			{
				name:  item.ourTrend.name,
				data:  item.ourTrend.data,
				color: '#428bca',
				marker: {
					fillColor: '#ffffff',
					lineWidth: 2,
					lineColor: null,
					radius: 5
				},
				point: {
					events: {
						click: function(e) {
							if ($scope.isMobile)
								return;

							var uuid = item.pa_indicator + ':' + item.aggregation;
							var month = monthMap[monthList[this.x]];
							var date = [month.year, ('0' + month.month).slice(-2), '01'].join('');

							var canView = false;
							try {
								canView = item.scores[month.display].local.v2_score;
							} catch (err) {
								canView = false;
							}

							var params = '$pa_detailed.do?jvar_uuid=' + uuid + '&jvar_date=' + date;
							var url = '/nav_to.do?uri=' + encodeURIComponent(params);

							if (canView)
								window.open(url);
						}
					}
				}
			}]
	};
	if(!!divId)
		chartObj.chart['renderTo'] = divId;
	if(!!width)
		chartObj.chart['width'] = width;
	if(!!height)
		chartObj.chart['height'] = height;
	if(escape)
		chartObj.series[0].name = chartObj.series[0].name.replace(/</g, '&lt;');
	return new Highcharts5.Chart(chartObj);
};

c.makeSelect = function() {
  setTimeout(function() {
    $('#group-selector').select2({
      allowClear: true,
      minimumResultsForSearch: Infinity
    });
  }, 100);
};

(function init() {
  // Reset the industry and size bucket
  // Can take from parameters here
  c.data.breakdown   =  {type: '', value: ''};
  c.error = !c.data.optedIn || !c.data.indicators || c.data.indicators.idList.length == 0 || !c.data.categories || c.data.categories.idList.length == 0;

  if (c.error)
    return;

  // Set the scores variables
  c.setScores(c.data.months.current);

  c.view = {
    id: null,
    overview: true
  };

  c.category = { id: c.data.categories.idList[0], group: '' };

  try {
    $scope.yourIndustry = c.data.industries.idMap[c.data.industries.current].display;
  } catch (err) {}

  c.setConfig();
  updateBreadcrumbs();

  angular.element(document).ready(function() {
    c.makeSelect();
  });

})();

}