gs.log("********************* ABOUT TO DELETE TABLE EXTENSION:" + event.parm1);
var tu = new TableUtils();
tu.dropTableAndExtensions(event.parm1);