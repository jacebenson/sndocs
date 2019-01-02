function insertMegaphoneMessage() {
	if(event.parm1.nil()) {
		gs.warn("Empty megaphone broadcast message inserted");
	}
	else {
		var mega = new MegaphoneBroadcastInsert();
		mega.fromEvent(event.parm1);
	}
}

insertMegaphoneMessage();