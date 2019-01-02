var archiveLog = new GlideRecord('sys_archive_log');
archiveLog.addQuery('id', current.sys_id);
archiveLog.addNullQuery('restored');
archiveLog.query();
if (archiveLog.next()) {
   var und = new GlideArchiveRestore().restore(archiveLog.sys_id);
   if (!und) {
	  gs.addInfoMessage(gs.getMessage("The restore failed"));
      action.setRedirectURL(current);
   } else {
	  var gr = new GlideRecord(archiveLog.from_table);
	  if (gr.get(archiveLog.id)) {
         action.setRedirectURL(gr);
	  } else {
	     gs.addInfoMessage(gs.getMessage("Could not locate the restored record"));
         action.setRedirectURL(current);
	  }
   }
} else {
   action.setRedirectURL(current);
   gs.addErrorMessage(gs.getMessage("No active archive log entry found.  Record probably already restored"));
}