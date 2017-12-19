if (needsExtension())
    extend();

function extend() {
   var rotation = new GlideRecord('sys_table_rotation');
   rotation.addQuery('name', event.parm1);
   rotation.query();
   if (rotation.next()) {
      if (rotation.type == 'extend')
          extendRotation(rotation);
      else
          rotateRotation(rotation);
}

function rotateRotation(rotation) {
    var sch = new GlideRecord('sys_table_rotation_schedule');
    sch.addQuery('name', rotation.sys_id);
    sch.addQuery('table_name', '!=', event.parm1);
    sch.orderBy('valid_to');
    sch.query();
    if (!sch.next()) 
       return;

    sch.valid_from = getStartTime(rotation);
    sch.valid_to.setDateNumericValue(sch.valid_from.dateNumericValue() + rotation.duration.dateNumericValue());
    sch.update();
    var xx = new SncTableRotation(rotation.name.toString());
    xx.truncateTable(sch.table_name.toString());
}

function extendRotation(rotation) {
      var tr = new TableRotationUtil();
      var frn = tr.create(rotation.name.toString());
      if (frn) {
         var schedEntry = new GlideRecord('sys_table_rotation_schedule');
         schedEntry.name = rotation.sys_id;
         schedEntry.table_name = frn;
         schedEntry.valid_from = getStartTime(rotation);
         schedEntry.valid_to.setDateNumericValue(schedEntry.valid_from.dateNumericValue() + rotation.duration.dateNumericValue());
         gs.log("Schedule created for " + frn + " from " + schedEntry.valid_from + " to " + schedEntry.valid_to);
         schedEntry.insert();
     }
   }
}

function getStartTime(rotation) {
   var gr = new GlideRecord('sys_table_rotation_schedule');
   gr.addQuery('name', rotation.sys_id);
   gr.orderByDesc('valid_to');
   gr.query();
   if (!gr.next()) 
        return gs.nowDateTime();
  
   var now = new GlideDateTime();
   if (now.getNumericValue() > gr.valid_to.dateNumericValue()) {
       now.setNumericValue(now.getNumericValue() + 60000);
       var answer = now.getDisplayValue();
       gr.valid_to = answer;
       gr.update();
       return answer;
   }

   return gr.valid_to.getDisplayValue();
}

//
// Check to see if the table has already been created
//
function needsExtension() {
   var xx = new SncTableRotationExtension(event.parm1);
   var list = xx.getTablesInRotation();
   if (!list)
      return false;

   var last = list.get(list.size()-1);
   if (last.toString() == event.parm2.toString())
      return true;

   return false;
}


function getOldest() {
   var xx = new SncTableRotationExtension(event.parm1);
   var list = xx.getTablesInRotation();
   if (!list)
      return null;

   var first = list.get(0);
   return first.toString();
}

