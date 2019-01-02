function($scope, $rootScope, i18n, $location, $window, spUtil) {  /* widget controller */  var c = this;

c.LIST_VIEW = 'list';

c.KEYS = {TAB: 9, LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32, ESC: 27, ENTER: 13};

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
    Object.keys(linkParams).forEach(function(key) {params[key] = linkParams[key];});

  return params;
};

c.getUrl = function(linkType, linkParams) {
  var params = c.getUrlParams(linkType, linkParams);

  return '?' + Object.keys(params).map(function(key) {return key + '=' + params[key];}).join('&');
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
  c.options.listView = (params.layout == c.LIST_VIEW);

  // Set the breakdowns
  if (!!params.type && !!params.value) {
    c.data.breakdown.type = params.type;
    c.data.breakdown.value = params.value;
  }

  // Set the category
  if (!!params.category && params.category in c.data.categories.idMap) {
    c.category.id = params.category;
	c.setScores(c.data.months.current[c.category.id]);
  }

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
    if(c.IndicatorSelector)
      c.IndicatorSelector = false;
    $event.stopPropagation();
};

c.toggleIndicatorSelector = function($event) {
    c.IndicatorSelector = !c.IndicatorSelector;
    $event.stopPropagation();
};

c.changeCategory = function($event, id) {
  c.category.id = id;
  c.category.group = '';
  c.makeSelect();
  c.setScores(c.data.months.current[id]);
  c.toggleSelector($event, false);
  var doesBreakdownExist = !!c.data.breakdown.type && c.data.breakdownMap[id][c.data.breakdown.type].idList.indexOf(c.data.breakdown.value) < 0;
  if (doesBreakdownExist) {
	  var currBreakdown = c.data.breakdowns[c.data.breakdown.type].idMap[c.data.breakdown.value].display;
	  var currCategory = c.data.categories.idMap[c.category.id].display;
	  var alertMsg = i18n.format(c.data.i18n.alertMsg, [currBreakdown, currCategory]);
	  spUtil.addInfoMessage(alertMsg);
	  c.removeBreakdownSelection();
  }
  var index = c.data.categories.idList.indexOf(id);
  c.data.categories.idList.splice(index, 1);
  c.data.categories.idList.unshift(id);
  updateBreadcrumbs();
};

c.removeBreakdownSelection = function () {
  $("#breakdown").select2("val", "");
  c.bdSelected = '';
  c.data.breakdown.type = '';
  c.data.breakdown.value = '';
};

// Fetch trend from server
c.getTrend = function(item, callback) {
  var id = item.sys_id;
  c.server.get({iid: id}).then(function(response) {

    var updated = false;
	var months;
    if (!!response && !!response.data) {
      months = response.data.months;
      c.data.indicators.idMap[id].scores = response.data.indicators.idMap[id].scores;
      item.ourTrend = c.getOurTrend(item, months.idList.concat().reverse(), months.idMap);
      updated = true;
    }

    callback(item, months, updated);
  });
};

// Set variables with trend data
c.getOurTrend = function(item, months, monthsMap) {
  return {
    name: i18n.getMessage('Your Instance & Percentile Rank'),
    data: months.map(function(m) {
      var theMonth = monthsMap[m];
      return [
        new Date(theMonth.year, theMonth.month-1).valueOf(),
        (m in item.scores) ? item.scores[m].local.value : null
      ];
    }),
    monthlyChange: months.map(function(m) {
      return (m in item.scores) ? item.scores[m].local.monthlyChange : null;
    })
  };
};

