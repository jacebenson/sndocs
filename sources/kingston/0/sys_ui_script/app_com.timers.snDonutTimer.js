angular.module("sn.app_common.timers")
	.directive("snDonutTimer", function(TIME, TIMER_DEFAULT, $window, timerService, getTemplateUrl, i18n) {
		return {
			restrict: 'E',
			templateUrl: "sn_donut_timer",
			scope: {
				name: '@',
				elapsed: '@',
				duration: '@',
				countdown: '@',
				size: '@',
				minutesLabel: '@',
				showBeforeStart: '@',
				showDurationBeforeStart: '@',
				maxDisplayValue: '@',
				ariaParentLabel: '@'
			},
			link: function(scope, element, attr) {
				var msg;
				i18n.getMessages(['Timer for {0} shows {1} minutes and scheduled for {2} minutes',
								  'Timer for {0} shows {1} and scheduled for {2} minutes',
								  'Timer for {0} not running'],
								 function (m) {
					msg = m;
				});
				scope.getAriaTimeLabel = function () {
					if (!msg)
						return '';
					if (scope.display) {
						if (scope.showDisplayValue()) {
							var t;
							if (scope.showDuration())
								t = scope.display.duration;
							else
								t = scope.display.value;
							if (scope.display.minutesLabel)
								return i18n.format(msg['Timer for {0} shows {1} minutes and scheduled for {2} minutes'], [scope.ariaParentLabel, t, Math.ceil(scope.timer.duration/ TIME.MINUTE || 0)]);
							else
								return i18n.format(msg['Timer for {0} shows {1} and scheduled for {2} minutes'], [scope.ariaParentLabel, t, Math.ceil(scope.timer.duration/TIME.MINUTE || 0 )]);
						}
					}
					return i18n.format(msg['Timer for {0} not running'], [scope.ariaParentLabel]);
				};
				// Update the display model in line with the timer
				function refreshDisplayModel() {
					// Count
					if (scope.countdown) {
						var remTime = scope.timer.remainingTime();
						if (remTime <= 0)
							scope.display.value = 0;
						else
							scope.display.value = $window.Math.ceil(remTime/TIME.MINUTE);
					} else
						scope.display.value = $window.Math.floor(scope.timer.elapsed/TIME.MINUTE);
					
					if (scope.display.value > scope.display.maxValue)
						scope.display.value = scope.display.maxValue;
					
					// Rotation
					var rotation = 0;
					if (scope.timer.duration > 0)
						rotation = $window.Math.floor((scope.timer.elapsed/(scope.timer.duration/360))*100)/100;
					
					if (rotation > 360)
						scope.display.rotation = 360;
					else
						scope.display.rotation = rotation;
					
					scope.display.percentage = scope.timer.percentElapsed();
					
					if (scope.timer.duration > 0)
						scope.display.duration = $window.Math.floor(scope.timer.duration/TIME.MINUTE);
				}	
				
				function updateDuration(duration) {
					if (!isNaN(duration))
						scope.timer.duration = parseInt(duration);
				}
				
				function updateElapsed(elapsed) {
					// If it's not running and the elapsed time hasn't been set elsewhere, set the elapsed time.
					if (!scope.timer.running && !isNaN(elapsed)) {
						elapsed = parseInt(elapsed);
						if (elapsed > 0 && scope.timer.elapsed == 0)
							scope.timer.elapsed = elapsed;
					}
				}
				
				function updateSize(size) {
					scope.display.width = size ? size : TIMER_DEFAULT.SIZE;
					scope.display.height = scope.display.width;
				}
				
				function updateMinutesLabel(minutesLabel) {
					if (minutesLabel && minutesLabel == "true")
						scope.display.minutesLabel = true;
					else
						scope.display.minutesLabel = false;
				}
				
				function updateShowBeforeStart(showBeforeStart) {
					if (!showBeforeStart) {
						scope.display.showBeforeStart = true;
						return;
					}
					
					if (showBeforeStart == "true")
						scope.display.showBeforeStart = true;
					else
						scope.display.showBeforeStart = false;
				}
				
				function updateShowDurationBeforeStart(showDurationBeforeStart) {
					if (!showDurationBeforeStart) {
						scope.display.showDurationBeforeStart = false;
						return;
					}
					
					if (showDurationBeforeStart == "true")
						scope.display.showDurationBeforeStart = true;
					else
						scope.display.showDurationBeforeStart = false;
				}
				
				function updateMaxDisplayValue(maxDisplayValue) {
					if (isNaN(maxDisplayValue)) {
						scope.display.maxValue = 999;
						return;
					}
					
					scope.display.maxValue = parseInt(maxDisplayValue);
				}
				
				//Initial setup for display model
				scope.display = {};
				scope.timer = timerService.getTimer(attr.name);
				updateDuration(attr.duration);
				updateElapsed(attr.elapsed);
				updateSize(attr.size);
				updateMinutesLabel(attr.minutesLabel);
				updateShowBeforeStart(attr.showBeforeStart);
				updateShowDurationBeforeStart(attr.showDurationBeforeStart);
				updateMaxDisplayValue(attr.maxDisplayValue);
				refreshDisplayModel();
				
				scope.showDisplayValue = function() {
					if (scope.timer.running)
						return true;
					
					if (scope.timer.elapsed == 0 && !scope.display.showBeforeStart)
						return false;

					return true;
				};
				
				scope.showDuration = function() {
					if (scope.timer.running)
						return false;
					
					if (scope.timer.elapsed == 0 && scope.display.showDurationBeforeStart)
						return true;
					
					return false;
				};
				
				// Observe changes in the name and duration and size
				attr.$observe("name", function(name) {
					scope.timer = timerService.getTimer(name);
					refreshDisplayModel();
				});
				
				attr.$observe("duration", function(duration) {
					updateDuration(duration);
					refreshDisplayModel();
				});
				
				attr.$observe("size", function(size) {
					updateSize(size);
				});
				
				// Update the display model with the timer
				scope.$watch('timer.elapsed', function(newValue, oldValue) {
					refreshDisplayModel();
				}, true);
				
				scope.$watch('timer.duration', function(newValue, oldValue) {
					refreshDisplayModel();
				});
			}
		};
	});