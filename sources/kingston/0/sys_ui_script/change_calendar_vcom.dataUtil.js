(function () {
	'use strict';

	var monthNames = [
		"Jan", "Feb", "Mar",
		"Apr", "May", "Jun", "Jul",
		"Aug", "Sep", "Oct",
		"Nov", "Dec"
    ];

	function getBrowserTzOffsetInMs(targetTimeInMs) {
		var offset = new Date(targetTimeInMs).getTimezoneOffset();
		return -offset * 60 * 1000;
	}

	function getZeroPadded(d) {
		if (d < 10)
			return '0' + d;
		return '' + d;
	}

	angular.module('sn.itsm.vcab.common')
	.provider('dataUtil', function () {
		// Default implementation gets it from global variables
		// but we can use angular config block to configure and
		// set our own offsets.
		var tzOffset = window.g_tz_offset;
		var firstDayOfWeek = window.g_first_day_of_week;
		var dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
		var timeFormat = '%h:%i';
		function getUserTzOffsetInMs(targetTimeInMs) {
			if (typeof tzOffset === 'undefined') {
				$log.warn('tzOffset not found falling back to browser timezone');
				return getBrowserTzOffsetInMs(targetTimeInMs);
			}
			return tzOffset;
		}

		function getBrowserTzDiffWithUserTzInMs(targetTimeInMs) {
			return getBrowserTzOffsetInMs(targetTimeInMs) - getUserTzOffsetInMs(targetTimeInMs);
		}

		this.setUserTzOffsetInMs = function (offset) {
			tzOffset = offset;
		};
		this.setFirstDayOfWeek = function (fdw) {
			firstDayOfWeek = fdw;
		};

		this.$get = ['$log', 'i18n', 'calendarUtils', function ($log, i18n, calendarUtils) {
			return {

				setDateTimeFormat: function(newFormat) {
					dateTimeFormat = newFormat;
				},

				setTimeFormat: function(newFormat) {
					timeFormat = newFormat;
				},

				getValue: function (o) {
					if (typeof o === 'object') {
						if ('value' in o)
							return o.value;
					}
					return o;
				},
				dateNowAsPerUserProfile: function () {
					var n = Date.now();
					return n - getBrowserTzDiffWithUserTzInMs(n);
				},
				currentDateAsPerUserProfile: function () {
					var n = Date.now();
					return new Date(n - getBrowserTzDiffWithUserTzInMs(n));
				},
				wsToJsDate: function (d) {
					if (!d)
						return null;
					if (d instanceof Date) // Already converted
						return d;
					var val = this.getValue(d);
					if (!val)
						return null;
					var m = /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/.exec(val);
					if (!m) {
						$log.error('Unexpected. Date value format returned by REST is unrecognizable');
						return;
					}
					// We use value since it is guaranteed to return date time in internal format and 99% times it will be in UTC.
					// For the 1% need to file PRB against Table API to use getUTCValue() instead of getValue() for date fields.
					//.................................Y..............M.................D............H...............m...............s
					var parsedDateMs = Date.UTC(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), parseInt(m[4]), parseInt(m[5]), parseInt(m[6]));
					return new Date(parsedDateMs - getBrowserTzDiffWithUserTzInMs(parsedDateMs));
				},
				jsToWsDate: function (d) {
					if (d) {
						var dtime =  d.getTime();
						d = new Date(dtime - getUserTzOffsetInMs(dtime));
						return d.getFullYear() + '-' + getZeroPadded(d.getMonth() + 1) + '-' + getZeroPadded(d.getDate())
							+ ' ' + getZeroPadded(d.getHours()) + ':' + getZeroPadded(d.getMinutes()) + ':' + getZeroPadded(d.getSeconds());
					} else {
						return null;
					}
				},
				strToNum: function (s, defaultVal) {
					if (!defaultVal)
						defaultVal = 0;
					return s ? s * 1 : defaultVal;
				},
				dateToFriendlyText: function (date) {
					if (date) {
						var d = date.getDate();
						var m = monthNames[date.getMonth()];
						var h = getZeroPadded(date.getHours());
						var min = getZeroPadded(date.getMinutes());
						return i18n.getMessage(m) + " " + d + " " + calendarUtils.getScheduler().date.date_to_str(timeFormat)(date);
					}
					return i18n.getMessage('Unbounded');
				},
				dateRangeToFriendlyText: function (startDate, endDate) {
					var sUnbounded = !startDate;
					if (!sUnbounded) {
						var sD = startDate.getDate();
						var sM = monthNames[startDate.getMonth()];
						var sH = getZeroPadded(startDate.getHours());
						var sMin = getZeroPadded(startDate.getMinutes());
					}
	
					var eUnbounded = !endDate;
					if (!eUnbounded) {
						var eD = endDate.getDate();
						var eM = monthNames[endDate.getMonth()];
						var eH = getZeroPadded(endDate.getHours());
						var eMin = getZeroPadded(endDate.getMinutes());
					}
	
					var msg = i18n.getMessage("{0} to {1}");
					var a;
					var b;
					if (!sUnbounded)
						a = i18n.getMessage(sM) + " " + sD + " " + calendarUtils.getScheduler().date.date_to_str(timeFormat)(startDate);
					else
						a = i18n.getMessage('Unbounded');
	
					if (!eUnbounded) {
						if (sUnbounded || sM !== eM || sD !== eD)
							b = i18n.getMessage(eM) + " " + eD + " " + calendarUtils.getScheduler().date.date_to_str(timeFormat)(endDate);
						else
							b = calendarUtils.getScheduler().date.date_to_str(timeFormat)(endDate);
					} else {
						if (sUnbounded) // When both unbounded then send a single 'Unbounded' msg.
							return a;
						else
							b = i18n.getMessage('Unbounded');
					}
					return i18n.format(msg, [a, b]);
				},
				getFirstDayOfWeek: function () {
					if (typeof firstDayOfWeek === 'undefined') {
						$log.warn('firstDayOfWeek not found falling back to 1');
						return 1;
					}
					return firstDayOfWeek;
				},
				mergeSortedArrays: function (a, b, comparator) {
					var c = [];
					var ca = 0;
					var cb = 0;
					var va;
					var vb;
					var aNotEmpty;
					var bNotEmpty;
					while (ca < a.length || cb < b.length) {
						aNotEmpty = ca < a.length;
						bNotEmpty = cb < b.length;
						var finalVal;
						if (aNotEmpty) {
							va = a[ca];
						}
						if (bNotEmpty) {
							vb = b[cb];
						}
						if (aNotEmpty && bNotEmpty) {
							if (comparator(va, vb) <= 0) {
								c.push(va);
								ca++;
							} else {
								c.push(vb);
								cb++;
							}
						} else if (aNotEmpty) {
							c.push(va);
							ca++;
						} else {
							c.push(vb);
							cb++;
						}
					}
					return c;
				}
			};
		}];
	})
	.filter('dateToFriendlyText', function (dataUtil, $log) {
		return function (input) {
			if (!(input instanceof Date)) {
				$log.warn('dateToFriendlyText filter: Did not get date object as expected');
				input = new Date(input);
			}
			return dataUtil.dateToFriendlyText(input);
		};
	})
	.filter('dateRangeToFriendlyText', function (dataUtil, $log) {
		return function (start, end) {
			if (!(start instanceof Date)) {
				$log.warn('dateRangeToFriendlyText filter: Did not get start date object as expected');
				start = new Date(start);
			}
			if (!(end instanceof Date)) {
				$log.warn('dateRangeToFriendlyText filter: Did not get end date object as expected');
				end = new Date(end);
			}
			return dataUtil.dateRangeToFriendlyText(start, end);
		};
	});

} ());