c.getTheirScore = function(item, bd, month, months, monthsMap) {
	var score = {value: 0, display: i18n.getMessage('N/A'),
			percentile_rank: i18n.getMessage('N/A')};
	var trend = {name: '', data: null};

	/* Check if a breakdown is selected */
	if (!!bd.type && !!bd.value) {

		/* Set the trend name and data */
		trend.data  =  months.map(function (m) {
			var theMonth = monthsMap[m];
			var value = null;
			try { value = item.scores[m].breakdowns[bd.type].elements[bd.value].mean; }
			catch (err) {}
			return [new Date(theMonth.year, theMonth.month-1).valueOf(), value];
		});

		/* Try to set the score values */
		try {
			/* Set the trend name */
			trend.name     =  c.data.breakdowns[bd.type].idMap[bd.value].display;

			/* Set the score values */
			var element    = item.scores[month].breakdowns[bd.type].elements[bd.value];
			score.value    =  element.mean;
			score.display  =  element.display.toLowerCase();
			if(!!element.rank)
				score.percentile_rank = element.rank;
		}
		catch (err) {}
	}
	else {

		/* Trend values */
		trend.name = i18n.getMessage('Global Benchmark');
		trend.data = months.map(function (m) {
			var theMonth = monthsMap[m];
			var value = null;
			try {
				value = item.scores[m].global.mean;
			}
			catch (err) {}
			return [new Date(theMonth.year, theMonth.month-1).valueOf(), value];
		});

		try {
			/* Set global score value */
			score.value = item.scores[month].global.mean;
			if(!!item.scores[month].global.rank)
				score.percentile_rank = item.scores[month].global.rank;

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

	var display = item.ourScore.display;
	var replaceStr = '';
	if(item.ourScore.display.indexOf('days') != -1) {
		replaceStr = 'days';
	}
	else if(item.ourScore.display.indexOf('day') != -1) {
		replaceStr = 'day';
	}
	else if(item.ourScore.display.indexOf('d') != -1) {
		replaceStr = 'd';
	}
	display = display.replace(replaceStr, '<span class="os-sm">' + replaceStr + '</span>').replace('%', '<span class="os-sm">%</span>');

	if(item.ourScore.display.indexOf('hours') != -1) {
		replaceStr = 'hours';
	}
	else if(item.ourScore.display.indexOf('hour') != -1) {
		replaceStr = 'hour';
	}
	else if(item.ourScore.display.indexOf('h') != -1) {
		replaceStr = 'h';
	}
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
		item.direction      =  '';
	}
};

c.setScores = function(month) {

    var updateScores = function(item, month) {
        var result       =  c.getTheirScore(item, c.data.breakdown, month, months, c.data.months.idMap);
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

        item.ourTrend  =  c.getOurTrend(item, months, c.data.months.idMap);

        /* Get their scores */
        updateScores(item, month);

    });

    /* If the breakdown has changed */
    $scope.$watch('c.data.breakdown.value', function() {
        c.data.indicators.idList.forEach(function(id, index) {
            updateScores(c.data.indicators.idMap[id], month);
        });
        updateBreadcrumbs();
		c.makeAccessible();
    });
};

c.isTouchDevice = function(){
  return ('ontouchstart' in $window);
};

c.getHoursDisplay = function(value) {
    return value == 1 ? i18n.getMessage('1 hour') :
		i18n.format(c.data.i18n.kpiDisplay.hours, value);
  };

c.getDisplayValue = function(mean) {
	var days = Math.floor(mean / 24).toString();
	var hours = (mean % 24).toString();
	if(days == '0') {
		return c.getHoursDisplay(hours);
	}
	else if(hours == '0') {
		return days == '1' ? i18n.getMessage('1 day') :
			i18n.format(c.data.i18n.kpiDisplay.days, days);
	}
	return i18n.format(c.data.i18n.kpiDisplay.days_hours, [days, hours]);
};

c.getYDisplayValue = function(value, item) {
	if(item.unit.indexOf('Hrs') != -1) {
		return c.data.timeUnit == 'hours' ? c.getHoursDisplay(value) : c.getDisplayValue(value);
	}
	if(item.unit.length)
		return item.unit.replace('{0}', value);
	return value;
};

