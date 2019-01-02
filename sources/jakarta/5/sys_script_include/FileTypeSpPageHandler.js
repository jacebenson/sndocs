var FileTypeSpPageHandler = (function(appId) {

       function loadSpPages() {
               var gr = new GlideRecord('sp_page');
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
                       .addCustom('pageId', record.getValue('id'))
                       .build();
       }

       return {
               filesForKey : loadSpPages
       };

});