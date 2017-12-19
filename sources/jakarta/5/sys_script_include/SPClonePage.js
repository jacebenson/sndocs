var SPClonePage = Class.create();

(function() {

	function cloneContainers(oldPageId, newPageId) {
		var currentContainer = new GlideRecord('sp_container');
		currentContainer.addQuery('sp_page', oldPageId);
		currentContainer.orderBy('order');
		currentContainer.query();
		while (currentContainer.next()) {
			var oldContainerId = currentContainer.getUniqueValue();
			var newContainer = new GlideRecord('sp_container');
			newContainer.initialize();
			newContainer = currentContainer;
			newContainer.sp_page = newPageId;
			var newContainerId = newContainer.insert();
			cloneRows(oldContainerId, newContainerId);
		}
	}

	function cloneRows(oldContainerId, newContainerId) {
		if (newContainerId == '')
			return;

		duplicateBgImage('ZZ_YYsp_container', oldContainerId, newContainerId);
		var currentRow = new GlideRecord('sp_row');
		currentRow.addQuery('sp_container', oldContainerId);
		currentRow.orderBy('order');
		currentRow.query();
		while (currentRow.next()) {
			var oldRowId = currentRow.getUniqueValue();
			var newRow = new GlideRecord('sp_row');
			newRow.initialize();
			newRow = currentRow;
			newRow.sp_container = newContainerId;
			var newRowId = newRow.insert();
			cloneColumns(oldRowId, newRowId);
		}
	}

	function cloneColumns(oldRowId, newRowId) {
		if (newRowId == '')
			return;

		var currentColumn = new GlideRecord('sp_column');
		currentColumn.addQuery('sp_row', oldRowId);
		currentColumn.orderBy('order');
		currentColumn.query();
		while (currentColumn.next()) {
			var oldColumnId = currentColumn.getUniqueValue();
			var newColumn = new GlideRecord('sp_column');
			newColumn.initialize();
			newColumn = currentColumn;
			newColumn.sp_row = newRowId;
			var newColumnId = newColumn.insert();
			cloneNestedRows(oldColumnId, newColumnId);
			cloneWidgetInstances(oldColumnId, newColumnId);
		}
	}

	function cloneNestedRows(oldColumnId, newColumnId) {
		if (newColumnId == '')
			return;

		var currentNestedRow = new GlideRecord('sp_row');
		currentNestedRow.addQuery('sp_column', oldColumnId);
		currentNestedRow.orderBy('order');
		currentNestedRow.query();
		while (currentNestedRow.next()) {
			var currentNestedRowId = currentNestedRow.getUniqueValue();
			var newNestedRow = new GlideRecord('sp_row');
			newNestedRow.initialize();
			newNestedRow = currentNestedRow;
			newNestedRow.sp_column = newColumnId;
			var newNestedRowId = newNestedRow.insert();
			if (newNestedRowId != '') {
				var currentNestedColumn = new GlideRecord('sp_column');
				currentNestedColumn.addQuery('sp_row', currentNestedRowId);
				currentNestedColumn.orderBy('order');
				currentNestedColumn.query();
				while (currentNestedColumn.next()) {
					var oldNestedColumnId = currentNestedColumn.getUniqueValue();
					var newNestedColumn = new GlideRecord('sp_column');
					newNestedColumn.initialize();
					newNestedColumn = currentNestedColumn;
					newNestedColumn.sp_row = newNestedRowId;
					var newNestedColumnId = newNestedColumn.insert();
					cloneWidgetInstances(oldNestedColumnId, newNestedColumnId);
				}
			}
		}
	}

	function cloneWidgetInstances(oldColumnId, newColumnId) {
		var inst = new GlideRecord('sp_instance');
		inst.addQuery('sp_column', oldColumnId);
		inst.orderBy('order');
		inst.query();
		while (inst.next()) {
			var actualInst = inst;
			var instId = inst.getUniqueValue();
			// Widget instance could be extension from sp_instance ;)
			var instanceTable = inst.getRecordClassName();
			if (instanceTable != 'sp_instance') {
				actualInst = new GlideRecord(instanceTable);
				actualInst.get(instId);
			}
			var newWidget = actualInst;
			newWidget.sp_column = newColumnId;
			var newWidgetId = newWidget.insert();
			// If it was an instance of carousel, copy the images
			if (instanceTable == "sp_instance_carousel") {
				var currentCarouselImage = new GlideRecord('sp_carousel_slide');
				currentCarouselImage.addQuery('carousel', instId);
				currentCarouselImage.orderBy('order');
				currentCarouselImage.query();
				while (currentCarouselImage.next()) {
					var oldCarouselImageId = currentCarouselImage.getUniqueValue();
					var newCarouselImage = new GlideRecord('sp_carousel_slide');
					newCarouselImage.initialize();
					newCarouselImage = currentCarouselImage;
					newCarouselImage.carousel = newWidgetId;
					var newCarouselImageId = newCarouselImage.insert();
					duplicateBgImage('ZZ_YYsp_carousel_slide', oldCarouselImageId, newCarouselImageId);
				}
			}
		}
	}

	function duplicateBgImage(tableName, sysId, newSysId) {
		var attachment = new GlideRecord('sys_attachment');
		attachment.addQuery('table_name', tableName);
		attachment.addQuery('table_sys_id', sysId);
		attachment.query();
		if (attachment.next())
			GlideSysAttachment.copy(tableName, sysId, tableName, newSysId);
	}

	//Get the next number to use for the title/id page
	function getCopyNumber(spPageId) {
		var page = new GlideAggregate('sp_page');
		page.addAggregate('COUNT');
		page.addQuery('id', 'STARTSWITH', 'copy_of_' + spPageId);
		page.addQuery('id', '!=', spPageId);
		page.query();
		page.next();
		var num = parseInt(page.getAggregate('COUNT'));
		return num + 1;
	}



	SPClonePage.prototype = {

		initialize: function() {
		},

		// Main function that clones the SP page
		run: function(pageGr) {
			var oldPage = pageGr;
			var oldPageId = oldPage.getUniqueValue();
			var oldPageTitle = oldPage.getValue('title');
			var copyNumber = getCopyNumber(oldPage.getValue('id'));
			var newPageGr = null;

			// Clone the Page
			var newPage = new GlideRecord('sp_page');
			newPage.initialize();
			newPage = oldPage;
			newPage.title = "Copy of " + oldPageTitle + " (" + copyNumber + ")";
			newPage.id = "copy_of_" +  oldPage.getValue('id') + "_" + copyNumber;
			var newPageId = newPage.insert();
			if (newPageId != '') {
				newPageGr = newPage;
				cloneContainers(oldPageId, newPageId);
			}

			return newPageGr;
		},

		type: 'SPClonePage'

	};
}());