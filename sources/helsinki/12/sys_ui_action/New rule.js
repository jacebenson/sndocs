var uri = action.getGlideURI();
		var path = uri.getFileFromPath() + '';
		path = path.substring(0, path.length - 5) + '.do';

		uri.set('sys_id', '-1');

		path = checkWizard(uri, path);
		if (path)
			action.setRedirectURL(uri.toString(path));
		
		action.setNoPop(true);
				
		function checkWizard(uri, path) {
			var already = uri.get('WIZARD:action');
			if (already == 'follow')
				return null;

			var wizID = new GlideappWizardIntercept(path).get();
			if (!wizID)
				return path;

			uri.set('sysparm_parent', wizID);
			uri.deleteParmameter('sysparm_referring_url');
			uri.deleteMatchingParameter('sysparm_list_');
			uri.deleteMatchingParameter('sysparm_record_');
			uri.deleteParmameter('sys_is_list');
			uri.deleteParmameter('sys_is_related_list');
			uri.deleteParmameter('sys_submitted');
			uri.deleteParmameter('sysparm_checked_items');
			uri.deleteParmameter('sysparm_ref_list_query');
			uri.deleteParmameter('sysparm_current_row');

			uri.set('sysparm_referring_url', uri.toString());
			uri.deleteMatchingParameter('fancy.');
			uri.deleteMatchingParameter('sys_rownum');
			uri.deleteMatchingParameter('sysparm_encoded');
			uri.deleteMatchingParameter('sysparm_query_encoded');
			uri.deleteParmameter('sysparm_refer');

			return 'wizard_view.do';
		}