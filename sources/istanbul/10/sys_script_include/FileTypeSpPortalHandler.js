var FileTypeSpPortalHandler = (function(appId) {

       function loadSpPortals() {
               var gr = new GlideRecord('sp_portal');
               gr.addQuery('sys_scope', appId);
               gr.orderBy('title');
               gr.query();
               return _gr(gr).map(function(row) {
                       return fileForRecord(row);
               });
       }

       function fileForRecord(record) {
               var sysId = record.getUniqueValue();
               var name = record.getValue('title');
               return FileTypeFileBuilder.newFile()
                       .withId(sysId)
                       .withName(name)
                       .withSysId(sysId)
                       .withAlternateName(record.getValue('name'))
                       .build();
       }

       return {
               filesForKey : loadSpPortals
	   };

});