c.accessibilityFormatter = function(point, item, monthList, monthMap) {
	if(c.data.isMobile)
		return;
	var date        = getDateFromTimestamp(point.x, monthList, monthMap);
	var yDisplay    = c.getYDisplayValue(point.y, item);
	if(point.series.name === 'Series 3') {
		return i18n.format(c.data.i18n.recoText, point.text, new Date(point.x).toDateString());
	}
	var resultLabel = i18n.format(c.data.i18n.chart.theirTrend, [date.display, point.series.name, yDisplay]);
	var ourTrend    = item.ourTrend.name   === point.series.name;
	var theirTrend  = item.theirTrend.name === point.series.name;
	if(ourTrend) {
		var rank          = i18n.getMessage('N/A');
		var noData        = true;
		var bd            = c.data.breakdown;
		try {
			noData = !item.scores[date.display].local.v2_score;
			if(!!bd.type && !!bd.value) {
				var breakdown = item.scores[date.display].breakdowns[bd.type];
				rank = breakdown.elements[bd.value].rank;
			}
			else
				rank = item.scores[date.display].global.rank;
		}
		catch(err) {}
		if(noData)
			resultLabel   = i18n.format(c.data.i18n.chart.ourTrendNoPA, [date.display, yDisplay, rank]);
		else
			resultLabel   = i18n.format(c.data.i18n.chart.ourTrend, [date.display, yDisplay, rank]);
	}
	else if(!theirTrend) {
		var index         = point.series.data.indexOf(point);
		var monthlyChange = item.ourTrend.monthlyChange[index];
		if(monthlyChange != null && monthlyChange != 0)
			resultLabel   = (monthlyChange > 0)
							? i18n.format(c.data.i18n.chart.miniTrendIncreased, [date.display, yDisplay, Math.abs(monthlyChange)])
							: i18n.format(c.data.i18n.chart.miniTrendDecreased, [date.display, yDisplay, Math.abs(monthlyChange)]);
		else if(monthlyChange == 0)
			resultLabel   = i18n.format(c.data.i18n.chart.miniTrend, [date.display, yDisplay, monthlyChange + '%']);
		else
			resultLabel   = i18n.format(c.data.i18n.chart.miniTrend, [date.display, yDisplay, i18n.getMessage('N/A')]);
	}
	return  resultLabel;
};

