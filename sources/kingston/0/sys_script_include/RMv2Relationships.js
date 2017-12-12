var RMv2Relationships = Class.create();

RMv2Relationships.prototype = {
  initialize : function() {
  },

  // return URL of planning board to display, based upon current record and its parent
  //  type  - rm_product, rm_release, rm_release_phase
  //  record - relevant planned_task record
  //  bq    - base query (URL encoded)
  planningBoardURL: function(type, current, bq) {
     var formURL;
     var record = current;
     if (type == 'rm_product')
        formURL = 'cardboard_release_v2.do';
     else if (type == 'rm_release') {
        formURL = 'cardboard_release_v2_release.do';
        // a release can have another release as its parent (to many levels)
        // if this one doesn't have any active children, then plan its parent
        var relGR = new GlideRecord('rm_release');
        relGR.addQuery('parent', current.getUniqueValue());
        relGR.addActiveQuery();
        relGR.addQuery('sys_class_name', 'IN', 'rm_release,rm_release_phase'); // releases, release phases only
        relGR.query();
        if (!relGR.next())
           record = current.parent;
     }
     else if (type == 'rm_release_phase') {
        formURL = 'cardboard_release_v2_release.do';
        record = current.parent;
     }
     else
        return;

     var baseId = record.sys_id;
     var shortD = record.short_description;
     var ci = record.cmdb_ci;
     var q = this.queryString(record);
     bq += this.fixedQueryString(record); // assumes bq is non empty String

     formURL += '?sysparm_query=' + q + '&sysparm_fixed_query=' + bq + '&sysparm_sys_id=' + baseId + '&sysparm_view=release&sysparm_cmdb_ci=' + ci + '&sysparm_display_name=' + shortD;    
     return formURL; 
  },

  queryString: function(gr) {
     var q = 'parent=^ORparent=' + gr.sys_id;
     return q;
  },

  fixedQueryString: function(gr) {
     var q = '';
     if (!gr.cmdb_ci.nil()) {
       q += '^cmdb_ci=' + gr.cmdb_ci;
     }
     return q;
  },

  type: RMv2Relationships
}