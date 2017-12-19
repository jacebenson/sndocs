(function(){
	addLoadEvent(function() {
		var getDomainQuery = function(id) {
			var domain = g_scratchpad._loadMetricDomain;
			var query = getFilter(id);
			// If there is a domain
			if (domain != null && domain != 'null') {
				var q;
				// Use a special query if the domain is global or empty
				if (domain.strip() == '' || (domain.indexOf('global') >= 0))
					q = 'sys_domain=global^ORsys_domainISEMPTY';
				else
					q = 'sys_domain=' + domain;
				
				// Strip the query of the END marker
				if (query.endsWith('^EQ'))
					query = query.substr(0, query.length - 3);
				
				// If the query is not empty, add an AND
				if (query.strip().length > 0) 
					query += '^';
				
				// Add the domain portion and an END marker to the query
				query += q + '^EQ';
			}
			return query;
		};
		
		window.openConditionQueryResults = function(element) {
			var id = element.getAttribute('data-ref');
    		var depName = element.getAttribute('data-dependent');
    		var depTable = getDependentTableName(element);
			
			var redirect = function(query) {
				var table = resolveDependentValue(id, depName, depTable);
				var url = table + "_list.do?sysparm_query=" + query;
				window.open(url, "_blank");
			};
			
			// For other conditions (e.g. filter condition), 
			// use the regular query count
			if (id != 'asmt_metric_type.condition') {
				redirect(getFilter(id));
			}
			// For the condition count, check that domain matches
			else {
				redirect(getDomainQuery(id));
			}
		};
		
		window.checkConditionQueryCount = function(element) {
			var id = element.getAttribute('data-ref');
            var depName = element.getAttribute('data-dependent');
            var depTable = getDependentTableName(element);
			
			if (!depTable) {
				$('condition_widget.' + id).hide();
				return;
			}
			
			var getCount = function(query) {
				var table = resolveDependentValue(id, depName, depTable);
				var ga = new GlideAjax('ConditionsQueryAjax');
				ga.addParam('sysparm_name', 'getConditionQueryCount');
				ga.addParam('sysparm_table', table);
				// Use (possibly modified) query to get count
				ga.addParam('sysparm_encoded_query', query);
				ga.getXML(populateConditionQueryCount, null, id);
				$('condition_widget.' + id).show();
			};
			
			// For other conditions (e.g. filter condition), 
			// use the regular query count
			if (id != 'asmt_metric_type.condition') {
				getCount(getFilter(id));
			}
			// For the condition count, check that domain matches
			else {
				getCount(getDomainQuery(id));
			}
		}
	});
})();