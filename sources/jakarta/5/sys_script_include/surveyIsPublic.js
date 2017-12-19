surveyIsPublic = function(id) {
   var gr = new GlideRecord("survey_question_new");
   gr.addQuery("master", id);
   gr.query();
   while (gr.next()) {
      var roles = gr.read_roles.split(",");
      for (var i = 0; i < roles.length; i++) {
         if (roles[i] == "public")
           return true;
      }
   }
   return false;
}