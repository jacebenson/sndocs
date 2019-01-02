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

    isPublic: function() {
        return false;
    },

    type: 'cxs_SearchResultsAJAX'
});