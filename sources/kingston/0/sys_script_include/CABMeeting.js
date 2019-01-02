var CABMeeting = Class.create();
//Pull in namespaced functions.
CABMeeting.newMeeting = CABMeetingSNC.newMeeting;

CABMeeting.prototype = Object.extendsObject(sn_change_cab.CABMeetingSNC, {
	
    type: 'CABMeeting'
});