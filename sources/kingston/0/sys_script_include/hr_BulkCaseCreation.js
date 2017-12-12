var hr_BulkCaseCreation = Class.create();
hr_BulkCaseCreation.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	type: 'hr_BulkCaseCreation',
	
	getHRCaseCreationDefaultFields:function(){
		return gs.getProperty("sn_hr_core.hr_case_creation_default_fields","");
	},
	
	
	getSysIdInGroups: function(groupsSysid,isCallFromListView){
		var groupMembers=[];
		if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return groupMembers;
		var groups=groupsSysid.split(',');
		var grGroup= new GlideRecord('sys_user_grmember');
		grGroup.addEncodedQuery('group.sys_idIN'+groups.join());
		if(gs.getProperty("sn_hr_core.hideUserSelectionCriteriaCount",true)&&(isCallFromListView!=true))	
			grGroup.setLimit(parseInt(gs.getProperty('sn_hr_core.userSelectionCriteriaCountLimit',5000)));
		grGroup.query();
		while(grGroup.next()){
			groupMembers.push(grGroup.user.toString());
		}
		return groupMembers;
	},
	
	getSysIdInRoles: function(rolesSysids,isCallFromListView){
		var usersWithRoles=[];
		if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return usersWithRoles;
		var roles=rolesSysids.split(',');
		var grRole= new GlideRecord('sys_user_has_role');
		grRole.addEncodedQuery('state=active^role.sys_idIN'+roles.join());
		if(gs.getProperty("sn_hr_core.hideUserSelectionCriteriaCount",true)&&(isCallFromListView!=true))	
			grRole.setLimit(parseInt(gs.getProperty('sn_hr_core.userSelectionCriteriaCountLimit',5000)));
		grRole.query();
		while(grRole.next()){
			usersWithRoles.push(grRole.user.toString());
		}
		return usersWithRoles;
	},
	
	
	
		//Return the unique list of users from different HR criteria
	getUniqueUsersForMultipleHRCriteria:function(givenhrCriteriaList)
	{
		var hrCriteriaList=givenhrCriteriaList.split(",");
		var returnQuery={
			useDynamicQuery:false,
			dynamicQuery:"",
			resQuery:"",
			shouldHideCount:false
		};

		for(var i=0;i<hrCriteriaList.length;i++){
		 returnQuery=this.getUsersForHRCriteriaFromUserSelection(hrCriteriaList[i],returnQuery);
		}
		return returnQuery;
	},


	getUsersForHRCriteriaFromUserSelection: function(hrCriteria,returnQuery)
	{
		var childReturnQuery={
			useDynamicQuery:false,
			dynamicQuery:"",
			resQuery:"",
			shouldHideCount:false
		};

		var hasCondition=false;

		var grSnHrCoreM2mConditionCriteria = new GlideRecord("sn_hr_core_m2m_condition_criteria");
		grSnHrCoreM2mConditionCriteria.addEncodedQuery("hr_conditionISNOTEMPTY^hr_criteriaISNOTEMPTY");
		grSnHrCoreM2mConditionCriteria.addQuery('hr_criteria', hrCriteria);
		grSnHrCoreM2mConditionCriteria.query();
		if(grSnHrCoreM2mConditionCriteria.hasNext()){
		hasCondition =  true;
		while (grSnHrCoreM2mConditionCriteria.next()) {
			var hrCond = grSnHrCoreM2mConditionCriteria.hr_condition;
			var grSnHrCoreCondition = new GlideRecord("sn_hr_core_condition");
			if (grSnHrCoreCondition.get(hrCond)) {
				if(grSnHrCoreCondition.table!="sys_user"){
					var snHRConditionJson = {
						table:grSnHrCoreCondition.table.toString(),
						query:grSnHrCoreCondition.condition.toString(),
						user_column:grSnHrCoreCondition.user_column.toString()
					};
					if(snHRConditionJson.table!=""&&snHRConditionJson.query!=""&&snHRConditionJson.user_column!=""){
						
						childReturnQuery.shouldHideCount= childReturnQuery.shouldHideCount==false?this.getUsersSysidsCountFromCriteriaConditionMatching(hrCond):true;
						
						childReturnQuery.useDynamicQuery=true;
						var dynamicQueryResult="sys_idINjavascript: new sn_hr_core.hr_BulkCaseCreation().getUsersSysidsFromCriteriaConditionMatching('"+hrCond+"',false);";
						childReturnQuery.dynamicQuery = childReturnQuery.dynamicQuery==""? dynamicQueryResult : childReturnQuery.dynamicQuery+'^'+dynamicQueryResult;
					}
					else{
						childReturnQuery.useDynamicQuery=true;
						childReturnQuery.dynamicQuery = "sys_idINEMPTY";
					}
				}
				else if(grSnHrCoreCondition.table=="sys_user") {
					var cond = grSnHrCoreCondition.getValue("condition").toString();
					cond = cond.replaceAll("^EQ","");	
					if(cond!=""){
					if(childReturnQuery.useDynamicQuery)
						childReturnQuery.dynamicQuery = childReturnQuery.dynamicQuery==""? childReturnQuery.dynamicQuery : childReturnQuery.dynamicQuery+"^"+cond;
					else
						childReturnQuery.resQuery = childReturnQuery.resQuery==""? cond : childReturnQuery.resQuery+'^'+cond;
					}
				}
			 }
		  }
	    }

		if(!hasCondition)
			childReturnQuery.resQuery = "sys_idISEMPTY";

		if(!returnQuery.useDynamicQuery)
			returnQuery.useDynamicQuery=childReturnQuery.useDynamicQuery;
		if(childReturnQuery.useDynamicQuery)
			returnQuery.dynamicQuery = returnQuery.dynamicQuery==""? childReturnQuery.dynamicQuery : returnQuery.dynamicQuery+"^NQ"+childReturnQuery.dynamicQuery;

		returnQuery.resQuery= returnQuery.resQuery==""? childReturnQuery.resQuery : returnQuery.resQuery+"^NQ"+childReturnQuery.resQuery ;
         returnQuery.shouldHideCount = returnQuery.shouldHideCount==false?childReturnQuery.shouldHideCount : true;
		return returnQuery;
	},


	getUsersSysidsFromCriteriaConditionMatching : function(hrCond,isCallFromListView)
	{
		var returnSysid =[];
		var grSnHrCoreCondition = new GlideRecord("sn_hr_core_condition");
		if (grSnHrCoreCondition.get(hrCond)) {
			var curGR = new GlideRecord(grSnHrCoreCondition.table);
			curGR.addEncodedQuery(grSnHrCoreCondition.condition);
			if(gs.getProperty("sn_hr_core.hideUserSelectionCriteriaCount",true)&&(isCallFromListView!=true))	
			 curGR.setLimit(parseInt(gs.getProperty('sn_hr_core.userSelectionCriteriaCountLimit',5000)));
			curGR.query();
			while (curGR.next()) {
			if (grSnHrCoreCondition.user_column != null && grSnHrCoreCondition.user_column !=""){
				var cur = curGR.getValue(grSnHrCoreCondition.user_column);
				returnSysid.push(cur);
				}
			}

		}
		if(returnSysid.length>0)
		return returnSysid;
		else
		return "EMPTY";
	},
	
	
	getUsersSysidsCountFromCriteriaConditionMatching : function(hrCond)
	{
		var returnSysid =[];
		var grSnHrCoreCondition = new GlideRecord("sn_hr_core_condition");
		if (grSnHrCoreCondition.get(hrCond)) {
			var curGR = new GlideRecord(grSnHrCoreCondition.table);
			curGR.addEncodedQuery(grSnHrCoreCondition.condition);
			curGR.query();
			if(curGR.getRowCount()>=parseInt(gs.getProperty('sn_hr_core.userSelectionCriteriaCountLimit',5000))
		 && gs.getProperty("sn_hr_core.hideUserSelectionCriteriaCount",true))	
			return true;
		else
			return false;
			

		}
		return false;
		
	},
	
	
	
	getHRCriteriaDisplayValue:function(sysparm_hr_criteria_sysids){
		var resultHRCriteria=[];
		if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return resultHRCriteria;
		var givenHRCriteria = sysparm_hr_criteria_sysids;
		var getHRCriteria = new GlideRecord("sn_hr_core_criteria");
		getHRCriteria.addEncodedQuery('sys_idIN'+givenHRCriteria);
		getHRCriteria.query();
		while(getHRCriteria.next()){
			var resName=getHRCriteria.getDisplayValue('name');
			var resid=getHRCriteria.getValue('sys_id');
			resultHRCriteria.push({name:resName,value:resid});
			}
			return JSON.stringify(resultHRCriteria);
		},
		
		
		getEncodedQueryForCriteria :function(userSelectionQuery,userSelectionType){
			var sendEncodedCriteria={
				encodedCriteria:"",
				shouldHideCount:false,
				hrCriteria:{}
			};
			if(userSelectionType=="user_criteria"){
				var resultUserCriteriaValue=new sn_hr_core.hr_UserCriteriaEvaluation().getAllUsersForUserCriteria(userSelectionQuery);
				sendEncodedCriteria.encodedCriteria = resultUserCriteriaValue.resultQuery;
				sendEncodedCriteria.shouldHideCount = resultUserCriteriaValue.shouldHideCount;
			}
			else if(userSelectionType=="hr_criteria"){
				var resultHrCriteriaValue=this.getUniqueUsersForMultipleHRCriteria(userSelectionQuery);
				sendEncodedCriteria.encodedCriteria = resultHrCriteriaValue.resQuery;
				sendEncodedCriteria.shouldHideCount = resultHrCriteriaValue.shouldHideCount;
				sendEncodedCriteria.hrCriteria = resultHrCriteriaValue;
			}
			else
				sendEncodedCriteria.encodedCriteria=userSelectionQuery;
			return sendEncodedCriteria;
		},
		
		
		getUsersSysidsFromCriteriaCondition : function(table,query,user_column){
			var returnSysid =[];
			if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return returnSysid;
			var curGR = new GlideRecord(table);
			curGR.addEncodedQuery(query);
			curGR.query();
			while (curGR.next()) {
				if (user_column != null && user_column !=""){
					var cur = curGR.getValue(user_column);
					returnSysid.push(cur);
				}
			}
			return returnSysid;
		},
		
		
		getUserCriteriaDisplayValue:function(sysparm_user_criteria_sysids){
			var resultUserCriteria=[];
			if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return resultUserCriteria;
			var givenUserCriteria = sysparm_user_criteria_sysids;
			var getUserCriteria = new GlideRecord("user_criteria");
			getUserCriteria.addEncodedQuery('sys_idIN'+givenUserCriteria);
			getUserCriteria.query();
			while(getUserCriteria.next()){
				var resName=getUserCriteria.getDisplayValue('name');
				var resid=getUserCriteria.getValue('sys_id');
				resultUserCriteria.push({name:resName,value:resid});
				}
				return JSON.stringify(resultUserCriteria);
			},
			
			
			
			//call to userSelectionStackPop from GlideAjax
			callUserSelectionStackPop : function(){
				if((gs.action.getGlideURI().toString().indexOf('stack')==-1)&&(gs.action.getGlideURI().toString().indexOf('hr_userselection_view')!=-1))         {
					var gsecurity = new global.HRSecurityUtilsAjax();
					gsecurity.userSelectionStackPop();
					return "Success";
				}
				return "Failed to Clean Stack";
			},
			
			
			calculateEncodedQuery:function(encodedQuery,genOption){
				var resultencodedQueryURI={
				encodedQueryURI :"sys_idISEMPTY",
				shouldHideCount : false
				};
				
				var resultantEncodedQuery=this.getEncodedQueryForCriteria(encodedQuery,genOption);
				
				if(genOption=="hr_criteria"){
					var resultantEncodedQueryAfter = resultantEncodedQuery.hrCriteria;
					if(resultantEncodedQueryAfter.useDynamicQuery&&resultantEncodedQueryAfter.resQuery!="")
						resultencodedQueryURI.encodedQueryURI = resultantEncodedQueryAfter.dynamicQuery+"^NQ"+resultantEncodedQueryAfter.resQuery;
					else if(resultantEncodedQueryAfter.useDynamicQuery)
						resultencodedQueryURI.encodedQueryURI = resultantEncodedQueryAfter.dynamicQuery;
					else
						resultencodedQueryURI.encodedQueryURI = resultantEncodedQueryAfter.resQuery;
				}
				else
					resultencodedQueryURI.encodedQueryURI=resultantEncodedQuery.encodedCriteria;
				
				resultencodedQueryURI.shouldHideCount = resultantEncodedQuery.shouldHideCount;
				
				return resultencodedQueryURI;
			},
	
	
	        getUserSelectionEncodedQuery: function(encodedQuery,genOption){
				var resultantEncodedValue=this.calculateEncodedQuery(encodedQuery,genOption);
				if(genOption=="user_criteria")
						resultantEncodedValue.encodedQueryURI=resultantEncodedValue.encodedQueryURI.replaceAll(',false)',',true)');
	            else if(genOption=="hr_criteria")
						resultantEncodedValue.encodedQueryURI=resultantEncodedValue.encodedQueryURI.replaceAll(',false);',',true)');
				return resultantEncodedValue.encodedQueryURI;
			},
			
			
			/**
 			* Calculates the count of profiles/users for given encodedQuery. Used for AJAX request
 			*/
			getUsersCount: function(encodedQuery,countProfile,genOption) {
				if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			       return ;
				var queryWithCount = {};
					queryWithCount.count= -1;
					queryWithCount.query = encodedQuery;
					queryWithCount.url="";
				    queryWithCount.hideCount = false;
					
					if (gs.hasRole("sn_hr_core.case_writer") || gs.hasRole("sn_hr_core.content_reader")) {
						var ga;
						if ((!countProfile)&&(genOption!="upload_file"))
							ga = new GlideAggregate("sys_user");
						else if(genOption=="upload_file")
							ga = new GlideAggregate("sn_hr_core_bulk_case_creation_data");
						else
							ga = new GlideAggregate("sn_hr_core_profile");
						
						if (encodedQuery){
							
							if(genOption!="upload_file"){
								var returnEncodedQuery = this.calculateEncodedQuery(encodedQuery,genOption);
								gs.info(returnEncodedQuery.shouldHideCount +'returnEncodedQuery.shouldHideCount');
								if(returnEncodedQuery.shouldHideCount)
									queryWithCount.hideCount=true;
								ga.addEncodedQuery(returnEncodedQuery.encodedQueryURI);
								if(genOption=="user_criteria"){
									returnEncodedQuery.encodedQueryURI=returnEncodedQuery.encodedQueryURI.replaceAll(',false)',',true)');
									queryWithCount.url="/sys_user_list.do?v=1&sysparm_query=" + returnEncodedQuery.encodedQueryURI + "&sysparm_preview=true";
								}
								else if(genOption=="hr_criteria"){
									returnEncodedQuery.encodedQueryURI=returnEncodedQuery.encodedQueryURI.replaceAll(',false);',',true)');
									queryWithCount.url="/sys_user_list.do?v=1&sysparm_query=" + returnEncodedQuery.encodedQueryURI + "&sysparm_preview=true";
								}
							}
							else if(genOption=="upload_file"){
								ga.addEncodedQuery("bulk_case_creation_run.sys_id="+encodedQuery+"^query_result=Found^userISNOTEMPTY");
								queryWithCount.url="/sn_hr_core_bulk_case_creation_data_list.do?v=1&sysparm_query=bulk_case_creation_run.sys_id="+encodedQuery+"^query_result=Found^userISNOTEMPTY&sysparm_preview=true";
							}
						}
						else
							ga.addEncodedQuery(!countProfile ? "active=false^active=true" : "numberISEMPTY");
						
						ga.addAggregate('COUNT');
						ga.query();
						
						var users_query;
						if (ga.next())
							users_query= ga.getAggregate('COUNT');
						queryWithCount.count=users_query;
					}
					
					return queryWithCount;
				},
				
				/**
 				* Calculate the the count of profiles/users for a given encodedQuery and HR Service criteria.
 				*/
				getServiceUsersCount: function(queryTableParm, encodedQueryParm, hrServiceSysIdParm, hrSelectionType) {
					if (!gs.hasRole("sn_hr_core.case_writer"))
						return 0;
					
					var queryTable = queryTableParm;
					var encodedQuery = encodedQueryParm;
					var hrServiceSysId = hrServiceSysIdParm;
					var hrSelectedType = hrSelectionType;
					
					// Get all criteria on the HR Service
					var criteria;
					var serviceGr = new GlideRecord("sn_hr_core_service");
					if (serviceGr.get(hrServiceSysId))
						criteria = serviceGr.getValue("hr_criteria");
					else
						return 0;
					
					// Query table with passed in encoded query
					var userGr = new GlideRecord("sys_user");
					if (encodedQuery){
						if(hrSelectionType!="upload_file"&&hrSelectionType!="hr_profile"){
							var returnEncodedQuery = this.getUserSelectionEncodedQuery(encodedQuery,hrSelectionType);
							userGr.addEncodedQuery(returnEncodedQuery);
						}
						else if(hrSelectionType=="upload_file"||hrSelectionType=="hr_profile"){
							var resultUserSysid =[];
							
							if(hrSelectionType=="upload_file")
								resultUserSysid =this.getUsersSysidsFromCriteriaCondition("sn_hr_core_bulk_case_creation_data","bulk_case_creation_run.sys_id="+encodedQuery+"^query_result=Found^userISNOTEMPTY","user");
							else if(hrSelectionType=="hr_profile")
								resultUserSysid=this.getUsersSysidsFromCriteriaCondition("sn_hr_core_profile",encodedQuery,"user");
							
							if(resultUserSysid.length>0)
								userGr.addEncodedQuery("sys_idIN"+resultUserSysid.join());
							else
								userGr.addEncodedQuery("sys_idINEMPTY");
						}
					}
					else
						userGr.addQuery("sys_id", null);
					
					// If HR Service have criteria
					if (criteria){
						var hrServiceEncodedQuery = this.getUserSelectionEncodedQuery(criteria,"hr_criteria");
						userGr.addEncodedQuery(hrServiceEncodedQuery);
					}
					userGr.query();
					var count = userGr.getRowCount();
					return count;
				},
				
				//check current user has content reader
				checkCurrentUser: function() {
					if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			          return;
					var currentUser = gs.getUserID();
					var hasManageContentRole = false;
					var grSysUserHasRole = new GlideRecord('sys_user_has_role');
					grSysUserHasRole.addQuery('user', currentUser);
					grSysUserHasRole.addQuery('role.name','sn_hr_core.content_reader');
					grSysUserHasRole.query();
					hasManageContentRole = grSysUserHasRole.hasNext();
					return hasManageContentRole;
				},
				
				getHRCriteriaQuery: function() {
					if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			              return;
					var userList = [];
					if (gs.hasRole("sn_hr_core.admin")) {
						var hrCriteria = this.getParameter('sysparm_hr_criteria');
						var HRCriteria = new hr_Criteria();
						userList = HRCriteria.getUsersForHRCriteria(hrCriteria);
					}
					
					return JSON.stringify(userList);
				},
				
				
				//Used in encoded query generation for time comparison
				_currentDateGenerateTimeStr: function(){
					var currentTime = new GlideDateTime();
					currentTime= currentTime.getDisplayValueInternal().toString();
					currentTime= currentTime.split(" ");
					var date = currentTime[0];
					var time = currentTime[1];
					return "javascript:gs.dateGenerate('"+date+"','"+time+"')";
				},
				
				/**
 				* Creates HR cases for sys_user ids from encoded query. Called from CreateCasesAJAXProcessor Script Include
 				*/
				createCasesFromQuery: function(sysId, encodedQuery, defaultValues, haveParent, countProfile,hrSelectionType) {
					var bulkCaseRequest ={};
					this._changeStatus(sysId);
					if (!gs.hasRole("sn_hr_core.case_writer"))
						return;
					
					defaultValues = JSON.parse(defaultValues);

					var insertedCount = 0;
					var parent = null;
					var timeStartStr;
					if (haveParent) {
						var currUser = gs.getUserID();
						var userGr = new GlideRecord("sys_user");
						userGr.addQuery('sys_id', currUser);
						userGr.query();
						
						timeStartStr = this._currentDateGenerateTimeStr();
						if (userGr.next())
							parent = this.userToCaseFromSysid(userGr, defaultValues, null, true); 
							this._updateParentNumber(sysId,parent.sys_id);
					}
					// Query for HR Service
					var hrServiceGr = new GlideRecord("sn_hr_core_service");
					hrServiceGr.get(defaultValues.hr_service);
					var hrServiceCriteria = hrServiceGr.getValue("hr_criteria") || "";
					
					var casesCount;
					var i = 0;
					
					var grSysUser = new GlideRecord("sys_user");
					
					if(hrSelectionType!="upload_file"&&hrSelectionType!="hr_profile"){
						var returnEncodedQuery = this.getUserSelectionEncodedQuery(encodedQuery,hrSelectionType);
						grSysUser.addEncodedQuery(returnEncodedQuery);
					}
					else if(hrSelectionType=="upload_file"||hrSelectionType=="hr_profile"){
						var resultUserSysid =[];
						
						if(hrSelectionType=="upload_file")
							resultUserSysid =this.getUsersSysidsFromCriteriaCondition("sn_hr_core_bulk_case_creation_data","bulk_case_creation_run.sys_id="+encodedQuery+"^query_result=Found^userISNOTEMPTY","user");
						else if(hrSelectionType=="hr_profile")
							resultUserSysid=this.getUsersSysidsFromCriteriaCondition("sn_hr_core_profile",encodedQuery,"user");
						
						if(resultUserSysid.length>0)
							grSysUser.addEncodedQuery("sys_idIN"+resultUserSysid.join());
						else
							grSysUser.addEncodedQuery("sys_idINEMPTY");
					}
					
					if (hrServiceCriteria){
						var hrServiceEncodedQuery = this.getUserSelectionEncodedQuery(hrServiceCriteria,"hr_criteria");
						grSysUser.addEncodedQuery(hrServiceEncodedQuery);
					}
					
					grSysUser.addQuery("active=true");
					grSysUser.query();
					
					casesCount = grSysUser.getRowCount();
					
					if (!haveParent) timeStartStr = this._currentDateGenerateTimeStr();
					var updateCount;	
					while (grSysUser.next()) {
						var newCase = this.userToCaseFromSysid(grSysUser, defaultValues, parent, false);
						if (newCase)
							insertedCount++;
						
						updateCount = insertedCount % 100 ;
						if(updateCount == 0)
							this._updateCaseCount(100,sysId);
						i++;
					}	
					this._updateCaseCount(updateCount,sysId);

						var timeEndStr = this._currentDateGenerateTimeStr();
	
						//URL as a replacement for sys_idIN[sysids list]
						//Generates encoded query based on created time interval and user who created
						var hrService = new GlideRecord('sn_hr_core_service');
						hrService.addQuery('sys_id', defaultValues.hr_service);
						hrService.query();
						var url;
						if (hrService.next()) {
							url = hrService.service_table+ "_list?sysparm_query=sys_created_on>="+timeStartStr+"^sys_created_by="+gs.getUserName()+"^sys_created_on<="+timeEndStr;
						}
						this._updateEndStatus(sysId);					
						
						bulkCaseRequest.url = url;
						return bulkCaseRequest;
					},
	
					_changeStatus : function(sysId){
						var gdt = new GlideDateTime();
						var start = gdt.getDisplayValue();
						var grStatus = new GlideRecord('sn_hr_core_bulk_case_request');
						grStatus.addQuery('sys_id',sysId);
						grStatus.query();
						if(grStatus.next()){
							grStatus.status = 'in_progress';
							grStatus.start_time = start;
							grStatus.update();
						}
					},
	
					_updateCaseCount : function(caseCount,sysId){
						var numberOfCases = 0;
						var grCaseCount = new GlideRecord('sn_hr_core_bulk_case_request');
						grCaseCount.addQuery('sys_id',sysId);
						grCaseCount.query();
						if(grCaseCount.next()){
							if(grCaseCount.cases_created_count != '')
								numberOfCases = grCaseCount.cases_created_count;
							grCaseCount.cases_created_count = Math.floor(numberOfCases+caseCount);					   
							grCaseCount.update();
						}
					},
	
					_updateParentNumber : function(sysId , parentNumber){ 
						var grParent = new GlideRecord('sn_hr_core_bulk_case_request');
						grParent.addQuery('sys_id',sysId);
						grParent.query();
						if(grParent.next()){
							grParent.parent_case_number = parentNumber;
							grParent.update();
						}
					},
	
					_updateEndStatus : function(sysId){
						var gdt = new GlideDateTime();
						var end = gdt.getDisplayValue();
						var grStatus = new GlideRecord('sn_hr_core_bulk_case_request');
						grStatus.addQuery('sys_id',sysId);
						grStatus.query();
						if(grStatus.next()){
							grStatus.status = 'completed';
							grStatus.completed_time = end;
							grStatus.update();
						}
					},
	
					insertCasesFromQuery : function(encodedQuery,defaultValues,haveParent,countProfile,hrSelectionType){
						
						if (!gs.hasRole("sn_hr_core.case_writer"))
						return;
						
						var gdt = new GlideDateTime();
						var requestedTime = gdt.getDisplayValue();
						var dfValues = JSON.parse(defaultValues);
						if(dfValues.opened_for == undefined)
							dfValues.opened_for='';
						var grCaseReq = new GlideRecord('sn_hr_core_bulk_case_request');
						grCaseReq.initialize();
						grCaseReq.query();
						grCaseReq.user_selection_query = encodedQuery;
						grCaseReq.default_values = defaultValues;
						grCaseReq.user_selection_type= hrSelectionType;
						grCaseReq.has_parent =haveParent;
						grCaseReq.selected_user_count = countProfile;
						grCaseReq.requested_time = requestedTime;
						grCaseReq.hr_service = dfValues.hr_service;
						grCaseReq.opened_for = dfValues.opened_for;
						var grReturn ={};
						grReturn.sysId = grCaseReq.insert().toString();
						grReturn.number = grCaseReq.number.toString();
						
						return  JSON.stringify(grReturn);
						
					},
	
					/**
 					* Helper method to create individual HR case for each sys_user id
 					* user_sysid -- sys_user sys_id for whom a profile creation must be attempted
 					* caseInfoObj -- This object has data to be inserted in the profile row other than those available from sys_user row
 					* returns sys_id of the new HR case created
 					*/
					userToCaseFromSysid:function(user_gr, caseInfoObj, parent, isParent){
						if (!gs.hasRole("sn_hr_core.case_writer"))
							return;
						
						var curService = caseInfoObj.hr_service;
						var hrService = new GlideRecord('sn_hr_core_service');
						hrService.addQuery('sys_id', curService);
						hrService.query();
						
						if(hrService.next()){
							var grHrCase = new GlideRecord(hrService.service_table);
							grHrCase.initialize();
							grHrCase.opened_for = user_gr.sys_id;
							grHrCase.subject_person = user_gr.sys_id;
							grHrCase.hr_service = hrService.sys_id.toString();
							grHrCase.topic_detail = hrService.topic_detail;
							grHrCase.topic_category = hrService.topic_detail.topic_category;
							grHrCase.template = hrService.template;
							grHrCase.state = 10;
							
							if (parent != null)
								grHrCase.parent = parent.sys_id;
							
							for (var key in caseInfoObj)
								grHrCase.setValue(key, caseInfoObj[key]);
							
							var openedFor = grHrCase.opened_for;
							if (openedFor.vip)
								grHrCase.priority = 2;
							
							if (isParent) {
								var grSnHrCoreService = new GlideRecord("sn_hr_core_service");
								grSnHrCoreService.addQuery("value", "bulk_parent_case");
								grSnHrCoreService.query();
								if (grSnHrCoreService.next()) {
									grHrCase.hr_service = grSnHrCoreService.sys_id;
									grHrCase.topic_detail = grSnHrCoreService.topic_detail;
									grHrCase.topic_category = grSnHrCoreService.topic_detail.topic_category;
									grHrCase.template = grSnHrCoreService.template;
									var temp = grSnHrCoreService.template;
									var grSnHrCoreTemplate = new GlideRecord("sn_hr_core_template");
									if (grSnHrCoreTemplate.get(temp)) {
										var s = grSnHrCoreTemplate.template;
										var start = s.indexOf("short_description");
										if (start != -1) {
											var end = start + 17 + 1;
											while (s.charAt(end) != "^") end++;
												
											grHrCase.short_description = s.substring( start + 17 + 1, end);
										}
									}
									
								}
							}
							
							grHrCase.insert();
							return grHrCase;
						}
						return null;
					}
				});