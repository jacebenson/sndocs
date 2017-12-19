var TestFieldQualifier = Class.create();
TestFieldQualifier.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    type: 'TestFieldQualifier',
	testFieldQualifier: function() {
		if (JSUtil.notNil(listEditRefQualTag)) {
			console.log('$$$ '+listEditRefQualTag);
			return 'nameLIKE' + listEditRefQualTag;
		} else if (JSUtil.notNil(current.test_step.table)) {
			console.log('$$$' + current.test_step.table);
			return 'nameLIKE' + current.test_step.table;
		}
	}
});