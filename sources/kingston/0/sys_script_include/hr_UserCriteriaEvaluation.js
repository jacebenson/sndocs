var hr_UserCriteriaEvaluation = Class.create();
hr_UserCriteriaEvaluation.prototype = {
	initialize: function() {
	},
	
	checkUserMeetsUserCriteria : function(userCriteria,userId){
		var checkUserMatch;
		if(userCriteria!=''){
			var returnUserCriteriaResult=this._getUserCriteriaFilters(userCriteria,true,userId);
			if(returnUserCriteriaResult.isMatchAll){
				if(returnUserCriteriaResult.resultQuery!=""){
					checkUserMatch = new GlideRecord("sys_user");
					checkUserMatch.addEncodedQuery(returnUserCriteriaResult.resultQuery);
					checkUserMatch.addEncodedQuery("sys_idIN"+userId);
					checkUserMatch.query();
					if(checkUserMatch.hasNext()){
						if(returnUserCriteriaResult.hasRolesOrGroups)	
						return true &&  returnUserCriteriaResult.generatedMatchAllResult;
						else
						return true;	
						}
					else{
						if(returnUserCriteriaResult.hasRolesOrGroups)	
						return false &&  returnUserCriteriaResult.generatedMatchAllResult;
						else
						return false;	
					}
				}
				else{
					
					
					if(returnUserCriteriaResult.hasRolesOrGroups)	
					return returnUserCriteriaResult.generatedMatchAllResult;
					else
					return false;
				}
			}
			else{				if((returnUserCriteriaResult.resultQuery==""&&!returnUserCriteriaResult.hasRolesOrGroups)||(returnUserCriteriaResult.resultQuery!="")){
					checkUserMatch = new GlideRecord("sys_user");
					checkUserMatch.addEncodedQuery(returnUserCriteriaResult.resultQuery);
					checkUserMatch.addEncodedQuery("sys_idIN"+userId);
					checkUserMatch.query();
					if(checkUserMatch.hasNext())
						return true;
					else{
						if(returnUserCriteriaResult.hasRolesOrGroups)
							return returnUserCriteriaResult.generatedMatchAllResult;
					    else
							return false;
					}
				}
				else{
					if(returnUserCriteriaResult.hasRolesOrGroups)
					return returnUserCriteriaResult.generatedMatchAllResult;
				    else
					return false;
				}
			}
		}
		
	},
	
	getAllUsersForUserCriteria: function(userCriteria){
		
		
		if(userCriteria!=''){
			var	returnUserCriteriaResult=this._getUserCriteriaFilters(userCriteria,false,"");
			return returnUserCriteriaResult;
		}
		else
			return "sys_idINEMPTY";
	},
	
	_getUserCriteriaFilters: function(userCriteria,isCheckUserMeets,userId){
		var gr1 = new GlideRecord('user_criteria');
		gr1.addActiveQuery();
		gr1.addQuery('sys_id',userCriteria);
		gr1.addNullQuery('script');
		gr1.query();
		while(gr1.next()){
			if(gr1.match_all)
				return this._getUsersBasedOnQueries(gr1,true,isCheckUserMeets,userId);
			else
				return this._getUsersBasedOnQueries(gr1,false,isCheckUserMeets,userId);
		}
	},
	

	getSysIdCountInGroups: function(groupsSysid){
		var groupMembers=[];
		if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return groupMembers;
		var groups=groupsSysid.split(',');
		var grGroup= new GlideRecord('sys_user_grmember');
		grGroup.addEncodedQuery('group.sys_idIN'+groups.join());
		grGroup.query();
		if(grGroup.getRowCount()>=parseInt(gs.getProperty('sn_hr_core.userSelectionCriteriaCountLimit',5000))
		 && gs.getProperty("sn_hr_core.hideUserSelectionCriteriaCount",true))	
			return true;
		else
			return false;
	},
	
	getSysIdCountInRoles: function(rolesSysids){
		var usersWithRoles=[];
		if(!gs.hasRole('sn_hr_core.content_reader')&&!gs.hasRole('sn_hr_core.case_writer'))
			return usersWithRoles;
		var roles=rolesSysids.split(',');
		var grRole= new GlideRecord('sys_user_has_role');
		grRole.addEncodedQuery('state=active^role.sys_idIN'+roles.join());
		grRole.query();
		if(grRole.getRowCount()>=parseInt(gs.getProperty('sn_hr_core.userSelectionCriteriaCountLimit',5000))
		 && gs.getProperty("sn_hr_core.hideUserSelectionCriteriaCount",true))	
			return true;
		else
			return false;
		
	},
	
	
	checkUserSysIdInGroups: function(groupsSysid,userId){
		var groups=groupsSysid.split(',');
		var groupMembers=[];
		var grGroup= new GlideRecord('sys_user_grmember');
		grGroup.addEncodedQuery('group.sys_idIN'+groups.join());
		grGroup.addEncodedQuery('user.sys_id='+userId);
		grGroup.query();
		if(grGroup.hasNext())
			return true;
		else
			return false;
	},
	
	checkUserSysIdInRoles: function(rolesSysids,userId){
		var roles=rolesSysids.split(',');
		var usersWithRoles=[];
		var grRole= new GlideRecord('sys_user_has_role');
		grRole.addEncodedQuery('state=active^role.sys_idIN'+roles.join());
		grRole.addEncodedQuery('user.sys_id='+userId);
		grRole.query();
		if(grRole.hasNext())
			return true;
		else
			return false;
	},
	
	
	_getUsersBasedOnQueries:function(gr1,isMatchAll,isCheckUserMeets,userId){
		var userCriteriaResult={
			isMatchAll:false,
			generatedMatchAllResult:true,
			resultQuery:"",
			hasRolesOrGroups:false,
			shouldHideCount:false
		};
		var ignoreList = ['name', 'active', 'script', 'match_all', 'tags','advanced'];
		var elements = this._getUserCriteriaColumns();
		for(var i=0;i<elements.length;i++){
			var element = elements[i].getName();
			if(gr1.getValue(element)!=null ){
				if(ignoreList.indexOf(element)!=-1||element.startsWith('sys_'))
					continue;
				else if(element=='role'||element=='group'){
					if(element=='role'&& gr1.role.toString()!='') {
						userCriteriaResult.hasRolesOrGroups=true;
						if(!isCheckUserMeets){
							userCriteriaResult.shouldHideCount=userCriteriaResult.shouldHideCount==false?this.getSysIdCountInRoles(gr1.role.toString()):true;
							var resultRoleDynamicQuery = "sys_idINjavascript: new sn_hr_core.hr_BulkCaseCreation().getSysIdInRoles('"+gr1.role.toString()+"',false)";
							
							if(isMatchAll)
								userCriteriaResult.resultQuery =  userCriteriaResult.resultQuery=="" ? resultRoleDynamicQuery : userCriteriaResult.resultQuery+"^"+resultRoleDynamicQuery;
							else
								userCriteriaResult.resultQuery =  userCriteriaResult.resultQuery=="" ? resultRoleDynamicQuery : userCriteriaResult.resultQuery+"^OR"+resultRoleDynamicQuery;
						}
						else{
							var res = this.checkUserSysIdInRoles(gr1.role.toString(),userId);
							if(isMatchAll){
								userCriteriaResult.isMatchAll=true;
								userCriteriaResult.generatedMatchAllResult= res && userCriteriaResult.generatedMatchAllResult;
							}
							else{
								userCriteriaResult.generatedMatchAllResult=res;
								return 	userCriteriaResult;
							}
						}
						
					}
					else if(element=='group'&& gr1.group.toString()!='') {
						userCriteriaResult.hasRolesOrGroups=true;
						if(!isCheckUserMeets){
							userCriteriaResult.shouldHideCount=userCriteriaResult.shouldHideCount==false?this.getSysIdCountInGroups(gr1.group.toString()):true;
							var resultGroupDynamicQuery = "sys_idINjavascript: new sn_hr_core.hr_BulkCaseCreation().getSysIdInGroups('"+gr1.group.toString()+"',false)";
							
							
							if(isMatchAll)
								userCriteriaResult.resultQuery = userCriteriaResult.resultQuery=="" ? resultGroupDynamicQuery : userCriteriaResult.resultQuery+"^"+resultGroupDynamicQuery;
							else
								userCriteriaResult.resultQuery = userCriteriaResult.resultQuery=="" ? resultGroupDynamicQuery : userCriteriaResult.resultQuery+"^OR"+resultGroupDynamicQuery;
						}
						else
							{
							var resultFromGroup = this.checkUserSysIdInGroups(gr1.group.toString(),userId);
							if(isMatchAll){
								userCriteriaResult.isMatchAll=true;
								userCriteriaResult.generatedMatchAllResult= resultFromGroup && userCriteriaResult.generatedMatchAllResult;
							}
							else{
								userCriteriaResult.generatedMatchAllResult=resultFromGroup;
								return 	userCriteriaResult;
							}
							
						}
					}
					
				}
				else if(element=='user'&&gr1.getValue(element)!=''){
					if(isMatchAll)
						userCriteriaResult.resultQuery = userCriteriaResult.resultQuery=="" ? "sys_idIN"+gr1.getValue(element) : userCriteriaResult.resultQuery+"^sys_idIN"+gr1.getValue(element);
					else
						userCriteriaResult.resultQuery = userCriteriaResult.resultQuery=="" ? "sys_idIN"+gr1.getValue(element) : userCriteriaResult.resultQuery+"^ORsys_idIN"+gr1.getValue(element);
				}
				else{
					if(gr1.getValue(element)!=''){
						if(isMatchAll)
							userCriteriaResult.resultQuery = userCriteriaResult.resultQuery=="" ? element+"IN"+gr1.getValue(element) : userCriteriaResult.resultQuery+"^"+element+"IN"+gr1.getValue(element);
						else
							userCriteriaResult.resultQuery = userCriteriaResult.resultQuery=="" ? element+"IN"+gr1.getValue(element) : userCriteriaResult.resultQuery+"^OR"+element+"IN"+gr1.getValue(element);
					}
				}
			}
		}
		return userCriteriaResult;
	},
	
	_getUserCriteriaColumns:function(){
		var grDictionary = new GlideRecord('user_criteria');
		grDictionary.initialize();
		var elements =  grDictionary.getElements();
		return elements;
	},
	
	type: 'hr_UserCriteriaEvaluation'
};