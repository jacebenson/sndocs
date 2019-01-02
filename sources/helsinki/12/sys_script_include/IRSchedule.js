var IRSchedule = Class.create();

IRSchedule.prototype = {
  initialize : function() {
  },

  schedule : function(eventName, table, email) {
   if (!gs.hasRole('admin') && !gs.hasRole('ts_admin'))
       return;

    if (eventName == 'indexAll' || eventName == 'createIndex')
       GlideTextIndexEvent().indexAll(table, email);
    else if (eventName == 'textIndexCreate')
       GlideTextIndexEvent().textIndexCreate(table, email);
	else if (eventName == 'upgradeBerlin')
       GlideTextIndexEvent().upgradeBerlin(email);
	else if (eventName == 'upgradeCalgary')
       GlideTextIndexEvent().upgradeCalgary(email);
  },

  isPublic: function() {
    return false;
  }
};