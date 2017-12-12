angular.module('sn.agentSchedule').
directive('agentScheduleMobile',function(getTemplateUrl,i18n,agentScheduleAjaxService,utilityFactory, $rootScope,CalendarView, CalendarEvent,$compile,$sanitize,$location){
	return{
		template:function(){
				return '<div id="agent_calendar" role="application">' +
					'<sn-dhtmlx-scheduler-header-mobile scheduler-config="schedulerConfig" change-config="changeConfig()"></sn-dhtmlx-scheduler-header-mobile>' +
						'<div sn-dhtmlx-scheduler="" class="full-height-width"'+
							'dragged-event="draggedEvent"'+
							'dragging="dragging" '+
							'events="events" ' +
							'scheduler-config="schedulerConfig" '+
							'fetch-events="fetchEvents($startDate, $endDate)" '+
							'marked-spans="markedSpans"' +
							'on-event-click="onEventClick($id,$mouseEvent,$clickDate,$eventObj,$eventState)"' +
							'on-empty-click="onEmptyClick($date,$mouseEvent)"' +
							'on-drag-end="onDragEnd($event)"' +
							'on-event-dbl-click="onEventDblClick($id,$mouseEvent,$eventObj)"' +
							'on-data-loaded="onDataLoaded()"' +
							'on-view-change="onViewChange($new_mode,$new_date)">' +
						'</div>' +
					'<div ng-show="showHideEventPopup" id="eventPopover" class="popover right in" style="display:block;position:absolute;width:300px;">' +
						'<div class="arrow" style="right:0px;left:auto;"></div>' +
						'<div class="popover-content">' +
						'</div>' +
					'</div>' +
				'</div>';	
		},
		restrict:'E',
		scope:true,
		controller:function($scope,$filter,$compile, CalendarView){
			console.log("this is location of "+$location.absUrl());
			
			$scope.showHideEventPopup = false;
			$scope.schedulerConfig = {};
			var mode = jQuery("#awmode").val();
			if(mode){
				$scope.schedulerConfig.mode = mode;
			}else{
				$scope.schedulerConfig.mode = CalendarView.WEEK;
			}
			var date = jQuery("#awdate").val();
			if(date){
				$scope.schedulerConfig.date = new Date(date);
			}else{
				var currentDate = new Date();
				currentDate.setHours(0,0,0,0);
				$scope.schedulerConfig.date = currentDate;
			}
			$scope.schedulerConfig.weekStartDay = utilityFactory.getStartOfWeekDay();
			$scope.schedulerConfig.timeStep = 15;
			$scope.schedulerConfig.viewTimeFormat = "%H:%i";
			//$scope.schedulerConfig.mode = CalendarView.WEEK;
			//$scope.schedulerConfig.date = new Date();
			$scope.schedulerConfig.allowResize = true;
			$scope.schedulerConfig.allowMoving = true;
			jQuery( "title" ).html(i18n.getMessage("My Schedule")+" | ServiceNow");

			var userDateFormat =  g_user_date_format;
			var dhtmlxDateFormat =  "%Y-%m-%d";
			if(userDateFormat){
				dhtmlxDateFormat = utilityFactory.getDhtmlxDateFormat(userDateFormat);
			}
			
			$scope.schedulerConfig.xmlDate = dhtmlxDateFormat + " %H:%i:s";
			$scope.schedulerConfig.nav_height = 0;
			$scope.schedulerConfig.multiDay = true;
			$scope.schedulerConfig.templates = {};
			$scope.schedulerConfig.useSelectMenuSpace = true;
			$scope.schedulerConfig.timeStep = 30;
			$scope.schedulerConfig.scale_height = 36;
			$scope.schedulerConfig.min_event_height = 21;
			$scope.schedulerConfig.allowCreate = true;
			$scope.schedulerConfig.all_timed = true;
			$scope.userConfig = {};
			$scope.userConfig['personalSchedule'] = "";
			//$scope.schedulerConfig.bar_height = 36;
			$scope.eventClicked_id = "";
			$scope.popoverTimeOut = "";
			
			$scope.schedulerConfig.templates.event_class = function (start, end, event) {
				if(event.selected){
					return "eventClass selected-event"+" "+event.theme;
				}else
					return "eventClass"+" "+event.theme;
			}
			
			$scope.configSwitches = "";
			
			$scope.schedulerConfig.renderEvent = function(container, ev, width, height, header_content, body_content, templates) {
				var container_width = container.style.width; // e.g. "105px"
				// move section
				var html = "";
				if(ev.can_edit_events)
					html = "<div class='dhx_event_move my_event_move' style='width: " + container_width + "'></div>";
				html+= "<div class='event_backgroundClass' style='background-color:"+ev.color+";'></div>";
				var event_text = templates.event_text(ev.start_date, ev.end_date, ev);
				if(!ev.sys_id)
					event_text = i18n.getMessage("New Event");
				var adjustedHeader = utilityFactory.getAdjustedLabel($sanitize(event_text), width);
				var ariaLabel = "";
				if(ev.quick_view){
					for (var i = 0;i<ev.quick_view.length;i++){
						ariaLabel+= ev.quick_view[i].label +": "
						ariaLabel+= ev.quick_view[i].value +", "
					}	
				}
				
				html+= "<div id='"+ev.id+"'aria-label='"+ ariaLabel +"' role='link' tabindex='0' class='my_event_body'>";
					// displaying event text

				html += "<span>" + $sanitize(adjustedHeader) + "</span>";
				html += "</div>";

				if(ev.can_edit_events){
					// resize section
					html += "<div class='dhx_event_resize dhx_footer my_event_resize' style='width: " + container_width + "'></div>";	
				}
				container.innerHTML = html;
				container.style.height = (parseInt(container.style.height) - 3) + "px";
				jQuery(container).css('border-color',ev.border_color);
				return true; // required, true - we've created custom form; false - display default one instead
			}
			
			$scope.getMarkedSpans = function(scheduleStartDate, scheduleEndDate, response) { 
				
				var allSpans = response;
				var validSpans = [];
				var resultMarkedSpans = [];
				for (var i = 0; i < allSpans.length; i++) {
					var span = allSpans[i];
					var startDate = utilityFactory.getDateFromDisplayValue(span.start_date_display);
					var endDate = utilityFactory.getDateFromDisplayValue(span.end_date_display);
					if(startDate > scheduleStartDate && startDate > scheduleEndDate && endDate > scheduleStartDate && endDate > scheduleEndDate)
						continue;

					if(startDate < scheduleStartDate && startDate < scheduleEndDate && endDate < scheduleStartDate && endDate < scheduleEndDate)
						continue;

					validSpans.push(span);
				};

				if(!validSpans || validSpans.length == 0){
					resultMarkedSpans.push({
						start_date : scheduleStartDate,
						end_date : scheduleEndDate,
						css:   "dhx_time_block"
					});
				}		
				else{
					resultMarkedSpans.push({
						start_date : scheduleStartDate,
						end_date : scheduleEndDate,
						css:   "dhx_time_block",
						deleteSpan : true
					});
				}


				var prevSpan = null;
				for (var i = 0; i < validSpans.length; i++) {
					
					if(i>0)
						prevSpan = validSpans[i-1];

					var span = validSpans[i];

					var startDate = utilityFactory.getDateFromDisplayValue(span.start_date_display);
					var endDate = utilityFactory.getDateFromDisplayValue(span.end_date_display);

					if(!prevSpan)
					{
						startDate = scheduleStartDate;
						endDate = utilityFactory.getDateFromDisplayValue(span.start_date_display);
					}	
					else{
						startDate = utilityFactory.getDateFromDisplayValue(prevSpan.end_date_display);
						endDate = utilityFactory.getDateFromDisplayValue(span.start_date_display);
					}

					
					if(startDate.getTime() < endDate.getTime()){
						resultMarkedSpans.push({
							start_date : startDate,
							end_date : endDate,
							css:   "dhx_time_block"
						});	
					}
					

					if(i == validSpans.length - 1)
					{
						startDate = utilityFactory.getDateFromDisplayValue(span.end_date_display);
						endDate = scheduleEndDate;
						
						
						if(startDate.getTime() < endDate.getTime()){
							resultMarkedSpans.push({
								start_date : startDate,
								end_date : endDate,
								css:   "dhx_time_block"
							});
						}
					}	
					//break;
				};	
				
				return resultMarkedSpans;
			};
			
			$scope.getDhtmlxEvent= function(configHashMap,userEvents){
				var events = {'userEvents':'','workScheduleSpans':''};
				var dhtmlxuserEvents = [];
				var work_schedule = [];
				if(!jQuery.isEmptyObject(configHashMap) && !jQuery.isEmptyObject(userEvents)){
					for(var i = 0; i< userEvents.length ; i++){
						var dhtmlxEventObj = {}
						angular.copy(userEvents[i],dhtmlxEventObj);
						if(configHashMap[userEvents[i].configuration_id] && !configHashMap[userEvents[i].configuration_id].are_background_events){
							if(dhtmlxEventObj['start_date_display'] && dhtmlxEventObj['end_date_display']){
								var configObj = configHashMap[userEvents[i].configuration_id];
								if (dhtmlxEventObj.id) 
									delete dhtmlxEventObj.id;
								dhtmlxEventObj['color'] = configObj.background_color;
								dhtmlxEventObj['border_color'] = configObj.border_color;
								dhtmlxEventObj['start_date'] = dhtmlxEventObj['start_date_display'];
								dhtmlxEventObj['end_date'] = dhtmlxEventObj['end_date_display'];
								dhtmlxEventObj['sys_id'] = dhtmlxEventObj['target_record'].sys_id;
								dhtmlxEventObj['can_edit_events'] =  configObj.can_edit_events; 
								dhtmlxuserEvents.push(dhtmlxEventObj);
							}
						}else if(configHashMap[userEvents[i].configuration_id] && configHashMap[userEvents[i].configuration_id].are_background_events){
							work_schedule.push(dhtmlxEventObj);
						}
					}
				}
				events.userEvents = dhtmlxuserEvents;
				events.workScheduleSpans =  work_schedule;
				return events;
			};
			
			$scope.fetchEvents = function(startDate, endDate){
//				agentScheduleAjaxService.getAgentWorkSchedule(startDate.getTime(),endDate.getTime()).then(function(response){
//					$scope.markedSpans = $scope.getMarkedSpans(startDate, endDate, response);
//						if(!$scope.$$phase)
//							$scope.$apply();
//				});

//				agentScheduleAjaxService.getAgentEvents(startDate.getTime(),endDate.getTime()).then(function(response){
//					$scope.events = response.timeoffSpans;
//					$scope.configSwitches = response.configSwitches;
//				});
				
				agentScheduleAjaxService.getConfiguration().then(function(response){
					console.log(response);
					if(response && response.result && response.result.configurations){
						$scope.configSwitches = response.result.configurations
					}
				});
				agentScheduleAjaxService.getUserInfo().then(function(response){
					if(response && response.result && response.result.personal_schedule_id){
						$scope.userConfig['personalSchedule'] = response.result.personal_schedule_id;
						agentScheduleAjaxService.getEvents(startDate.getTime(),endDate.getTime()).then(function(response){
							console.log(response);
							if(response && response.result){
								var userEvents = response.result.events;
								var configHashMap = utilityFactory.getConfigHashMap($scope.configSwitches);
								if(!jQuery.isEmptyObject(configHashMap)){
									var events = $scope.getDhtmlxEvent(configHashMap,userEvents);
									$scope.events = events.userEvents;
									var workSpans = events.workScheduleSpans;
									$scope.markedSpans = $scope.getMarkedSpans(startDate, endDate, workSpans);
								}
							}
						});
					}
				});
			}
			
			
			
			$scope.onViewChange = function(new_mode,new_date){
				$scope.showHideEventPopup = false;
				jQuery(".selected-event").removeClass("selected-event");
			};
			
			$scope.showEventDetails = function(tableName,sys_id){
				if(tableName && sys_id){
					var url = new GlideURL(tableName+'.do');
					url.addParam('sys_id', sys_id);
					window.location = url.getURL();
				}
			}
			
			$scope.unselectEvent = function(){
				$scope.showHideEventPopup = false;
				jQuery(".selected-event").removeClass("selected-event");
			};
			
			$scope.showEventPopup = function(id,mouseEvent,$eventObj,popupContent,eventState){
				var eventPopover = jQuery("#eventPopover");
				var arrowDiv = jQuery("#eventPopover .arrow");
				
				if($scope.showHideEventPopup && id != $scope.eventClicked_id){
					$scope.showHideEventPopup = false;
					jQuery(".selected-event").removeClass("selected-event");
				}
				$scope.showHideEventPopup = !$scope.showHideEventPopup;
				
				if($scope.showHideEventPopup){
					jQuery("#eventPopover").removeClass("ng-hide");
					jQuery(".selected-event").removeClass("selected-event");
					var eventElem = jQuery("div[event_id = '"+id+"']");
					eventElem.addClass('selected-event');
					var elemRelToWin = eventElem;
					var eventElemLeft = 1;
					if(eventState && (eventState.mode == "week" || eventState.mode == "day" )){
						var eventParentCol = eventElem.parent();
						elemRelToWin = eventParentCol;
						var eventElemPosition = eventElem.position();
						eventElemLeft = parseInt(eventElemPosition.left);
					}
					
					var actualEventPos = elemRelToWin.position();
					var actualEventPos_x = actualEventPos.left;
					actualEventPos_x = parseInt(actualEventPos_x);
					if(eventElemLeft > 1){
						actualEventPos_x = actualEventPos_x + eventElemLeft;
					}
					var actualEventPos_y = eventElem.position().top;
					var popupContentElem =  jQuery("#eventPopover .popover-content");
					
					eventPopover.removeAttr('right').removeAttr('bottom');
					eventPopover.css('left',0).css('top',0);
					arrowDiv.css('top','50%');
					var temp = $compile(popupContent)($scope);
					popupContentElem.empty().append(popupContent);
					var tableName = $eventObj.target_record.table;
					var sys_id = $eventObj.target_record.sys_id;
					jQuery("#openEventDetails").off().click({"tableName":tableName,"sys_id":sys_id},function(ev){
						$scope.$apply(function(){
							$scope.showEventDetails(ev.data.tableName,ev.data.sys_id);
						});
					});
					
					var eventPopover_width = eventPopover.outerWidth();
					var eventPopover_height = eventPopover.outerHeight();
					var clickPos = utilityFactory.eventPosition(mouseEvent);
					var eventElemWidth = eventElem.css('width').replace("px","");
					eventElemWidth = parseInt(eventElemWidth);
	
					var initialPopOver_x = eventElemWidth ? (eventElemWidth + actualEventPos_x) :actualEventPos_x ;
					if(eventState.mode == "day"){
						initialPopOver_x = clickPos.x;
					}
					var actual_y = clickPos.y - (eventPopover_height / 2);
					
					if ((document.body.offsetWidth - initialPopOver_x - eventPopover_width) < 0) { // tooltip is out of the right page bound
						eventPopover.removeAttr("left");
						if(eventState.mode == "day")
							eventPopover.css('left',initialPopOver_x - (eventPopover_width));
						else
							eventPopover.css('left',initialPopOver_x - (eventElemWidth + eventPopover_width));
						eventPopover.removeClass('right').addClass('left');
						arrowDiv.css('left','auto').css('right',-15);
					} else {
						if (initialPopOver_x < 0) {
							// tooltips is out of the left page bound
							eventPopover.css('left',(clickPos.x) + "px");
						} else {
							// normal situation
							eventPopover.css('left',initialPopOver_x + "px");
							eventPopover.removeClass('left').addClass('right');
							arrowDiv.css('left',-15);
						}
					}
					if ((document.body.offsetHeight - actual_y - eventPopover_height - 2 ) < 0) { // tooltip is below bottom of the page
						eventPopover.removeAttr("top");
						eventPopover.css('top',(document.body.offsetHeight - eventPopover_height - 2 ) + "px");
						if((document.body.offsetHeight - clickPos.y) < 15){
							arrowDiv.removeAttr("top");
							arrowDiv.css('top',(eventPopover_height - 15)+"px");
						}else{
							arrowDiv.removeAttr("top");
							arrowDiv.css('top',(eventPopover_height - (document.body.offsetHeight - clickPos.y)+"px"));
						}	
					} else {
						if (actual_y < 0) {
							// tooltip is higher then top of the page
							eventPopover.css('top',0);
						} else {
							// normal situation
							eventPopover.css('top',actual_y + "px");
						}
					}
					//eventPopover.css('display','visible');
					
					$scope.eventClicked_id = id;
					if($scope.popoverTimeOut)
						window.clearTimeout($scope.popoverTimeOut);
					$scope.popoverTimeOut = window.setTimeout(function(){
						$scope.$apply(function() {
							$scope.showHideEventPopup = false;
						});
					},50000);
				}else{
					jQuery(".selected-event").removeClass("selected-event");
				}
			};
			$scope.onDataLoaded = function(){
				var eventElem = jQuery(".dhx_cal_event_line.eventClass,.dhx_cal_event_clear.eventClass");
//				jQuery(".dhx_cal_data").off("scroll").on("scroll",function(){
//					$scope.$apply(function() {
//						$scope.showHideEventPopup = false;
//					});
//				});
				var eventsArr = this.events;
				if(eventElem && eventElem.length > 0){
					for(var i=0;i<eventElem.length;i++){
						var event_id = jQuery(eventElem[i]).attr("event_id");
						for(var j=0;j<eventsArr.length;j++){
							if(event_id == eventsArr[j].id){
								jQuery(eventElem[i]).css("border-color",eventsArr[j].bordercolorVal);
								break;
							}
						}
					}
				}
			};
			$scope.onEventClick = function(id,mouseEvent,clickDate,eventObj,eventState) {
					var tableName = eventObj.target_record.table;
					var sys_id = eventObj.target_record.sys_id;
					var url = new GlideURL(tableName+'.do');
					url.addParam('sys_id', sys_id);
					window.location = url.getURL();
			};
			$scope.onEventDblClick=function($id,$mouseEvent,$eventObj){
					var tableName = $eventObj.target_record.table;
					var sys_id = $eventObj.target_record.sys_id;
					var url = new GlideURL(tableName+'.do');
					url.addParam('sys_id', sys_id);
					window.location = url.getURL();
			};
			
			//use this changeConfig function to popuplate Settings popup
			$scope.changeConfig = function(){
				var popupContent = "";
				var scheduleConf = i18n.getMessage("Schedule Configuration");
				popupContent = '<div style="display: block;">'+
									'<div class="popover-header popover-header-buttons">'+
										'<h4>'+scheduleConf+'</h4>'+
									'</div>'+
									'<div class="popover-body">';
				if($scope.configSwitches && $scope.configSwitches.length>0){
						var tasks = $scope.configSwitches;
						var configSwitchesHTML = "";
			            for(var i = 0;i < tasks.length; i++){
			            	if(!tasks[i].hidden){
				            	var label = (tasks[i].label && tasks[i].label != "null")?tasks[i].label:tasks[i].name;
				            	label = utilityFactory.getAdjustedLabel($sanitize(label), "200");
				            	configSwitchesHTML = configSwitchesHTML +  '<div class="row">'+
				            													'<div class="circleClass pull-left" style="background-color:'+tasks[i].background_color+'"></div>'+
																                '<label class="labelClass pull-left">'+label+'</label>'+
																                '<div class="input-switch switchClass pull-right">';
								var checkedStr = "";
								if(tasks[i].active)
									checkedStr = "checked";
								var disabledStr = "";
								if(!tasks[i].can_toggle_active)
									disabledStr = "disabled";
								configSwitchesHTML = configSwitchesHTML + '<input aria-label="Checkbox for '+label+'" id="'+tasks[i].id+'" type="checkbox"'+checkedStr+' '+disabledStr+' name="'+tasks[i].id+'">'+
																                    '<label aria-hidden="true" class="switch" for="'+tasks[i].id+'"></label>'+
																                '</div>'+'</div>';
			            	}
			            }
			           popupContent = popupContent+configSwitchesHTML+'</div>';
				 }else{
					var noConfig = i18n.getMessage('Configuration not available'); 
					popupContent =  popupContent + '<div class="row">'+
														noConfig+
									 			 '</div>'					
				 }
				popupContent = popupContent +  '</div>';
				if(popupContent){
					var elem = jQuery("#configPopover .popover-content").empty().append(popupContent);
					jQuery("#configPopover input[type=checkbox]").on("change",$scope.updateConfigChanges);
					$compile(elem)($scope);
				}
					 
			};
			
			$scope.updateConfigChanges = function(){
				var sysparm_display_field = jQuery(this).attr('id');
				var value = jQuery(this).is(":checked");
				if(sysparm_display_field)
					agentScheduleAjaxService.updateConfiguration(sysparm_display_field,value).then(function(response){
//						if(response.success){
							$rootScope.$broadcast('refetchData');
//						}
					});
			}
			
			$scope.fireEventToElement = function(element, dialogFrame){
				if ("createEvent" in dialogFrame.document) {
				    var evt = dialogFrame.document.createEvent("HTMLEvents");
				    evt.initEvent("change", false, true);
				    element.dispatchEvent(evt);
				}
				else
				    element.fireEvent("onchange");
			}
			
			//instead of single emptyClick double emptyclick to create event.
			$scope.clickT = 0;
			$scope.onEmptyClick= function($date,$mouseEvent){
				//var date = utilityFactory.getGlideDateTimeDisplayValues($date);
				console.log('onEmptyClick is called');
				if($scope.clickT == 0){
					$scope.clickT = new Date().getTime();
					window.setTimeout(function(){
						var currentTime = new Date().getTime();
						if((currentTime - $scope.clickT) >= 250){
							$scope.$apply(function(){
								$scope.showHideEventPopup = false;
								jQuery(".selected-event").removeClass("selected-event");
								$scope.eventClicked_id = "";
							});
							$scope.clickT = 0;
						}else{
							$scope.$apply(function(){
								$scope.showHideEventPopup = false;
								jQuery(".selected-event").removeClass("selected-event");
								$scope.eventClicked_id = "";
								$scope.clickT = 0;
								var event = {};
								event.start_date = $date;
								$scope.handleEventChanges(event,true);
							});
							$scope.clickT = 0;
						}
					},250);
				}else{
					$scope.clickT = new Date().getTime();
				}
			}
			
			$scope.onDragEnd = function($event){
				//check event
				console.log('onDragEnd called');
				$scope.showHideEventPopup = false;
				jQuery(".selected-event").removeClass("selected-event");
				var draggedEvent = $event;
				//new event opens up pop-up to feed details of event
				if(draggedEvent && draggedEvent.isNewEvent){
					$scope.handleEventChanges(draggedEvent,true);
				}else{
					var startDate = draggedEvent.start_date;
					var endDate = draggedEvent.end_date;
					//var eventID = draggedEvent.sys_id;
					var configId = draggedEvent.configuration_id;
					//draggedEvent.target_record.sys_id = "f06c82c8c3103200467f10c422d3ae89";
					var targetRecord = draggedEvent.target_record;
					if(startDate && endDate && !jQuery.isEmptyObject(targetRecord) && targetRecord){
//						agentScheduleAjaxService.updateAgentEventTime(startDate.getTime(),endDate.getTime(),eventID).then(function(response){
//								$rootScope.$broadcast('refreshCalendar');
//						});
						agentScheduleAjaxService.updateEvent(startDate.getTime(),endDate.getTime(),targetRecord,configId).then(function(response){
							$rootScope.$broadcast('refreshCalendar');
						},function(errorResponse){
							console.log(errorResponse);
							if(errorResponse && errorResponse.status == "failure"){
								var type = "error";
								var text = "";
								if(errorResponse.error && errorResponse.error.message)
									text = errorResponse.error.message;
								if(text){
									utilityFactory.showNotification(type,text,3000);
								}
							}
							$rootScope.$broadcast('refetchData');
						});
					}
				}
				console.log($event);
			}
			
			$scope.popupLoadScript = function(modal, event, is_new){
//				var dialogFrame = utilityFactory.getDialogFrameFromModal();
//				if(is_new){
//						var dateTimeFormat = g_user_date_time_format.replace(" z","").replace("z ",""); // do not include timezones
//						var dateFormat = g_user_date_format.replace(" z","").replace("z ",""); // do not include timezones;
//						var timeFormat = dateTimeFormat.substring(dateFormat.length + 1);
//
//						dialogFrame.gel("cmn_schedule_span.start_date_tz").value = formatDate(event.start_date, dateFormat);
//						dialogFrame.gel("cmn_schedule_span.start_time_tz").value = formatDate(event.start_date, timeFormat);
//						
//						$scope.fireEventToElement(dialogFrame.gel("cmn_schedule_span.start_date_tz"), dialogFrame);
//						if(event.end_date){
//							dialogFrame.gel("cmn_schedule_span.end_date_tz").value = formatDate(event.end_date, dateFormat);
//							dialogFrame.gel("cmn_schedule_span.end_time_tz").value = formatDate(event.end_date, timeFormat);
//						}
//						$scope.fireEventToElement(dialogFrame.gel("cmn_schedule_span.end_date_tz"), dialogFrame);
//						
//					}	
//			    dialogFrame = null;
			};

			
			$scope.popupCompleteScript = function(action, sys_id, tableName, value){	
				$rootScope.$broadcast('refetchData');
			};
			
			$scope.handleEventChanges = function(event,is_new){
				if(!event)
					return;
				var sys_id = event.sys_id ? event.sys_id : -1;
				var table_name = event.table_name ? event.table_name : "cmn_schedule_span";
				var name = event.name ? event.name : "New Event";
				
				var dateTimeFormat = g_user_date_time_format.replace(" z","").replace("z ",""); // do not include timezones
				var dateFormat = "yyyy-MM-dd";//g_user_date_format.replace(" z","").replace("z ",""); // do not include timezones;
				var timeFormat = "HH:mm:ss";//dateTimeFormat.substring(dateFormat.length + 1);
				if (!event.end_date)
					event.end_date = new Date(event.start_date.getTime() + 30*60000);
				var startDate = formatDate(event.start_date, dateFormat)+" "+formatDate(event.start_date, timeFormat);
				var endDate = formatDate(event.end_date, dateFormat)+" "+formatDate(event.end_date, timeFormat);
				var url = table_name + ".do?";
				url+= "sys_id=" + sys_id+"&";
				url+="sysparm_query=";
				url+= "name=" + name + "^";
				url+= "start_date_time=" + startDate + "^";
				url+= "end_date_time=" + endDate + "^";
				url+= "schedule="+ $scope.userConfig.personalSchedule;
				
				window.location = url;
			};
		},
		link:function(scope,elem,attr){
			scope.events=[];
			scope.markedSpans=[];
			scope.dragging = false;
			jQuery(".dhx_cal_data").off("scroll").on("scroll",function(){
				scope.$apply(function() {
					scope.showHideEventPopup = false;
				});
			});
		},
	}
});
