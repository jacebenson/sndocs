function fixNewUI16ConfigProps() {
	var color = gs.getProperty('css.$navpage-nav-unselected-color', '#bec1c6');

	gs.setProperty('css.$navpage-nav-color-sub', color, 'Module text color for UI16');
	gs.setProperty('css.$navpage-nav-unselected-color', color, 'Unselected navigation tab icon and favorite icons color');
}

fixNewUI16ConfigProps();