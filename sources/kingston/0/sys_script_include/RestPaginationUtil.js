/**
	 Utility function to calculate headers to support Pagination for Service catalog REST APIs
	 Header fields:
	     Link: Comma separated links for prev, next, first, last pages. Link type are described by "rel"
		 X-Total-Content: total number of records
**/
var RestPaginationUtil = Class.create();
RestPaginationUtil.prototype = {
	REL_FIRST : 'rel="first"',
	REL_PREV : 'rel="prev"',
	REL_NEXT : 'rel="next"',
	REL_LAST : 'rel="last"',
    initialize: function(request) {
		//Check if there is a property that defines limit
		this.sysparm_limit = 10;
		this.sysparm_offset = 0;
		this.totalCount = 0;
		this.baseURI = request.uri;
		this.queryParams = {};
		this.queryStringSansOffset = '';
		this._setQueryParams(request.queryParams);
    },
	_setQueryParams: function(queryParams) {
		this.queryParams = queryParams;

		if(queryParams.sysparm_limit != undefined)
			this.sysparm_limit = parseInt(queryParams.sysparm_limit);
		if(queryParams.sysparm_offset != undefined)
			this.sysparm_offset = parseInt(queryParams.sysparm_offset);

		for(var param in queryParams) {
			if(param != 'sysparm_offset')
				this.queryStringSansOffset += param + '=' + queryParams[param] + '&';
		}

		if(this.queryStringSansOffset.endsWith('&'))
			this.queryStringSansOffset = this.queryStringSansOffset.substring(0, this.queryStringSansOffset.length-1);
	},
	_constructHeaderLink: function(offsetVal, relation) {
		var headerLink = '<' + this.baseURI + '?';
		var queryString = this.queryStringSansOffset + '&sysparm_offset=' + offsetVal;
		headerLink += queryString + '>';
		headerLink += ';' + relation;

		return headerLink;
	},
	setTotalCount: function(totalRecords) {
		this.totalCount = totalRecords;
	},
	getLinkInfo: function() {
		var next = this.sysparm_offset + this.sysparm_limit;
		var prev = this.sysparm_offset - this.sysparm_limit;
		var pages = Math.ceil(this.totalCount/this.sysparm_limit);
		if(pages == 1)
			return '';
		var last = this.sysparm_limit * (pages-1);
		var linkInfo = '';

		//First page
		linkInfo += this._constructHeaderLink(0, this.REL_FIRST);
		linkInfo += ', ';

		//Prev page
		if(prev >= 0) {
			linkInfo += this._constructHeaderLink(prev, this.REL_PREV);
			linkInfo += ', ';
		}

		//Next page
		if(next != last) {
			linkInfo += this._constructHeaderLink(next, this.REL_NEXT);
			linkInfo += ', ';
		}

		//Last page
		linkInfo += this._constructHeaderLink(last, this.REL_LAST);

		return linkInfo;

	},
	getHeaderPaginationInfo: function() {
		return {
			'Link': this.getLinkInfo(),
			'X-Total-Count': '' + this.totalCount
		};
	},
    type: 'RestPaginationUtil'
};