var AttachmentUtils = Class.create();
AttachmentUtils.prototype = {
    initialize: function(attachmentSysId) {
    	this.attachmentSysId = attachmentSysId;
    	this.attInptStream = new GlideSysAttachment().getContentStream(attachmentSysId);
    },
	
	/**
	 *  Gets MD5 checksum for the attachment identified by the attachmentSysId
	 *  parameter in the class initialization.
	 *
	 * Returns MD5 checksum string
	 */
	getMD5ChecksumFromAttachment: function () {
		return new GlideDigest().getMD5Base64FromInputStream(this.attInptStream);
	},

	/**
	 *  Gets SHA1 checksum for the attachment identified by the attachmentSysId
	 *  parameter in the class initialization.
	 *
	 * Returns SHA1 checksum string
	 */
	getSHA1ChecksumFromAttachment: function () {
		return new GlideDigest().getSHA1Base64FromInputStream(this.attInptStream);
	},
	
	/**
	 *  Gets SHA256 checksum for the attachment identified by the attachmentSysId
	 *  parameter in the class initialization.
	 *
	 * Returns SHA256 checksum string
	 */
	getSHA256ChecksumFromAttachment: function () {
		return new GlideDigest().getSHA256Base64FromInputStream(this.attInptStream);
	},
	
	/**
	 *  Gets MD5 Hex checksum for the attachment identified by the attachmentSysId
	 *  parameter in the class initialization.
	 *
	 * Returns MD5 Hex checksum string
	 */
	getMD5HexChecksumFromAttachment: function () {
		return new GlideDigest().getMD5HexFromInputStream(this.attInptStream);
	},

	/**
	 *  Gets SHA1 Hex checksum for the attachment identified by the attachmentSysId
	 *  parameter in the class initialization.
	 *
	 * Returns SHA1 Hex checksum string
	 */
	getSHA1HexChecksumFromAttachment: function () {
		return new GlideDigest().getSHA1HexFromInputStream(this.attInptStream);
	},
	
	/**
	 *  Gets SHA256 Hex checksum for the attachment identified by the attachmentSysId
	 *  parameter in the class initialization.
	 *
	 * Returns SHA256 HEx checksum string
	 */
	getSHA256HexChecksumFromAttachment: function () {
		return new GlideDigest().getSHA256HexFromInputStream(this.attInptStream);
	},
	
type: 'AttachmentUtils'
};