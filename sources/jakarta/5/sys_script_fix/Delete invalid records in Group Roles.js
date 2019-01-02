deleteIncorrectRecords();

				function deleteIncorrectRecords(){
					//Query sys_group_has_role table for null values in 'Group' & 'Role' fields
					var gr = new GlideRecord("sys_group_has_role");
					var qc = gr.addNullQuery("role");
					qc.addOrCondition("group", null);
					gr.query();
					gr.deleteMultiple();
					gs.log("Deleted " + gr.getRowCount() + " records from sys_group_has_role with null value in group or role fields");
				}
