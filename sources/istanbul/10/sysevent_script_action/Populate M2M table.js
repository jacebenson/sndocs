var parts = event.parm1.split('.');
var m2mTable = GlideListM2MBacking.createTable(parts[0], parts[1]);
m2mTable.load(event.parm1, event.parm2, true);