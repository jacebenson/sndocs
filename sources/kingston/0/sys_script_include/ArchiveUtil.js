var ArchiveUtil = Class.create();
ArchiveUtil.prototype = {
    initialize: function() {
    },

    isArchive: function(current) {
       return GlideArchiveTable.isArchive(current.getTableName());
    },

    hasArchive: function(current) {
       return GlideArchiveTable.hasArchive(current.getTableName());
    },

    hasBeenArchived: function(current) {
       if (!this.hasArchive(current))
          return false;

       var archiveLog = new GlideRecord('sys_archive_log');
       archiveLog.addQuery('id', current.sys_id);
       archiveLog.query();
       return archiveLog.hasNext();
    },
   
   notRestored: function(current) {
	  var archiveLog = new GlideRecord('sys_archive_log');
      archiveLog.addQuery('id', current.sys_id);
      archiveLog.addNullQuery('restored');
      archiveLog.query();
      return archiveLog.next();
   },


    type: 'ArchiveUtil'
}