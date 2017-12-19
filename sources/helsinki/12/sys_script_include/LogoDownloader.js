var LogoDownloader = Class.create();
LogoDownloader.prototype = {
    initialize: function() {
    },

	updateLogo: /*sys_attachment id*/ function(/* GlideRecord sys_remote_app | sys_store_app */ app) { 
		this._deleteAttachment(app);
		
		var tracker = null;
		var source_app_id = app.sys_id.toString();
		var version = app.latest_version.toString();
		var targetTableName = app.getTableName();
		var targetTableSysId = app.getUniqueValue();		
		var targetFileName = "logo";
		var targetFileContentType = "image/jpeg";		
		var attachmentSysID = new AppRepoRequest("update_logo")
			.setParameter("source_app_id", source_app_id)
			.setParameter("version", version)
			.downloadAttachment(targetTableName, targetTableSysId, targetFileName, targetFileContentType, tracker);
		return attachmentSysID;
	},
	
	_deleteAttachment: /*void*/ function(/* GlideRecord sys_remote_app | sys_store_app */ app) {
		var table_name = app.getRecordClassName();
		var table_sys_id = app.sys_id.toString();		
		var logo = this._getLogoAttachment(table_name, table_sys_id);
		if (logo !== null) {
			gs.debug("Removing old logo for app " + table_name + ":" + table_sys_id + " logo sys_id: " + logo.sys_id.toString());
			new GlideAppLoader().reapOldLogo(logo);
		}
	},
	
	_getLogoAttachment: /*sys_attachment*/ function (/*String*/ table_name, /*String*/ table_sys_id) {
		gs.debug("Looking up logo for app " + table_name+":"+table_sys_id);
		var att = new GlideRecord("sys_attachment");
		att.addQuery("table_name", table_name);
		att.addQuery("table_sys_id", table_sys_id);
		att.addQuery("file_name", 'logo');
		att.query();
		if (att.next())
			return att;
		
		return null;
	},
	
    type: 'LogoDownloader'
};