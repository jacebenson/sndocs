function($scope, $timeout, $location, spAnnouncement, spUtil, spAriaUtil) {
  var c = this;

	c.wid = 'spw-announcements-' + new Date().getTime();
	c.accessibilityOff = spAriaUtil.g_accessibility === 'false';
	c.announcements = [];
	c.totalAnnouncements = 0;

	c.getCleanGlyphName = function() {
		return c.options.glyph.replace(/-/g, ' ');
	};

	c.toggleDetails = function(announcement) {
		announcement.expanded = !announcement.expanded;
		if (!announcement.truncatedEl)
			return;

		if (announcement.expanded)
			announcement.truncatedEl.text(announcement.title);
		else
			announcement.truncatedEl.text(announcement.truncatedTitle);
	};

	c.isViewAllPage = function() {
		return $location.search().id === c.options.view_all_page;
	};

	c.getNumArray = function(number) {
		return new Array(number);
	};

	c.getPageInfo = function() {
		var limit = parseInt(c.options.max_records, 10);
		var offset = (c.currentPage - 1) * limit;
		var end = offset + limit;

		return spUtil.format('Rows {start} - {end} of {total}', {
			start: offset + 1,
			end: end < c.totalRecords ? end : c.totalRecords,
			total: c.totalRecords
		});
	};

	c.goToPage = function(page, firstLoad) {
		var result = spAnnouncement.get(spAnnouncement.filterOnType(c.options.type), c.options.max_records, page);

		c.currentPage = page;
		c.totalPages = result.totalPages;
		c.totalRecords = result.totalRecords;

		c.announcements = result.data;
		c.totalAnnouncements = result.data.length;

		$(document).ready(function() {
			c.announcements.forEach(function(a) {
				isTruncated(a.id, function(truncatedTitle, truncatedEl) {
					a.truncatedTitle = truncatedTitle;
					a.truncatedEl = truncatedEl;
					a.canExpand = truncatedTitle || a.summary || a.targetLinkText;
					a.expanded = false;
				});
			});

			if (!firstLoad)
				setFocus();
		});
	};

	c.linkSetup = function(a) {
    a.linkTarget = '_self';

    if ('urlNew' === a.clickTarget) {
      a.linkTarget = '_blank';
    }

    a.linkType = !a.targetLink ? 'none' : a.targetLinkText ? 'normal' : 'title';
  };

	function isTruncated(id, callback) {
		var el = $('.' + c.wid).find(spUtil.format('[data-aid="{id}"]', {id: id}));
		if (!el.length) {
			$timeout(function() {
				isTruncated(id, callback);
			});

			return;
		}

		$timeout(function() {
			var oel = el.find('[data-overflowed="true"]');
			if (!oel.length) {
				callback();
				return;
			}

			callback(oel.text(), oel);
		}, 10);
	}

	function setFocus() {
		var ul = $('.' + c.wid).find('ul');

		if (!ul.length) {
			$timeout(setFocus);
			return;
		}

		$timeout(function() {
			ul.first().focus();
		}, 20);
	}

	c.goToPage(1, true);
}