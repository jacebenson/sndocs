var LiveFeedUtil = Class.create();

LiveFeedUtil.prototype = {
   initialize: function() {
   },
   
   // Return the user profile for the current session
   getSessionProfile: function() {
      return new GlideappLiveProfile().getID();
   },
   
   // Return the user profile for a specific user
   getUserProfile: function(user) {
      return new GlideappLiveProfile().getID(user);
   },
   
   insertGroupMember: function(group, member, state) {
      var gr = new GlideRecord('live_group_member');
      gr.group = group;
      gr.member = member;
      gr.state = state;
      gr.insert();
   },
   
   insertGroupUser: function(group, user, state) {
      this.insertGroupMember(group, this.getUserProfile(user), state);
   },
   
   insertGroupForUser: function(group, state) {
      this.insertGroupMember(group, this.getSessionProfile(), state);
   },
   
   // Construct the GlideRecord for a group membership entry
   buildMemberRecord: function(group, member) {
      var gr = new GlideRecord('live_group_member');
      gr.addQuery('group', group);
      gr.addQuery('member', member);
      return gr;
   },
   
   buildUserMemberRecord: function(group, user) {
      return this.buildMemberRecord(group, this.getUserProfile(user));
   },
   
   buildSessionMemberRecord: function(group) {
      return this.buildMemberRecord(group, this.getSessionProfile());
   },
   
   /**
    * Is a proposed GroupMembership record a duplicate of an existing entry?
    * Membership state is ignored for this.
    */
   isDuplicateMember: function(groupGr) {
      var gr = this.buildMemberRecord(groupGr.group, groupGr.member);
      // add criteria as part of the query if we have the criteria field
	   if (groupGr.isValidField('criteria'))
		  gr.addQuery('criteria', groupGr.criteria);

      gr.query();
      return gr.hasNext();
   },
   
   // Is the current session's user a member of the group
   isSessionMember: function(group) {
      var gr = this.buildSessionMemberRecord(group);
      gr.query();
      return gr.hasNext();
   },
   
   // Is the current session's user a group admin?
   isSessionAdmin: function(group) {
      var gr = this.buildSessionMemberRecord(group);
      gr.addQuery('state', 'admin');
      gr.query();
      return gr.hasNext();
   },
   
   // Can the current session's user add users?
   canSessionAddUsers: function(group) {
      return this.isSessionAdmin(group);
   },
   
   // Can the current session's user invite users?
   canSessionInviteUsers: function(group) {
      var gr = this.buildSessionMemberRecord(group);
      gr.addQuery('state', ['admin', 'active']);
      gr.query();
      return gr.hasNext();
   },
   
   // Based on current and previous, can the current session's
   // user update group membership to the new state?
   canSessionUpdateMembership: function() {
      // Admins can make any changes
      if (gs.hasRole('live_feed_admin'))
         return true;
      
      if (this.isSessionAdmin(current.group))
         return true;
      
	  // Did an agent accept a support conversation transfer?
	  if (this.isAgentTransfer(previous, current))
		  return true;

      // Only admins can change state to admin for non-doc conversations
      // Unfortunately, due to other business rules, non-admins cannot get meta-data about the group they're in

	  if ('admin' != previous.state && 'admin' == current.state) {
  		  var liveGroupProfileGR = new GlideRecord('live_group_profile');
		  liveGroupProfileGR.setWorkflow(false);
		  if(!liveGroupProfileGR.get(current.group))
			 return false;
		  
		  return liveGroupProfileGR.document_group;
	  }
      
      // Members can make their own other changes
      if (current.member == this.getSessionProfile())
         return true;

	  if (current.isValidField('member_type') && current.member_type == 'team') {
		  var gr = new GlideRecord('live_profile');
		  if(gr.get(current.member)) {
			  if(this.isSessionAdmin(gr.document))
				  return true;
		  }
	  }
      // Non-member can changed from "invited" to "active" or "inactive"
      if ('invited' == previous.state &&
         ('active' == current.state || 'inactive' == current.state))
      return true;
	   
	  // Collaboration members can be removed
	  if ('inactive' == current.state && 
		  'collaboration' == current.group.type && isSessionMember(current.group))
		  return true;
      
      // Non-member can only affect public groups
      return current.group.public_group;
   },

   isAgentTransfer: function(previous, current) {
	  if ('invited' != previous.state)
		  return false;
      if ('admin' != current.state)
		  return false;
	  if (current.member != this.getSessionProfile())
		  return false;

	  var chatQueueEntryTransferGR = new GlideRecord('chat_queue_entry_transfer');
	  if (!chatQueueEntryTransferGR.isValid())
		  return false;

	  chatQueueEntryTransferGR.addQuery('group', current.group);
	  chatQueueEntryTransferGR.addQuery('transfer_to', current.member.document);
	  chatQueueEntryTransferGR.addQuery('state', 'pending');
	  chatQueueEntryTransferGR.query();
	  return chatQueueEntryTransferGR.next();
   },

   // Can the current session's user directly join a group?
   hasSessionJoinPermission: function(group) {
      if (gs.hasRole('live_feed_admin'))
         return true;
      
      var grp = new GlideRecord('live_group_profile');
      grp.get('sys_id', group);
      if (grp.public_group)
         return true;
      
      if (this.isSessionAdmin(group)) {
         return true;
      }
      
      // If no admins, anyone can join - useful for a new group
      usrGrp = new GlideRecord('live_group_member');
      usrGrp.addQuery('group', group);
      usrGrp.addQuery('state', 'admin');
      return !usrGrp.hasNext();
   },

   // Verify that the record is valid for GroupProfiles.
   // Abort the action if there are inconsistencies.
   validateGroupProfile: function(profile) {
      if (profile.public_group && !profile.visible_group) {
		 var errMsg = gs.getMessage("Public groups must be visible");
         gs.addErrorMessage(errMsg);
         current.setAbortAction(true);
      }
   },

   // Add current session restrictions to group profile lookups
   adjustSessionGroupProfileQuery: function(currGr) {
      if (gs.hasRole('live_feed_admin'))
         return;
      
      var sq = new GlideSubQuery('live_group_member', 'sys_id', 'group');
      sq.addCondition('member', this.getSessionProfile());
      
      var cond = currGr.addQuery('visible_group', true);
      cond.addOrCondition(sq);
   },

   // Add current session restrictions to group membership lookups
   adjustSessionGroupMemberQuery: function(currGr) {
      if (gs.hasRole('live_feed_admin'))
         return;

      // Only see enrolled membership records
      currGr.addQuery('state', ['active', 'admin', 'invited', 'request']);

      // See all members of all public groups
      var sqp = currGr.addJoinQuery('live_group_profile', 'group', 'sys_id');
      sqp.addCondition('public_group', true);

      // See all members of all member groups
      var userProf = new GlideappLiveProfile().getID();
      var sqm = new GlideSubQuery('live_group_member', 'group', 'group');
      sqm.addCondition('member', userProf);

      sqp.addOrCondition(sqm);
   },

   // Get the admin of a group
   getGroupAdminUsers: function(groupProfile) {
      var admins = [];
      var gr = new GlideRecord('live_group_member');
      gr.addQuery('group', groupProfile);
      gr.addQuery('state', 'admin');
      gr.query();
      while (gr.next()) {
         var admin = gr.getValue('member');
         admin = this.getProfileUserID(admin);
         if (admin)
            admins.push(admin);
      }
      return admins;
   },

   // given a live_profile return the user id
   getProfileUserID: function(profile) {
      var gr = new GlideRecord('live_profile');
      gr.get(profile);
      if (gr.getValue('table') == 'sys_user')
         return gr.getValue('document');
      return null;
   },

   deleteGroup: function(groupID) {
      var group = new GlideRecord("live_group_profile");
      group.query("sys_id",groupID);
      if (!group.next())
         return;
      
      if (group.public_group === false)
         this.deleteGroupMessages(groupID);
      
      this.deleteGroupMembers(groupID);
      
      group.deleteRecord();
   },

   deleteGroupMembers: function(groupID) {
      var groupMembers = new GlideRecord("live_group_member");
      groupMembers.query("group", groupID);
      while (groupMembers.next())
         groupMembers.deleteRecord();
   },

   deleteGroupMessages: function(groupID) {
      var groupMessages = new GlideRecord("live_message");
      groupMessages.addQuery("private_message","true");
      groupMessages.query("group", groupID);
      while(groupMessages.next())
         groupMessages.deleteRecord();
   },

   // Get the member of a group who want notification of new messages
   getGroupNotificationUsers: function(groupProfile) {
      var subscribers = [];
      var gr = new GlideRecord('live_group_member');
      gr.addQuery('group', groupProfile);
      gr.addQuery('notification', 'true');
      gr.query();
      while (gr.next()) {
         var subscriber = gr.getValue('member');
         subscriber = this.getProfileUserID(subscriber);
         if (subscriber)
            subscribers.push(subscriber);
      }
      return subscribers;
   },

	getLiveFeedVersion: function() {
		var v2available = GlidePluginManager.isActive('com.glideapp.live_feed_v2');
		if(!v2available)
			return "1.0";
		var browser = gs.getSession().getProperty('user_agent_browser')+'';
		var browser_version = gs.getSession().getProperty('user_agent_version')+'';
		if(browser == 'ie') {
			if(browser_version.length == 2)
				return "2.0";
			else
				return "1.0";
		}
		else if(browser == 'safari') {
			var firstDot = browser_version.indexOf('.');
			if(firstDot > 0) {
				var major = parseInt(browser_version.substr(0, firstDot));
				if(major > 6)
					return "2.0";
				else if(major < 6)
					return "1.0";
				else {
					var minor = browser_version.substr(firstDot + 1);
					var secondDot = minor.indexOf('.');
					if(secondDot > 0)
						minor = parseInt(minor.substr(0, secondDot));
					else {
						minor = parseInt(minor);
						if(minor < 1)
							return "1.0";
						else
							return "2.0";
					}
					if(minor < 1)
						return "1.0";
					else
						return "2.0";
				}
			}
		}
		return "2.0";
	},

	addReplyByEmail: function(msg, reply) {
		var group = msg.group;
		var reply_to = msg.sys_id;

		var liveFeedApi = new SNC.LiveFeedApi();
		liveFeedApi.addReplyByEmail(reply, reply_to, group, sys_email.sys_id);
	},

	extractMessageFromEmail: function(text) {
		var regl = [/[\n\r][^\n\r]*just (:?posted|replied):/,
					/[\n\r]From:/, // MS Outlook
					/[\n\r]On.* <.*> wrote:/]; // iOS, Android
		for(var i=0;i<regl.length;i++)
			text = this.truncLinesUpto(text,regl[i]);
		return text;
	},

	truncLinesUpto: function(text,regex) {
		var idx = text.search(regex);
		if(idx > 0)
			text = text.substring(0,idx);
		return text;
	},

	type: "LiveFeedUtil"
};