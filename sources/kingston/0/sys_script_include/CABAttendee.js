var CABAttendee = Class.create();
CABAttendee.prototype = Object.extendsObject(sn_change_cab.CABAttendeeSNC, {
	setAttendance: function(attendance) {
		this._gr.attendance = attendance;
	},
	
    type: 'CABAttendee'
});

// Bindings for namespaced code
CABAttendee.newAttendee = CABAttendeeSNC.newAttendee;