var SDLCRelationships = Class.create();

SDLCRelationships.prototype = Object.extendsObject(RMv2Relationships, {
  initialize : function() {
  },

  // return URL of planning board to display, based upon current record and its parent
  //  type - product, release, release_phase
  //  record - relevant planned_task record
  //  bq   - base query (URL encoded)
  planningBoardURL: function(type, current, bq) {
     var formURL;
     var record = current;
     if (type == 'rm_product')
        formURL = 'cardboard_sdlc.do';
     else if (type == 'rm_release_sdlc') {
        formURL = 'cardboard_sdlc.do';
        record = current.parent;
     }
     else
        return;

     var baseId = record.sys_id;
     var shortD = record.short_description;
     var ci = record.cmdb_ci;
     var q = this.queryString(record);
     bq += this.fixedQueryString(record); // assumes bq is non empty String

     formURL += '?sysparm_query=' + q + '&sysparm_fixed_query=' + bq + '&sysparm_sys_id=' + baseId + '&sysparm_view=sdlc&sysparm_cmdb_ci=' + ci + '&sysparm_display_name=' + shortD;    
     return formURL; 
  },

  type: SDLCRelationships
});