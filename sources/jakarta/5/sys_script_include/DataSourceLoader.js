gs.include("PrototypeServer");

var DataSourceLoader = Class.create();

DataSourceLoader.prototype = {
    initialize : function() {
    },

    load : function(/* Data Source */ source, /* Transform Map */ mapName) {
          this._load(source, mapName, true);
    },

    _load : function(/* Data Source */ source, /* Transform Map */ mapName, /* Delete Transform Map */ cleanMap) {
          var sourceGr = new GlideRecord('sys_data_source');
          sourceGr.addQuery('name', source);
          sourceGr.query();
          // if we have our data source continue
          if(!sourceGr.next()) {
             gs.print('Did not find Data Source ' + source);
             return;
          }

          var map = new GlideRecord('sys_transform_map');
          map.addQuery('name', mapName);
          map.query();
          // if we have a map we can now load and run the transform
          if(!map.next()) {
             gs.print('Did not find Transform map ' + mapName);
             return;
          }
    
          gs.print('Loading Import Set ' + source);
          var loader = new GlideImportSetLoader();
          var importSetGr = loader.getImportSetGr(sourceGr);
          var ranload = loader.loadImportSetTable(importSetGr, sourceGr);

          if(!ranload) {
             gs.print('Failed to load import set ' + source);
             return;
          }

          gs.print('Running Transform map ' + map.name);
          var t = new GlideImportSetTransformer();
          t.setMapID(map.sys_id);
          t.transformAllMaps(importSetGr);
          
          // Clean up Import
          var cleaner = new ImportSetCleaner(importSetGr.table_name);
          cleaner.setDataOnly(true);
          cleaner.setDeleteMaps(cleanMap);
          cleaner.clean();
    }

}