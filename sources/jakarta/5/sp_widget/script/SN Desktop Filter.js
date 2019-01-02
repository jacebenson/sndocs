(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.table = input.table || options.table || $sp.getParameter("table");
	data.initialQuery = options.initialQuery || $sp.getParameter("filter");
})();