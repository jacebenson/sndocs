gs.include('Attachment');
var ScreenCaptureAPI = Class.create();
ScreenCaptureAPI.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	attachScreenShot: function(){
		var targetTable = this.getParameter('sysparm_target_table_name');
		var targetSysId = this.getParameter('sysparm_target_sys_id');
		var imageDataFromClient = this.getParameter('sysparm_image_data');
		var fileName = this.getParameter("sysparm_file_name");
		var fileType = this.getParameter("sysparm_file_type");

		gs.log("ScreenCaptureAPI - User: " + gs.getUserName());
		gs.log("ScreenCaptureAPI - Target table: " + targetTable);
		gs.log("ScreenCaptureAPI - Target sys_id: " + targetSysId);
		gs.log("ScreenCaptureAPI - Image data is null? " + GlideStringUtil.nil(imageDataFromClient));
		gs.log("ScreenCaptureAPI - FileName: " + fileName);
		gs.log("ScreenCaptureAPI - FileType: " + fileType);
		
		var att = new Attachment();
		var n = imageDataFromClient.indexOf("base64,");
		var payload = imageDataFromClient.substring(n+7);
		var encodedImage = GlideStringUtil.base64DecodeAsBytes(payload);

		var targetGR = new GlideRecord(targetTable);
		if(!targetGR.get(targetSysId)){
			gs.log("ScreenCaptureAPI - Invalid GlideRecord. Exiting.");
			return "ERROR";
		}
		
		// Special case, all users can add attachments to the test result table
		if(!"sys_atf_test_result".equals(targetTable) && !targetGR.canWrite()){
			  gs.log("ScreenCaptureAPI - User does not have permission to write to record.");
			  return "ERROR";
		}
		
		var sa = new GlideSysAttachment();
		var attachmentSysId = sa.write(targetGR, fileName, fileType, encodedImage);
		if(GlideStringUtil.notNil(attachmentSysId))
			return "SUCCESS";
		else
			return "ERROR";
	},

    type: 'ScreenCaptureAPI'
});