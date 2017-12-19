var UpdateSetPreview = Class.create();

		UpdateSetPreview.prototype = Object.extendsObject(AbstractAjaxProcessor, {
			ajaxFunction_generateCollisionRecords: function() {
				// Secured
				if (!gs.hasRole('admin'))
					return;
				this.sub_generateCollisionRecords();
			},

			// Added to enable security testing 
			sub_generateCollisionRecords: function() {
				// Setup and start the progress worker
				var worker = new GlideScriptedProgressWorker();
				worker.setProgressName("Generating Collision Report");
				worker.setName('UpdateSetPreviewer');
				worker.addNonEscapedParameter(this.getParameter('sysparm_keyset') + "");
				worker.addParameter("collision");
				worker.setBackground(true);
				worker.setCannotCancel(true);
				worker.start();

				// Get Collision Report Number for our redirect URL
				var rpt = new UpdateSetPreviewer();
				var hashKey = new Packages.java.lang.String(this.getParameter('sysparm_keyset') + "").hashCode();
				var rptID = rpt._generateReportNumber(hashKey);

				// Redirect
				var redirect = "update_set_collision_status.do?sysparm_pworker_sysid=" + worker.getProgressID();
				redirect += "&sysparm_redirect_report=sys_update_collision_xml_list.do?sysparm_query=report_number=" + rptID;
				gs.setRedirect(redirect);
			}
		});