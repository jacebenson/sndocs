var ChangeRequest = Class.create();
    
ChangeRequest.NORMAL = "normal";
ChangeRequest.STANDARD = "standard";
ChangeRequest.EMERGENCY = "emergency";
ChangeRequest.CHANGE_REQUEST = "change_request";

ChangeRequest.prototype = Object.extendsObject(ChangeRequestSNC, {
    type: "ChangeRequest"
});

ChangeRequest.newNormal = ChangeRequestSNC.newNormal;

ChangeRequest.newStandard = ChangeRequestSNC.newStandard;

ChangeRequest.newEmergency = ChangeRequestSNC.newEmergency;

ChangeRequest.newChange = ChangeRequestSNC.newChange;
