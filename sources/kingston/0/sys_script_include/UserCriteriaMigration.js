var UserCriteriaMigration = Class.create();
UserCriteriaMigration.prototype = {
    initialize : function() {
    },

    fixUserCriteriaProperty : function() {
        gs.log("User Criteria Migration started: For using the Service Catalog User Criteria")

		var uc_prop = "glide.sc.use_user_criteria";
        var be = GlidePluginManager.isActive("com.glide.express.applications");
        
        function fixUserCriteriaProperty(uc_prop) {
            var legacyTables = [ "sc_cat_item_company_mtom",
                    "sc_cat_item_company_no_mtom", "sc_cat_item_dept_mtom",
                    "sc_cat_item_dept_no_mtom", "sc_cat_item_group_mtom",
                    "sc_cat_item_group_no_mtom", "sc_cat_item_location_mtom",
                    "sc_cat_item_location_no_mtom", "sc_cat_item_user_mtom",
                    "sc_cat_item_user_no_mtom", "sc_category_company_mtom",
                    "sc_category_company_no_mtom", "sc_category_dept_mtom",
                    "sc_category_dept_no_mtom", "sc_category_group_mtom",
                    "sc_category_group_no_mtom", "sc_category_location_mtom",
                    "sc_category_location_no_mtom", "sc_category_user_mtom",
                    "sc_category_user_no_mtom" ];

            var numTbls = legacyTables.length;
            var totRecs = 0;

            for (var i = 0; i < numTbls; i++) {
                var recs = new GlideRecord(legacyTables[i]);
                if (recs.isValid()) {
                    recs.query();
                    totRecs += recs.getRowCount();
                    gs.print("Num of records found in " + legacyTables[i] + " : " + recs.getRowCount());
                }
                if (totRecs > 0)
                    i = numTbls;
            }

            if (totRecs > 0) {
				gs.setProperty(uc_prop, false);
                gs.log("User Criteria migration finished unsuccessfully. Property: " + uc_prop + " has been set to 'false'. Records found in legacy tables. Please refer to the wiki to perform manual user criteria migration");
            } else {
                gs.setProperty(uc_prop, true);
                gs.log("User Criteria migration finished successfully. Property: " + uc_prop + " has been set to 'true'");
            }
        }
        
        if (!be)
            fixUserCriteriaProperty(uc_prop);
		else
			gs.setProperty(uc_prop, false);
			
    },

    type : 'UserCriteriaMigration'
}