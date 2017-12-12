function($scope) {
  /* widget controller */
  var c = this;

	c.config = {
		outputType: "encoded_query",
		closeFilter: true,
		encodedQuery: massageEncodedQuery(c.data.initialQuery),
		manageFiltersLink: "?id=lf&table=sys_filter"
	};

	function massageEncodedQuery(encodedQuery) {
		return (encodedQuery) ? encodedQuery.replace(/CONTAINS/g, "LIKE").replace(/DOES NOT CONTAIN/g, "NOT LIKE") : encodedQuery;
	}
}