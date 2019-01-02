// Peer to Peer conversion
var collaboratorPeerGR = new GlideRecord("collaborator");
collaboratorPeerGR.addNotNullQuery("peer");
collaboratorPeerGR.query();

var groupMap = {};
while(collaboratorPeerGR.next()) {
	var userPeer = collaboratorPeerGR.getValue("user") + ":" + collaboratorPeerGR.getValue("peer");
	var peerUser = collaboratorPeerGR.getValue("peer") + ":" + collaboratorPeerGR.getValue("user");

	if(groupMap.hasOwnProperty(userPeer)) {
		// The group is already created, just create the other member
		var liveGroupMemberPeerGR = new GlideRecord("live_group_member");
		liveGroupMemberPeerGR.group = groupMap[userPeer];
		liveGroupMemberPeerGR.member = collaboratorPeerGR.getValue("user");
		liveGroupMemberPeerGR.member_type = "user";
		liveGroupMemberPeerGR.state = "admin";
		liveGroupMemberPeerGR.can_email = collaboratorPeerGR.getValue("can_email");
		liveGroupMemberPeerGR.frame_order = collaboratorPeerGR.getValue("frame_order");
		liveGroupMemberPeerGR.frame_state = collaboratorPeerGR.getValue("frame_state");
		liveGroupMemberPeerGR.last_emailed = collaboratorPeerGR.getValue("last_emailed");
		liveGroupMemberPeerGR.last_viewed = collaboratorPeerGR.getValue("last_viewed");
		liveGroupMemberPeerGR.visible = collaboratorPeerGR.getValue("visible");

		liveGroupMemberPeerGR.insert();
		continue;
	}

	var liveGroupGR = new GlideRecord("live_group_profile");
	liveGroupGR.public_group = false;
	liveGroupGR.visible_group = false;
	liveGroupGR.short_description = "Peer to peer conversation";
	liveGroupGR.type = "peer";
	liveGroupGR.name = collaboratorPeerGR.getDisplayValue("user") + ", " + collaboratorPeerGR.getDisplayValue("peer");

	liveGroupGR.setWorkflow(false);
	var groupSysID = liveGroupGR.insert();

	var liveGroupMemberUserGR = new GlideRecord("live_group_member");
	liveGroupMemberUserGR.group = groupSysID;
	liveGroupMemberUserGR.member = collaboratorPeerGR.getValue("user");
	liveGroupMemberUserGR.member_type = "user";
	liveGroupMemberUserGR.state = "admin";
	liveGroupMemberUserGR.can_email = collaboratorPeerGR.getValue("can_email");
	liveGroupMemberUserGR.frame_order = collaboratorPeerGR.getValue("frame_order");
	liveGroupMemberUserGR.frame_state = collaboratorPeerGR.getValue("frame_state");
	liveGroupMemberUserGR.last_emailed = collaboratorPeerGR.getValue("last_emailed");
	liveGroupMemberUserGR.last_viewed = collaboratorPeerGR.getValue("last_viewed");
	liveGroupMemberUserGR.visible = collaboratorPeerGR.getValue("visible");

	liveGroupMemberUserGR.insert();

	var collaboratorEdgeCaseGR = new GlideRecord("collaborator");
	collaboratorEdgeCaseGR.addQuery("user", collaboratorPeerGR.getValue("peer"));
	collaboratorEdgeCaseGR.addQuery("peer", collaboratorPeerGR.getValue("user"));
	collaboratorEdgeCaseGR.query();

	if(!collaboratorEdgeCaseGR.hasNext()) {
		var liveGroupEdgeCaseGR = new GlideRecord("live_group_member");
		liveGroupEdgeCaseGR.group = groupSysID;
		liveGroupEdgeCaseGR.member = collaboratorPeerGR.getValue("peer");
		liveGroupEdgeCaseGR.member_type = "user";
		liveGroupEdgeCaseGR.state = "admin";

		liveGroupEdgeCaseGR.insert();
	}

	var liveMessageGR = new GlideRecord("live_message");
	var qc = liveMessageGR.addQuery("profile", collaboratorPeerGR.getValue("user"));
	qc.addOrCondition("profile", collaboratorPeerGR.getValue("peer"));
	var qc2 = liveMessageGR.addQuery("to_profile", collaboratorPeerGR.getValue("user"));
	qc2.addOrCondition("to_profile", collaboratorPeerGR.getValue("peer"));

	liveMessageGR.query();

	while(liveMessageGR.next()) {
		liveMessageGR.to_profile = null;
		liveMessageGR.group = groupSysID;
		liveMessageGR.update();
	}

	groupMap[peerUser] = groupSysID;
	groupMap[userPeer] = groupSysID;
}

// Group Visibility
var collaboratorGroupGR = new GlideRecord("collaborator");
collaboratorGroupGR.addNotNullQuery("group");
collaboratorGroupGR.query();

while(collaboratorGroupGR.next()) {
	var groupMemberGR = new GlideRecord("live_group_member");
	groupMemberGR.addQuery("group", collaboratorGroupGR.getValue("group"));
	groupMemberGR.addQuery("member", collaboratorGroupGR.getValue("user"));
	groupMemberGR.query();

	groupMemberGR.next();

	groupMemberGR.visible = collaboratorGroupGR.getValue("visible");
	groupMemberGR.last_viewed = collaboratorGroupGR.getValue("last_viewed");
	groupMemberGR.last_emailed = collaboratorGroupGR.getValue("last_emailed");
	groupMemberGR.can_email = collaboratorGroupGR.getValue("can_email");
	groupMemberGR.frame_order = collaboratorGroupGR.getValue("frame_order");
	groupMemberGR.frame_state = collaboratorGroupGR.getValue("frame_state");
	groupMemberGR.update();
}