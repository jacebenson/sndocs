surveysArePublic = function() {
   var pp = new GlideRecord("sys_public");
   pp.addActiveQuery();
   pp.addEncodedQuery("pageINsurvey_take,survey_thanks,survey_master,post_survey");
   pp.query();
   if (pp.getRowCount() != 4)
      return false; // does not have correct public pages
   
   return hasAllPublicACLs();
}

function hasAllPublicACLs() {
   var tables = new Array("survey_master", "survey_question_new", "question");
   var role = getPublicRoleId();
   for (i in tables) {
      if (!hasPublicACL(tables[i], role))
         return false;
   }
   
   return true;
}

function hasPublicACL(table, role) {
   var gr = new GlideRecord("sys_security_acl");
   gr.addQuery("name", table);
   gr.addQuery("operation", "read");
   gr.query();
   var encQuery = gr.getEncodedQuery();
   if (!gr.next())
      return false;
   
   return hasPublicRole(gr.sys_id.toString(), role);
}

function hasPublicRole(acl, role) {
   var gr = new GlideRecord("sys_security_acl_role");
   gr.addQuery("sys_security_acl", acl);
   gr.addQuery("sys_user_role", role);
   gr.query();
   return gr.hasNext();
}

function getPublicRoleId() {
   var gr = new GlideRecord("sys_user_role");
   gr.get("name", "public");
   return gr.sys_id.toString();
}