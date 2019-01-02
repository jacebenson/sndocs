var ScrumRelationships = Class.create();

ScrumRelationships.prototype = Object.extendsObject(RMv2Relationships, {
  initialize : function() {
  },
   
  displayOnStoryForm: function (current) {
   return !current.isNewRecord() && 
          !current.parent.isNil() && 
          (current.parent.number.substring(0,4) == "RLSE" || 
           current.parent.number.substring(0,4) == "SPNT" ||
           current.parent.number.substring(0,4) == "PDCT");
  },

  // return URL of planning board to display, based upon current record and its parent
  //  type - product, release, release_phase
  //  record - relevant planned_task record
  //  bq   - base query (URL encoded)
  planningBoardURL: function(type, current, bq) {
     var formURL;
     var record = current;
     var ptype = current.parent.number.substring(0,4);

     if (type == 'rm_product')
        formURL = 'cardboard_scrum_product.do';
     else if (type == 'rm_release_scrum')
        formURL = 'cardboard_scrum_release.do';
     else if (type == 'rm_sprint' || type == 'rm_story') {
        record = current.parent;
        if (ptype == 'PDCT')
           formURL = 'cardboard_scrum_product.do';
        else if (ptype == 'RLSE')
           formURL = 'cardboard_scrum_release.do';
        else if (ptype == 'SPNT' && !current.parent.parent.isNil()) {
           // plan the release that the sprint is assigned to (only applies to type == rm_story)
           record = current.parent.parent;
           formURL = 'cardboard_scrum_release.do';
        } else 
           formURL = 'cardboard_scrum_unallocated.do';
     }
     else
        return;

     var baseId = record.sys_id;
     var shortD = record.short_description;
     var ci = record.cmdb_ci;
     var q = this.queryString(record);
     bq += this.fixedQueryString(record); // assumes bq is non empty String

     formURL += '?sysparm_query=' + q + '&sysparm_fixed_query=' + bq + '&sysparm_sys_id=' + baseId + '&sysparm_view=scrum&sysparm_cmdb_ci=' + ci + '&sysparm_display_name=' + shortD;    
     return formURL; 
  },

  type: ScrumRelationships
});