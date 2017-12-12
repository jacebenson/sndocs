(function($, moment) {
	'use strict';
	/* Usage:
	 * Date Time Picker:
	 *
	 * <span class='input-group' sn-cab-date-time-picker='' display-type='dateTime' date-value="dateValueInScope" date-time-format="DD-MMM-YY hh:mm:ss a">
			<input type='text' class="form-control"></input>
				<span class="input-group-btn">
					<a role="button" class="btn btn-default btn-ref">
						<span aria-hidden="true" class="icon-calendar icon"></span>
						<span class="sr-only">${gs.getMessage('Select date and time')}</span>
					</a>
			</span>
		</span>
	 *
	 *
	 */
	angular.module("sn.itsm.vcab.common").directive('snCabDateTimePicker',
		function($timeout, $document, $rootScope, $window, isMobile) {
			return {
				restrict: "A",
				scope: {
					displayType: '@', //dateTime or date
					dateFormat: '@',
					dateTimeFormat: '@',
					dateValue: '=' // Should be a Date object
				},
				link: function($scope, iEl, iAttrs) {
					var ESC = 27;
					var dateField = $('input', iEl);
					var dateTimePicker;
					var dateTimePickerObj;
					if (!$.fn.datetimepicker) {
						throw 'snCabDateTimePicker: datetimepicker plugin is required but not available.';
					}
					if (!moment) {
						throw 'snCabDateTimePicker: moment js is required but not available.';
					}
					var currentFormat;
					function getDateStr() {
						if ($scope.dateValue)
							return moment($scope.dateValue).format(currentFormat);
						return '';
					}

					if ($scope.displayType === 'dateTime') {
						if (!$scope.dateTimeFormat)
							throw 'dateTimeFormat not provided';
						currentFormat = $scope.dateTimeFormat;
						var config = {
							sideBySide: !isMobile(),
							icons: {
								date: "icon-calendar icon",
								up: "icon-vcr-up icon",
								down: "icon-vcr-down icon"
							},
							defaultDate: getDateStr(),
							format: $scope.dateTimeFormat,
							direction: 'up',
							use24hours: $scope.dateTimeFormat.indexOf('a') < 0 && $scope.dateTimeFormat.indexOf('h') < 0					};
						dateTimePicker = iEl.datetimepicker(config);
						dateTimePickerObj = iEl.data('DateTimePicker');
					}

					if ($scope.displayType === 'date') {
						if (!$scope.dateFormat)
							throw 'dateFormat not provided';
						currentFormat = $scope.dateFormat;
						var config = {
							icons: {
								date: "icon-calendar icon"
							},
							defaultDate: getDateStr(),
							format: $scope.dateFormat //needs to be a date format not having time
						};
						dateTimePicker = iEl.datetimepicker(config);
						dateTimePickerObj = iEl.data('DateTimePicker');
					}

					function setValue() {
						var v = dateField.val();
						if (v){
							$scope.dateValue = moment(v, currentFormat).toDate();
						} else {
							$scope.dateValue = null;
						}
					}
					if (dateField) {
						dateField.on('change.cdp paste.cdp keyup.cdp', function() {
							$timeout(setValue);
						});
// 						$scope.$watch('dateValue', function() {
// 							if (dateField.val() !== getDateStr())
// 								dateField.val(getDateStr());
// 						});
					}

					var isDateTimePickerOpen = false;
					function hideDatePicker() {
						if(isDateTimePickerOpen && dateTimePickerObj)
							dateTimePickerObj.hide();
					}
					$rootScope.$on('dp.show', function($event, msgId) {
						if(msgId == 'dp_show_' + $scope.$id)
							return;
						hideDatePicker();
					});
					function onKeyDown($event) {
						if($event.which != ESC)
							return;
						hideDatePicker();
						$event.stopPropagation();
						$event.preventDefault();
					}

					function onClickOverDatePicker($event) {
						$event.stopPropagation();
						$event.stopImmediatePropagation();
					}
					$document.off('keydown', onKeyDown);
					$document.on("keydown", onKeyDown);

					if (dateTimePicker) {
						dateTimePicker.on('dp.change', function() {
							$timeout(setValue);
						});
						var $dateTimePicker;
						dateTimePicker.on("dp.hide", function(){
							if($dateTimePicker)
								$dateTimePicker.off("click", onClickOverDatePicker);
							if($("body > div.bootstrap-datetimepicker-widget.picker-open").length == 0)
								$scope.$emit("dp.hide");
							isDateTimePickerOpen = false;
						});

						dateTimePicker.on("dp.show", function(){
							$dateTimePicker = $("body > div.bootstrap-datetimepicker-widget.picker-open");
							if($dateTimePicker.length == 0) {
								$scope.$emit("dp.hide");
								isDateTimePickerOpen = false;
								return;
							}
							$scope.$emit("dp.show", ["dp_show_" + $scope.$id]);
							isDateTimePickerOpen = true;
							$dateTimePicker.off('click', onClickOverDatePicker);
							$dateTimePicker.on("click", onClickOverDatePicker);
						});
					}

					$scope.$on('$destroy', function () {
						$document.off('keydown', onKeyDown);
						if($dateTimePicker)
							$dateTimePicker.off('click', onClickOverDatePicker);
						if (dateField) {
							dateField.off('.cdp');
							dateField = null;
						}
						if (dateTimePickerObj)
							dateTimePickerObj.destroy();

					});
				}
			};
		});
}(jQuery, moment));