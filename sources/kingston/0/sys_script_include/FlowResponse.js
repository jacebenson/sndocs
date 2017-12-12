var FlowResponse = Class.create();
FlowResponse.prototype = {
    initialize: function(response) {
		
		var record;
		
		if (typeof response === 'string') {
			
			var gr = new GlideRecord('x_pisn_guii_response');
			
			if (!gr.get(response)) {
				return false;
			}
			
			record = gr;
			
		} else if (typeof response === 'object') {
			
			record = response;
			
		} else {
			
			return false;
			
		}
		
		Object.defineProperty(this, '_gr', { value: record, enumerable: false });
		
		if (this.getData()) {
			this.data = this.getData();
		}
		
		if (this.getRecords()) {
			this.records = this.getRecords();
		}
		
		if (this.getAttachments()) {
			this.attachments = this.getAttachments();
		}

    },
	
	getSysID: function () {
		return this._gr.getUniqueValue();
	},
	
	getScreenID: function () {
		
		return this._gr.getValue('screen');
	},
	
	setComplete: function () {
		this._gr.setValue('state', 'completed');
		return this._gr.update();
	},
	
	
	/**
	 * Get any data saved in this response for the screen supplied
	 *
	 * @returns {Object}  JSON object containing the data
	 */
	getData: function () {
		
		return JSON.parse(this._gr.getValue('data'));
	},
	
	/**
	 * 
	 * @param {Object} data  JSON object containing the data
	 * @returns {boolean}  whether setting the data was successful
	 */
	setData: function (data) {
		this._gr.data = JSON.stringify(data);
		this._gr.update();
	},
	
	
	
	/**
	 * Get any records saved in this response
	 *
	 * @returns {Array:<Object>} An array of objects, listing the table name and SysID of the record
	 */
	getRecords: function () {
		
		var records = [];
		
		var gr = new GlideRecord('x_pisn_guii_records');
		gr.addQuery('response', this.getSysID());
		gr.query();
		
		while (gr.next()) {
			records.push({
				id: gr.getValue('record'),
				table: gr.getValue('record_table')
			});
		}
		
		return gr.getRowCount() > 0 ? records : false;
	},
	
	/**
	 * 
	 * @param {Array:<Object>} records  An array of objects, listing the table name and SysID of the record
	 * @returns {boolean} whether setting the record was successful
	 */
	setRecords: function (records) {
		
		var gr;
		
		records.forEach(function (cv) {
			
			gr = new GlideRecord('x_pisn_guii_records');
			gr.addQuery('record', cv.id);
			gr.addQuery('record_table', cv.table);
			gr.addQuery('response', this.getSysID());
			gr.setLimit(1);
			gr.query();
			
			if (gr.getRowCount() === 0) {
				gr = new GlideRecord('x_pisn_guii_records');
				gr.initialize();
				gr.record = cv.id;
				gr.record_table = cv.table;
				gr.response = this.getSysID();
				gr.insert();
			}
			
		}, this);
		
	},
	
	/**
	 * Get any attachments saved in this session for the screen supplied
	 *
	 * @param {string} screenID the ID of the screen to get attachments for
	 * @returns {Array} An array of strings - SysID's of the attachments
	 */
	getAttachments: function () {
		return false;
	},
	
	/**
	 * 
	 * @param {string} screenID the ID of the screen to get attachments for
	 * @returns {boolean} whether setting the attachment was successful
	 */
	setAttachments: function () {
		
	},

    type: 'FlowResponse'
};