var getDateFromTimestamp = function(ts, monthList, monthMap) {
	var datetime = new Date(ts);
	var month = datetime.getMonth() + 1;
	var year = datetime.getFullYear();
	var monthDisplay = monthList.filter(function(m) {
		return monthMap[m].month == month && monthMap[m].year == year;
	});

	return {
		year: year,
		month: month,
		display: monthDisplay.length ? monthDisplay[0] : null
	};
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
				return c.accessibilityFormatter(point, item, monthList, monthMap);
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
			useHTML: true,
			xDateFormat: '%m/%y',
			pointFormatter: function() {
				var display = c.getYDisplayValue(this.y, item);

				var ourTrend = this.series.name == item.ourTrend.name;
				var noData = true;
				var rank = i18n.getMessage('N/A');
				var seriesName = this.series.name;
				if (ourTrend) {
					seriesName = i18n.getMessage('Your Instance');
					try {
						var dateinfo = getDateFromTimestamp(this.x, monthList, monthMap);
						noData = !item.scores[dateinfo.display].local.v2_score;
						var bd = $scope.data.breakdown;
						if(!!bd.type && !!bd.value) {
							var breakdown = item.scores[dateinfo.display].breakdowns[bd.type];
							rank = breakdown.elements[bd.value].rank;
						}
						else {
							rank = item.scores[dateinfo.display].global.rank;
						}
					} catch (err) {
						noData = true;
					}
				}

                var rank_label = i18n.getMessage('Percentile Rank');
                var ttip = '<span style="color:' + this.color + '; margin-left:1px">\u25CF&nbsp;</span> '
                + seriesName + ': <b>' + display + '</b> ';
                var noDataText ='';
                var rankDisplay = '';
                if(ourTrend) {
                    if(noData &&  !$scope.c.data.isMobile) {
                        noDataText = $scope.c.data.i18n.noPAScoreText;
                    }
                    if(rank == '${N/A}') {
                        rank = i18n.getMessage('N/A');
                    }
                    var icon = '<span class ="fa fa-circle-o" style="color:'+ this.color +'"></span> ';
                    ttip = icon + seriesName + ': <b>' + display + '</b> ';
                    rankDisplay =  icon + rank_label + ': <b>' + rank + '</b>';
                }

                return '<div class="chart-tooltip">' + ttip  + noDataText + '<br/>'+ rankDisplay + '</div>';
            },
            shared: true
        },
		xAxis: {
			type: 'datetime',
			minPadding: 0.1,
			maxPadding: 0.1,
			labels: {
				format: '{value:%m/%y}'
			},
			tickPositions: item.ourTrend.data.map(function(d) {return d[0]})
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
			minPadding: 0.08,
			maxPadding: 0.05,
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
		series: [{
				name:  item.theirTrend.name,
				data:  item.theirTrend.data,
				color: '#5cb85c',
				marker: {
					radius: 3,
					symbol: 'circle'
				}
			}, {
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
							if ($scope.c.data.isMobile)
								return;

							var uuid = item.pa_indicator + ':' + item.aggregation;
							var dateinfo = getDateFromTimestamp(this.x, monthList, monthMap);
							var date = [dateinfo.year, ('0' + dateinfo.month).slice(-2), '01'].join('');

							var canView = false;
							try {
								canView = item.scores[dateinfo.display].local.v2_score;
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

c.makeAccessible = function() {
	setTimeout(function() {
		$('.select2-search-choice-close').attr('aria-label', i18n.getMessage('Close'));
		$('.select2-search-choice-close').attr('role', 'button');
		$('.select2-search-choice-close').attr('tabindex', '-1');
	}, 400);
	$(document).on('keydown', '.select2-container', function(e) {
		c.focusClose(e);
		e.stopImmediatePropagation();
	});
};

c.getCurrentIndicator = function(){
	var urlParams = $location.search();
	var currentIndicator = urlParams.iid;
	var currentCategory = urlParams.category;
	if(currentIndicator !== undefined) {
		var index = c.data.activeGlobalIndicators[currentCategory].idList.indexOf(currentIndicator);
		if(index > -1){
			var selectedIndicatorId = c.data.activeGlobalIndicators[currentCategory].idList.splice(index, 1)[0];
			c.data.activeGlobalIndicators[currentCategory].idList.unshift(selectedIndicatorId);
		}
	}
};

c.changeIndicator = function($event, kpiId){
	c.updateUrl('details',{iid:kpiId});
};

c.focusActiveGroup = function() {
	$('#group-' + c.category.group).focus();
	$('#group-' + c.category.group + ' > a').focus();
};

c.focusKpiDefinition = function() {
	$('#kpi-definition').focus();
};

c.switchTab = function(event, index) {
	var key = null;
	if (event.keyCode === c.KEYS.LEFT || event.keyCode === c.KEYS.UP)
		key = c.KEYS.LEFT;
	else if (event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN)
		key = c.KEYS.RIGHT;
	else if (event.keyCode === c.KEYS.TAB) {
		event.preventDefault();
		if (event.shiftKey)
			$('.btn.dl-btn').focus();
		else
			$('.btn.b-card-view').focus();
	}

	if (key === null)
		return;

	// Get max number of groups in category
	var numGroups = c.data.groups.idList.filter(function(gid) {
		return c.category.id === c.data.groups.idMap[gid].category;
	}).length;

	// Handle left or right key press
	if (key === c.KEYS.LEFT)
		c.category.group = (index == 0) ? '' : (index < 0) ? c.data.groups.idList[numGroups - 1] : c.data.groups.idList[index - 1];
	else if (key === c.KEYS.RIGHT)
		c.category.group = (index < numGroups - 1) ? c.data.groups.idList[index + 1] : '';

	// Focus the group tab and prevent propagation
	c.focusActiveGroup();
	event.preventDefault();
};

c.setSelector = function(value, isCategory) {
	if(isCategory)
		c.categorySelector  = value;
	else
		c.IndicatorSelector = value;
};

c.scrollSelector = function(event, index, isCategory) {
	var updatedIndex  = index;
	var focusRequired = false;
	var idList        = (isCategory) ? c.data.categories.idList : c.data.activeGlobalIndicators[c.category.id].idList;
	var selector      = (isCategory) ? '#cat-' : '#kpi-';

	if (event.keyCode === c.KEYS.UP && index > 0) {
		focusRequired = true;
		updatedIndex  = index - 1;
	}
	if (event.keyCode === c.KEYS.DOWN && index < idList.length - 1){
		focusRequired = true;
		updatedIndex  = index + 1;
	}

	if([c.KEYS.UP, c.KEYS.DOWN].indexOf(event.keyCode) >= 0) {
		if(focusRequired)
			$(selector + idList[updatedIndex] + ' > a').focus();
		event.preventDefault();
	}

	if (event.keyCode === c.KEYS.ESC) {
		c.setSelector(false, isCategory);
		if(isCategory)
			$('#select-category').focus();
		else
			$('#select-kpi').focus();
	}
	if (event.keyCode === c.KEYS.TAB) {
		if((index == 0 && event.shiftKey) || (index == idList.length - 1 && !event.shiftKey))
			c.setSelector(false, isCategory);
	}
	if(event.keyCode === c.KEYS.SPACE)
		event.preventDefault();
};

c.scrollCategory = function(event, index) {
	c.scrollSelector(event, index, true);
};

c.scrollIndicator = function(event, index) {
	c.scrollSelector(event, index, false);
};

c.showSelector = function(event, isCategory) {
	if(!!event.keyCode && [c.KEYS.UP, c.KEYS.DOWN, c.KEYS.ESC, c.KEYS.SPACE, c.KEYS.TAB].indexOf(event.keyCode) < 0)
		return;
	if(event.keyCode == c.KEYS.TAB) {
		if(event.shiftKey)
			c.setSelector(false, isCategory);
	}
	else if(event.keyCode == c.KEYS.ESC) {
		c.setSelector(false, isCategory);
	}
	else {
		c.setSelector(true, isCategory);
		var idList        = (isCategory) ? c.data.categories.idList : c.data.activeGlobalIndicators[c.category.id].idList;
		var selector      = (isCategory) ? '#cat-' : '#kpi-';
		$(selector + idList[0] + ' > a').focus();
		event.preventDefault();
	}
};

c.showCatSelector = function(event) {
	c.showSelector(event, true);
};

c.showKPISelector = function(event) {
	c.showSelector(event, false);
};

c.focusClose = function(event) {
	if(!$('.select2-search-choice-close').first().is(':focus')) {
		if(!!c.data.breakdown.type && !!c.data.breakdown.value && event.keyCode == c.KEYS.TAB && !event.shiftKey) {
			$('.select2-search-choice-close').first().focus();
			event.preventDefault();
		}
	}
	else {
		if(event.keyCode == c.KEYS.TAB && !event.shiftKey) {
			$('.btn.dl-btn').focus();
			event.preventDefault();
		}
		if(event.keyCode == c.KEYS.TAB && event.shiftKey) {
			$('#breakdown').select2('focus');
			event.preventDefault();
		}
		if(event.keyCode == c.KEYS.ENTER) {
			c.data.breakdown.type  = '';
			c.data.breakdown.value = '';
			c.bdSelected           = '';
			$('#breakdown').select2('val', '');
		}
	}
};

(function init() {
  // Reset the industry and size bucket
  // Can take from parameters here
  c.data.breakdown   =  {type: '', value: ''};
  c.bdSelected = '';
  c.error = !c.data.optedIn || !c.data.indicators || c.data.indicators.idList.length == 0 || !c.data.categories || c.data.categories.idList.length == 0;

  if (c.error)
    return;

  c.view = {
    id: null,
    overview: true
  };

  c.category = { id: c.data.categories.idList[0], group: '' };

  try {
    $scope.yourIndustry = c.data.industries.idMap[c.data.industries.current].display;
  } catch (err) {}

  c.setConfig();
  // Set the scores variables
  c.setScores(c.data.months.current[c.category.id]);
  updateBreadcrumbs();
  c.getCurrentIndicator();

  angular.element(document).ready(function() {
    c.makeSelect();
	c.makeAccessible();
  });

})();

}