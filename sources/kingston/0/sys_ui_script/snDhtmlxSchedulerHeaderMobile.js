(function() {
	'use strict';
	angular.module('sn.agentcalendarwidget').directive('snDhtmlxSchedulerHeaderMobile', function(calendarUtils, templateUrlGenerator,getTemplateUrl, CalendarView, CalendarEvent, $rootScope,$timeout,i18n) {
	return{
		template:function(){
return '<div class="container-fluid cd_nav">' +
	   '<div class="row">' +
			'<div  class="col-md-3" style="text-align:center">' +
					 '<div class="cd_calDate"style="display:inline-block;" >' +  	
				   	 	'<div id="cal_date" role="heading" aria-live="assertive"></div>' +
				   	 '</div>' +
			'</div>' + 
	   		'<div class="col-md-3">' +  
				'<div style="float:left">' +
					'<div class="mini-calendar" style="display:inline-block;margin-right:5px!important;">' +
						'<button aria-haspopup="true" id="mini-calendar-button" style="font-size:8px" type="button" data-placement="auto" ng-click = "showMiniCal()" class="cd-tooltip viewBtn btn btn-default icon-calendar" title="" data-original-title={{configurationTooltip}}></button>'
	+			   	'</div>' +
					'<div class="cd_dateNav" style="display:inline-block;">' +
							'<div class="btn-group" role = "group">' +
								'<button id="cal_prev" style="font-size:8px" type="button" class="btn btn-default icon-vcr-left" ng-click = "prevButton()"></button>' +
								'<button id="cal_today" style="font-size:8px" type="button" class="btn btn-default" ng-click = "todayButton()">{{todayBtn}}</button>' +
								'<button id="cal_next" style="font-size:8px" type="button" class="btn btn-default icon-vcr-right" ng-click = "nextButton()"></button>' +
							'</div>' +
					'</div>' +  
				'</div>' +
				'<div style="float:right">' +
					'<div class="cd_calMode" style="display:inline-block">' +
							'<div class="btn-group" role = "group" style="margin-right:5px!important;">' +
								'<button role="checkbox" style="font-size:8px" aria-checked = "{{checkViewScale(\'day\')}}" ng-if="schedulerConfig.supportedModes.indexOf(\'day\') > -1" id="dayViewBtn" type="button" class="btn btn-default dayweekbtn" ng-click = "switchDayWeekView(\'day\')">{{dayBtn}}</button>' +
								'<button role="checkbox" style="font-size:8px" aria-checked = "{{checkViewScale(\'week\')}}"ng-if="schedulerConfig.supportedModes.indexOf(\'week\') > -1" id="weekViewBtn" type="button" class="btn btn-default dayweekbtn" ng-click = "switchDayWeekView(\'week\')">{{weekBtn}}</button>' +
								'<button role="checkbox" style="font-size:8px" aria-checked = "{{checkViewScale(\'month\')}}" ng-if="schedulerConfig.supportedModes.indexOf(\'month\') > -1" id="monthViewBtn" type="button" class="btn btn-default dayweekbtn" ng-click = "switchDayWeekView(\'month\')">{{monthBtn}}</button>' +
							'</div>' +
								'<button id="conf-settings-button" style="font-size:8px" aria-haspopup="true" type="button" data-placement="auto" ng-click = "openConfigPopup()" class="cd-tooltip viewBtn btn btn-default icon-configuration" title="" data-original-title={{configurationTooltip}}></button>' +
							'<div ng-show="showHideconfigPopup" id="configPopover" class="popover bottom in" style="display:block;position:absolute;width:250px">' +
								'<div class="arrow" style="right:0px;left:auto;"></div>' +
								'<div class="popover-content">' +

								'</div>' +
							'</div>' +
					'</div>' +
			   	'</div>' +

	   		'</div>' +

		   	'<div class="col-xs-6">' +
		   '</div>' +
		'</div>' +
'</div>';
		},
		restrict:'E',
		replace:true,
		scope:{
				changeConfig: '&',
				schedulerConfig: '=',
			},
		link: function(scope, element, attrs, ctrls){
			jQuery('.dayweekbtn').removeClass('active');
			jQuery('#'+scope.schedulerConfig.mode+'ViewBtn').addClass('active');
			addLateLoadEvent(function(){
				var configBtnPosition = jQuery('#conf-settings-button').position();
				jQuery("#configPopover").css('top',configBtnPosition.top + 40).css('right','15px').css('left','auto');
			});
			scope.openConfigPopup =  function(){
				scope.showHideconfigPopup = !scope.showHideconfigPopup;
				if(scope.showHideconfigPopup){
					jQuery("#conf-settings-button").addClass("active");
					scope.changeConfig();
				}else
					jQuery("#conf-settings-button").removeClass("active");
			};
			
			scope.prevButton = function(){
				$rootScope.$broadcast('previousDate');
			};
			
			scope.nextButton =  function(){
				$rootScope.$broadcast('nextDate');
			};
			scope.todayButton = function(){
				$rootScope.$broadcast('today');
			};
			scope.showMiniCal = function(){
				$rootScope.$broadcast('showMiniCal');
			};

			scope.switchDayWeekView = function(scale){
					if(scope.viewScale != scale){
						scope.viewScale = scale;
						if(scale == "week"){
							jQuery('.dayweekbtn').removeClass('active');
							jQuery('#weekViewBtn').addClass('active');
						}else if(scale == "day"){
							jQuery('.dayweekbtn').removeClass('active');
							jQuery('#dayViewBtn').addClass('active');
						}else{
							jQuery('.dayweekbtn').removeClass('active');
							jQuery('#monthViewBtn').addClass('active');
						}
						$rootScope.$broadcast('changeMode',scale);
					}
				};
				
			scope.$on('displayHeaderDateChange',function(event,newDisplayDate){
				jQuery("#cal_date").html(newDisplayDate);
			});	
		},
		controller:function($scope,$filter,$compile){
			$scope.dayBtn = i18n.getMessage("Day");
			$scope.weekBtn = i18n.getMessage("Week");
			$scope.monthBtn = i18n.getMessage("Month");
			$scope.todayBtn = i18n.getMessage("Today");
			$scope.showHideconfigPopup = false;
			if($scope.schedulerConfig && $scope.schedulerConfig.mode)
				$scope.viewScale = $scope.schedulerConfig.mode;
			else
				$scope.viewScale = CalendarView.WEEK;
			
		},
	}
	
	});
}());