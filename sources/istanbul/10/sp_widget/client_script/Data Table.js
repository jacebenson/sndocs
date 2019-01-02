function ($scope, $location, spUtil, amb, $http) {
	var c = this;
	/*
	 * options:
	 * hide_footer (bool) = true to remove the data table footer contents
	 * hide_header (bool) = true to remove the data table header contents
	 * show_new (bool) = true to show the "New" record button
	 * show_keywords (bool) = true to show the keyword search field
	 * table (string) = the table name to query
	 * filter (string) = the encoded query
	 * o (string) = the order by column
	 * d (string) = The order by direction: asc or desc
	 * p (int) = the page to jump to
	 * fields (string) = comma seperated list of fields that become the list columns
	 * view (string) = the default view to load for columns, overrides fields
	*/

	$scope.exportTypes = [{label:'PDF', value: 'PDF'}, {label:'Excel', value:'EXCEL'}, {label:'CSV', value:'CSV'}];
	var keys = ['table', 'filter', 'p', 'o', 'd'];

	var eventNames = {
		click: 'data_table.click',
		setFilter: 'data_table.setFilter',
		setKeywords: 'data_table.setKeywords'
	};

	$scope.go = function(table, item) {
		var parms = {};
		parms.table = table;
		parms.sys_id = item.sys_id;
		parms.record = item;
		$scope.ignoreLocationChange = true;
		for (var x in c.data.list) {
			c.data.list[x].selected = false;
		}
		item.selected = true;
		$scope.$emit(eventNames.click, parms);
	};

	$scope.newRecord = function(){
		var parms = {
			id: 'form',
			table: $scope.data.table,
			sys_id: '-1'
		};
		if ($scope.data.filter != '')
			parms.query = $scope.data.filter;

		$location.search(parms);
	};

	function recoverStateFromUrl() {
		$scope.data.fields = [];
		var s = $location.search();
		for (var x in keys) {
			if (s[keys[x]]) {
				$scope.data[keys[x]] = s[keys[x]];
			}
		}
		$scope.server.update().then(function(data) {
			if (s.sys_id) {
				for (var x in data.list) {
					if (data.list[x].sys_id == s.sys_id) {
						$scope.go(s.table, data.list[x]);
					}
				}
			}
		});
	}
	
	if ($scope.options.fromUrl) {		
			$scope.$on('$locationChangeSuccess', function(e) {
			if ($scope.ignoreLocationChange){
				$scope.ignoreLocationChange = false;
				return;
			}

			// Helps to recover state when using the browser's back button
			recoverStateFromUrl();
		});		
	}

	
	$scope.getNumber = function(num) {
		return new Array(num);
	}

	$scope.mathMin = function(v1,v2) {
		return Math.min(v1,v2);
	}

	function getData(updateUrl) {
		var f = $scope.data;
		spUtil.update($scope).then(function(data) {
			f.view = data.view;
			if ($scope.options.fromUrl && updateUrl)				
				setPermalink(f.table, f.filter, f.o, f.d, f.p);

			if ($scope.options.show_breadcrumbs && data.filterBreadcrumbs)
				$scope.$broadcast('widget-filter-breadcrumbs.setBreadcrumbs', data.filterBreadcrumbs.data);

			initRecordWatcher(f.table, f.filter);
		});
	}

	function setPermalink(table, filter, orderBy, orderDirection, page){
		$scope.ignoreLocationChange = true;
		var search = $location.search();
		angular.extend(search, {
			spa: 1,
			table: table,
			filter: filter,
			p: page,
			o: orderBy,
			d: orderDirection
		});
		$location.search(search);
	}

	var watcher;
	function initRecordWatcher(table, filter){
		if (watcher)
			watcher.unsubscribe();

		if (table && filter) {
			var watcherChannel = amb.getChannelRW(table, filter);
			amb.connect();
			watcher = watcherChannel.subscribe(function() {
				spUtil.update($scope)
			});
		}
	}

	$scope.setPageNum = function(num) {
		$scope.data.p = num;
		getData(true);
	}

	$scope.setOrderBy = function(field) {
		var d = "asc";
		if ($scope.data.o == field) {
			if ($scope.data.d == "asc")
				d = "desc";
			else
				d = "asc";
		}
		$scope.data.o = field;
		$scope.data.d = d;
		$scope.setSearch(true);
	}

	$scope.setSearch = function(updateUrl) {
		$scope.data.p = 1;
		getData(updateUrl);
	}

	$scope.$on(eventNames.setFilter, function(e, newFilter){
		$scope.data.filter = newFilter;
		$scope.setSearch(false);
	});

	$scope.$on(eventNames.setKeywords, function(e, keywords){
		$scope.data.keywords = keywords;
		$scope.setSearch(false);
	});

	$scope.$on('widget-filter-breadcrumbs.queryModified', function(e, newFilter){
		$scope.data.filter = newFilter;
		$scope.setSearch(true);
	});

	$scope.rowsWerePruned = function() {
		if (!$scope.data.list)
			return;
		
		$scope.rowsPruned = $scope.mathMin($scope.data.window_end,$scope.data.row_count) - $scope.data.window_start - $scope.data.list.length;
		return $scope.rowsPruned > 0;
	}

	$scope.showFilter = function() {
		return !$scope.data.list.length && !$scope.data.num_pages && !$scope.data.invalid_table && !$scope.loadingData;
	}
	
	c.appendQuery = function(query){
		if ($scope.data.filter.length > 1)
			$scope.data.filter += '^';
		$scope.data.filter += query;
			$scope.setSearch();
		
	}

	// Makes Widget Async
	var title = $scope.data.title;
	if ($scope.options.use_instance_title == 'true')
		title = $scope.options.title;
	$scope.data = $scope.options;
	$scope.loadingData = true;
	$scope.server.update().then(function() {
		if ($scope.data.newButtonUnsupported)
			console.log("Service Portal: New button not supported for sys_attachment list");
		$scope.loadingData = false;
		$scope.data.title = title;
		initRecordWatcher($scope.data.table, $scope.data.filter);
	});
	
	function parseQuery(table, queryString){
		return $http.post('/api/now/sp/parsequery/' + table, queryString).then(function(response){
				return response.data.result;
		});
	}
	
	c.createQueryTerm = function(table, field, sys_id, operator){
		return $http.get('/api/now/sp/getInOutQueryTerm', {
			params: {
				table: table,
				sys_id: sys_id,
				field: field,
				operator: operator
			}
		}).then(function(response){
			if (response && response.data && response.data.result)
				return response.data.result.parts;
		});
	}
	
	c.showMatching = function(field, newTerm) {
		var queryString = $scope.data.filter;
		var eq = "";
		parseQuery($scope.data.table, queryString).then(function(oldTerms) {
			for(var i=0; i<oldTerms.length; i++){
				var term = oldTerms[i];
				if (isSameField(newTerm, term))
					continue;
				
				if (eq.length)
					eq += '^';
				
				eq += getEncodedTerm(term);
			}
			if (eq.length)
					eq += '^';
			eq += getEncodedTerm(newTerm);
			
			$scope.data.filter = eq;
			$scope.setSearch();
		});
	};
	
	c.filterOut = function(field, newTerm) {
		var eq = $scope.data.filter;
		if (eq.length)
					eq += '^';
		
		eq += getEncodedTerm(newTerm);
		$scope.data.filter = eq;
		$scope.setSearch();
	};
	
	function isSameField(t1, t2) {
		if ('left' in t1 && 'left' in t2)
			return t1.left.field === t2.left.field;
		else if ('left' in t1)
			return t1.left.field === t2.field;
		else if ('left' in t2)
			return t1.field === t2.left.field;
		return t1.field === t2.field;
	}
		
	function getEncodedTerm(term) {
		var eq;
		if (term.left) {
			eq = getEncodedTerm(term.left);
			eq += '^OR';
			eq += getEncodedTerm(term.right);
		} else {
			eq = term.field;
			eq += term.operator;
			eq += term.value;
		}
		return eq;
	}
	
}