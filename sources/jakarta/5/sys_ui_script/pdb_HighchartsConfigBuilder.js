var HighchartsBuilder = {
	getChartConfig: function(chartOptions, tzOffset) {
		var chartTitle = chartOptions.title.text,
			xAxisTitle = chartOptions.xAxis.title.text,
			xAxisCategories = chartOptions.xAxis.categories,
			yAxisTitle = chartOptions.yAxis.title.text,
			series = chartOptions.series;

		this.convertEpochtoMs(xAxisCategories);
		this.formatDataSeries(xAxisCategories, series);

		var config = {
			chart: {
				type: 'area',
				zoomType: 'x'
			},
			credits: {
				enabled: false
			},
			title: {
				text: chartTitle
			},
			xAxis: {
				type: 'datetime',
				title: {
					text: xAxisTitle,
					style: {textTransform: 'capitalize'}
				}
			},
			yAxis: {
				reversedStacks: false,
				title: {
					text: yAxisTitle,
					style: {textTransform: 'capitalize'}
				}
			},
			plotOptions: {
				area: {
					stacking: 'normal'
				},
				series: {
					marker: {
						enabled: true,
						symbol: 'circle',
						radius: 2
					},
					step: 'center'
				}
			},
			tooltip: {
				valueDecimals: 2,
				style: {
					whiteSpace: "wrap",
					width: "200px"
				}
			},
			series: series
		};

		var convertedOffset = -1 * (tzOffset/60);

		Highcharts.setOptions({
			lang: {
				thousandsSep: ','
			},
			global: {
				timezoneOffset: convertedOffset
			}
		});

		return config;
	},

    convertEpochtoMs: function(categories) {
		categories.forEach(function(point, index, arr) {
			arr[index] *= 1000;
		});
	},

	formatDataSeries: function(categories, series) {
		series.forEach(function(row, index, arr) {
			arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
				var value = innerRow;
				if (value == "NaN") {
					value = 0;
				}
			    var xValue = categories[innerIndex];
				innerArr[innerIndex] = [xValue, value];
			});
		});
	}
};