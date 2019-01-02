var cxs_SearchResultsAJAX = Class.create();

cxs_SearchResultsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    INTERLEAVED: "interleaved",
    HTTP_OK: "200",
    HTTP_PARTIAL_CONTENT: "206",

    process: function() {
        var searchRequestJSON = this.getParameter("payload");

        if (!searchRequestJSON)
            return "";

        var json = new JSON();

        searchRequestJSON = JSON.stringify(this._applyContextFilters(JSON.parse(searchRequestJSON)));
		
		var request = new SNC.SearchRequest();
        var response = request.fromJSON(searchRequestJSON).submit();

        if (!response)
            return "";

        var payload = this.newItem("payload");

        if (response.status.code != this.HTTP_OK && response.status.code != this.HTTP_PARTIAL_CONTENT) {
            payload.setAttribute("response", response.toJSON());
            return;
        }

        response.results = this._filter(response.results, function(elem) {
            return elem.meta && (elem.meta.interleaved || elem.meta.pinned);
        });

        var macroNamesJSON = this.getParameter("cxs_macro_names");
        var macroNames = !macroNamesJSON ? {} : json.decode(macroNamesJSON);

        var responseJSON = response.toJSON();
        var html = cxs_App.getActions("cxs_FormatResults", json.decode(responseJSON)).usingMacro(macroNames);

        payload.setAttribute("response", responseJSON);
        payload.setAttribute("html", html);
    },

    _filter: function(sourceArray, filterFunction) {
        var filteredArray = [];
        for (var i = 0; i < sourceArray.length; i++) {
            if (filterFunction.call(this, sourceArray[i]))
                filteredArray.push(sourceArray[i]);
        }

        return filteredArray;
    },

    _applyContextFilters: function(searchRequestJSON) {
		var requestQuery = JSON.parse(this.getParameter("cxs_filter_data"));
        var context_resource_filters = {};
        var isActive = GlidePluginManager.isActive('com.snc.contextual_search.dynamic_filters');
        
		if(!isActive || !requestQuery || 
		   !requestQuery.hasOwnProperty("filters_configured") || !requestQuery.hasOwnProperty("source") ||
		  !requestQuery.hasOwnProperty("fieldValues")) {
            return searchRequestJSON;
        }

        var filtersConfigured = requestQuery.filters_configured;
        var source = String(requestQuery.source);
        var fieldValues = String(requestQuery.fieldValues);
		var configId =  String(requestQuery.config_id);
		
		if(filtersConfigured == true) {
			var configAction = cxs_App.getActions(source);
			var filters = configAction.getFilters(configId, fieldValues);
			var filtersJSON = JSON.parse(filters);
			if(Object.keys(filtersJSON).length !== 0) {
				searchRequestJSON.query.context_resource_filters = filtersJSON;
			}
		}
        return searchRequestJSON;
    },

    isPublic: function() {
        return false;
    },

    type: 'cxs_SearchResultsAJAX'
});