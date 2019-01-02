var ecc = new GlideRecord('ecc_queue');
if(ecc.get('b4a2908e0f2ec7c4503c590be1050eec')){
	var xmldoc = new XMLDocument(ecc.getValue('payload'));
	gs.info(xmldoc.getNodeText('//output'));
}