var hr_UserToProfileMigration = Class.create();
hr_UserToProfileMigration.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    type: 'hr_UserToProfileMigration',
    getHRProfileDefaultFields:function(){
        return gs.getProperty("sn_hr_core.hr_profile_default_fields","employment_type");
    },
    _userEncodedQueryForProfile:function(query){
        if(query && query.length>0) query = 'user.'+query;
        var pos=0;
        for(var i=0;i<query.length&&pos!=-1;i++){
            pos = query.indexOf('^',i);
            if(pos!=-1){
                i=pos;
                if(pos+3<query.length && (query.substring(pos+1,pos+3)=='NQ' || query.substring(pos+1,pos+3)=='OR')){
                    query=query.substring(0,pos+3)+'user.'+query.substring(pos+3);
                }
                else{
                    query=query.substring(0,pos+1)+'user.'+query.substring(pos+1);
                }
            }
        }
        return query;
    },
    /**
     * Calculates the count of profiles for given encodedQuery. Used for AJAX request
     */
    getProfilesCount: function() {
        var encodedQuery = this.getParameter('sysparm_encoded_query');
		
        var ga = new GlideAggregate("sys_user");
		ga.addQuery('active',true);
        if (encodedQuery && (encodedQuery.indexOf("123TEXTQUERY321")==-1))
            ga.addEncodedQuery(encodedQuery);
        ga.addAggregate('COUNT');
		
        ga.query();
        var queryWithCount={};
        queryWithCount.query = encodedQuery;
        var users_query;
        if(ga.next())
          users_query= ga.getAggregate('COUNT');
        else
          queryWithCount.count= -1;

        //find how many already have profiles
        var g_profile = new GlideAggregate("sn_hr_core_profile");
        if (encodedQuery)
            g_profile.addEncodedQuery(this._userEncodedQueryForProfile(encodedQuery.substring(0)));
        g_profile.addAggregate('COUNT');
		g_profile.addQuery('user.active', true);
        g_profile.query();
        var pcount=0;
        if(g_profile.next())
          pcount=g_profile.getAggregate('COUNT');
		queryWithCount.count=users_query -pcount;
        return JSON.stringify(queryWithCount);
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
     * Creates HR profiles for sys_user ids from encoded query. Called from CreateProfilesAJAXProcessor Script Include
     */
    createProfilesFromQuery: function(encodedQuery, defaultValues) {
        defaultValues = JSON.parse(defaultValues);
        var tracker = GlideExecutionTracker.getLastRunning();
        tracker.run();
        var inserted = [];
        var user_gr = new GlideRecord("sys_user");
        user_gr.addEncodedQuery(encodedQuery);
		user_gr.addActiveQuery();
        user_gr.query();
        var profilesCount = user_gr.getRowCount();

        var timeStartStr = this._currentDateGenerateTimeStr();

        var i = 0;
        while (user_gr.next()) {
            if (profilesCount < 100) {
                //determine how many percent to increment for each interval
                var intervalPercent = Math.floor(100 / profilesCount);
                tracker.incrementPercentComplete(intervalPercent);
            } else {
                //determine number of things for one percent
                var onePercentInterval = Math.floor(profilesCount / 100);
                if (i % onePercentInterval == 0) {
                    //increment one percent more
                    tracker.incrementPercentComplete(1);
                }
            }
            var id = this.userToProfileFromSysid(user_gr,defaultValues);
            if (id)
                inserted.push(id);
            i++;
        }
        var countMsg = gs.getMessage("Created {0} Profiles out of {1}.",[Math.floor(inserted.length)+"",profilesCount]);
        tracker.success(gs.getMessage("The profile creation is complete. ") + countMsg);

        var timeEndStr = this._currentDateGenerateTimeStr();

        //URL as a replacement for sys_idIN[sysids list]
        //Generates encoded query based on created time interval and user who created
        var url = "sn_hr_core_profile_list.do?sysparm_query=sys_created_on>="+timeStartStr+"^sys_created_by="+gs.getUserName()+"^sys_created_on<="+timeEndStr;

        tracker.updateResult({
            profilesCreated: inserted.length,
            expected:profilesCount,
            ids:inserted,
            url:url,
            currentuser:gs.getUserID()
        });


    },
    /**
     * Helper method to create individual HR profile for each sys_user id
     * user_sysid -- sys_user sys_id for whom a profile creation must be attempted
     * profileInfoObj -- This object has data to be inserted in the profile row other than those available from sys_user row
     * returns sys_id of the new HR profile created
     */
    userToProfileFromSysid:function(user_gr, profileInfoObj){
        var profile_gr = new GlideRecord(hr.TABLE_PROFILE);
        profile_gr.addQuery("user", user_gr.sys_id);
        profile_gr.query();
        if(!profile_gr.hasNext()){
            var hrProfile = new hr_Profile();
            var currProfileSid = hrProfile.createProfileFromUser(user_gr.sys_id);
            profile_gr.get(currProfileSid);
            if (profile_gr && profileInfoObj) {
                for (var key in profileInfoObj) {
                    profile_gr[key] = profileInfoObj[key];
                }
                profile_gr.update();
            }

            return currProfileSid;

        }

        return null;


    }
});