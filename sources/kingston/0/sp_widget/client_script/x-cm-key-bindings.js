function($scope) {
	/* widget controller */
	var c = this;
	c.cmd = '⌘';
	c.ctrl = "Ctrl";
	c.alt = "Alt"
	// chrome, safari
	// in FF, when the codemirror edit is focused, the 
	// event does not get bubbled up
	c.accesskey = "Ctrl Alt";
	// detect is loaded with codemirror - not in preview then
	c.ua = detect.parse(navigator.userAgent);
	var b = c.ua.browser;
	if (b.family === 'Chrome')
		c.showOther = true;
	if (b.family === 'Safari')
		c.showOther = true;

	if (c.ua.os.family.startsWith('Windows')) {
		c.windows = true;
		c.cmd = "Ctrl";
		c.accesskey = "Alt";
		c.showOther = true;
	}
}