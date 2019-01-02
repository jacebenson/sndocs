var GlideappCatalogURLGenerator = Class.create();


GlideappCatalogURLGenerator.getCatalogIDNoDefault = function(gjcObject, parentID) {
	return SNC.CatalogURLGenerator.getCatalogIDNoDefault(gjcObject, parentID);
}
GlideappCatalogURLGenerator.getCatalogTitle = function(gjcObject, parentID) {
	return SNC.CatalogURLGenerator.getCatalogTitle(gjcObject, parentID);
}
GlideappCatalogURLGenerator.getHomepageCatalogLink = function(catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getHomepageCatalogLink(catalogID, catalogView);
}
GlideappCatalogURLGenerator.getHomepageCategoryLink = function(catalogID, catalogView, categoryID) {
	return SNC.CatalogURLGenerator.getHomepageCategoryLink(catalogID, catalogView, categoryID);
}
GlideappCatalogURLGenerator.getHomepageCategoryLinkWithHint = function(catalogID, catalogView, categoryID, hint) {
	return SNC.CatalogURLGenerator.getHomepageCategoryLinkWithHint(catalogID, catalogView, categoryID, hint);
}
GlideappCatalogURLGenerator.getCategoryLink = function(catalogID, catalogView, view, categoryID, noCheckout, hint) {
	return SNC.CatalogURLGenerator.getCategoryLink(catalogID, catalogView, view, categoryID, noCheckout, hint);
}
GlideappCatalogURLGenerator.getBreadcrumbHome = function(isCMS, catalogID, catalogView, parentID, gjcObject) {
	return SNC.CatalogURLGenerator.getBreadcrumbHome(isCMS, catalogID, catalogView, parentID, gjcObject);
}
GlideappCatalogURLGenerator.getEditCartUrl = function(catalogID, catalogView, hint, linkParent) {
	return SNC.CatalogURLGenerator.getEditCartUrl(catalogID, catalogView, hint, linkParent);
}
GlideappCatalogURLGenerator.getCheckoutAction = function(catalogID, catalogView, sessionToken) {
	return SNC.CatalogURLGenerator.getCheckoutAction(catalogID, catalogView, sessionToken);
}	
GlideappCatalogURLGenerator.getRedirectHome = function(catalogID, catalogView, parentID) {
	return SNC.CatalogURLGenerator.getRedirectHome(catalogID, catalogView, parentID);
}
GlideappCatalogURLGenerator.getRedirect = function(page, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getRedirect(page, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getRedirectOneStageCheckout = function(catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getRedirectOneStageCheckout(catalogID, catalogView);
}
GlideappCatalogURLGenerator.getGuideHiddenTabURL = function(guideID, active, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getGuideHiddenTabURL(guideID, active, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getHomeURL = function(catalogID, catalogView, parentID) {
	return SNC.CatalogURLGenerator.getHomeURL(catalogID, catalogView, parentID);
}
GlideappCatalogURLGenerator.getHomeAction = function(catalogID, catalogView, parentID) {
	return SNC.CatalogURLGenerator.getHomeAction(catalogID, catalogView, parentID);
}
GlideappCatalogURLGenerator.getSearchPage = function(catalogID, catalogView, categoryID) {
	return SNC.CatalogURLGenerator.getSearchPage(catalogID, catalogView, categoryID);
}
GlideappCatalogURLGenerator.getSearchURL = function(term, token, parent, hint, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getSearchURL(term, token, parent, hint, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getSearchChangeCountURL = function(term, categoryID, hint, catalogID, catalogView, currentRow) {
	return SNC.CatalogURLGenerator.getSearchChangeCountURL(term, categoryID, hint, catalogID, catalogView, currentRow);
}
GlideappCatalogURLGenerator.getSearchURLNoCatalog = function(term, token, gjcObject) {
	return SNC.CatalogURLGenerator.getSearchURLNoCatalog(term, token, gjcObject);
}
GlideappCatalogURLGenerator.getBrowsingURL = function(categoryID, hint, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getBrowsingURL(categoryID, hint, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getBrowsingChangeCountURL = function(categoryID, hint, catalogID, catalogView, currentRow) {
	return SNC.CatalogURLGenerator.getBrowsingChangeCountURL(categoryID, hint, catalogID, catalogView, currentRow);
}
GlideappCatalogURLGenerator.getItemBaseURLFromGR = function(itemGRObject) {
	return SNC.CatalogURLGenerator.getItemBaseURLFromGR(itemGRObject);
}
GlideappCatalogURLGenerator.getItemBaseURL = function(itemObject) {
	return SNC.CatalogURLGenerator.getItemBaseURL(itemObject);
}
GlideappCatalogURLGenerator.getItemURL = function(itemObject, catalogID, catalogView, categoryID, hint, RPObject) {
	return SNC.CatalogURLGenerator.getItemURL(itemObject, catalogID, catalogView, categoryID, hint, RPObject);
}
GlideappCatalogURLGenerator.getItemEditURL = function(itemID, cartItemID) {
	return SNC.CatalogURLGenerator.getItemEditURL(itemID, cartItemID);
}
GlideappCatalogURLGenerator.getFullItemEditURL = function(itemID, catalogID, catalogView, cartItemID, view, hint) {
	return SNC.CatalogURLGenerator.getFullItemEditURL(itemID, catalogID, catalogView, cartItemID, view, hint);
}
GlideappCatalogURLGenerator.getProcessingHintValue = function(gjcObject) {
	return SNC.CatalogURLGenerator.getProcessingHintValue(gjcObject);
}
GlideappCatalogURLGenerator.getBrowsingContextCategoryID = function() {
	return SNC.CatalogURLGenerator.getBrowsingContextCategoryID();
}
GlideappCatalogURLGenerator.getBrowsingContextTargetKey = function() {
	return SNC.CatalogURLGenerator.getBrowsingContextTargetKey();
}
GlideappCatalogURLGenerator.getBrowsingContextTarget = function() {
	return SNC.CatalogURLGenerator.getBrowsingContextTarget();
}
GlideappCatalogURLGenerator.getBrowsingContextCategorySysID = function() {
	return SNC.CatalogURLGenerator.getBrowsingContextCategorySysID();
}	
GlideappCatalogURLGenerator.getContinueShoppingUrl = function(catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getContinueShoppingUrl(catalogID, catalogView);
}
GlideappCatalogURLGenerator.getContinueShoppingAction = function(catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getContinueShoppingAction(catalogID, catalogView);
}
GlideappCatalogURLGenerator.getBreadcrumbURLPrefix = function(isCMS, gjcObject) {
	return SNC.CatalogURLGenerator.getBreadcrumbURLPrefix(isCMS, gjcObject);
}
GlideappCatalogURLGenerator.getCatalogsHome = function() {
	return SNC.CatalogURLGenerator.getCatalogsHome();
}
GlideappCatalogURLGenerator.getNewRequestURL = function() {
	return SNC.CatalogURLGenerator.getNewRequestURL();
}
GlideappCatalogURLGenerator.getCheckoutURL = function(sysID, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getCheckoutURL(sysID, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getNavRedirectURL = function() {
	return SNC.CatalogURLGenerator.getNavRedirectURL();
}	
GlideappCatalogURLGenerator.getRequestPage = function(sysID, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getRequestPage(sysID, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getRequestPageAction = function(sysID, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getRequestPageAction(sysID, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getRequestListAction = function(requestIds, column) {
	return SNC.CatalogURLGenerator.getRequestListAction(requestIds, column);
}
GlideappCatalogURLGenerator.getRequestItemPage = function(sysID, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getRequestItemPage(sysID, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getCheckoutURLForPage = function(page, sysID, view, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getCheckoutURLForPage(page, sysID, view, catalogID, catalogView);
}
GlideappCatalogURLGenerator.escapeForNavTo = function(url) {
	return SNC.CatalogURLGenerator.escapeForNavTo(url);
}
GlideappCatalogURLGenerator.getCloneStatusURL = function(progressID, requestID, sysID, catalogID, catalogView) {
	return SNC.CatalogURLGenerator.getCloneStatusURL(progressID, requestID, sysID, catalogID, catalogView);
}
GlideappCatalogURLGenerator.getCancelRequestURL = function(catalogID, catalogView, sysID, sessionToken) {
	return SNC.CatalogURLGenerator.getCancelRequestURL(catalogID, catalogView, sysID, sessionToken);
}
	GlideappCatalogURLGenerator.getCancelRequestAction = function(catalogID, catalogView, sysID, sessionToken) {
	return SNC.CatalogURLGenerator.getCancelRequestAction(catalogID, catalogView, sysID, sessionToken);
}
GlideappCatalogURLGenerator.getRestartGuideURL = function(catalogID, catalogView, sessionToken) {
	return SNC.CatalogURLGenerator.getRestartGuideURL(catalogID, catalogView, sessionToken);
}
GlideappCatalogURLGenerator.getCartRemoveURL = function(catalogID, catalogView, cartItemID, sessionToken) {
	return SNC.CatalogURLGenerator.getCartRemoveURL(catalogID, catalogView, cartItemID, sessionToken);
}
GlideappCatalogURLGenerator.getCatalogFindURL = function(catalogID, catalogView, categoryID, sessionToken, hint) {
	return SNC.CatalogURLGenerator.getCatalogFindURL(catalogID, catalogView, categoryID, sessionToken, hint);
}
GlideappCatalogURLGenerator.getCatalogViewForHome = function(catalog, catalogView, view) {
	return SNC.CatalogURLGenerator.getCatalogViewForHome(catalog, catalogView, view);
}
GlideappCatalogURLGenerator.getCatalogForHome = function(catalog, catalogView, view) {
	return SNC.CatalogURLGenerator.getCatalogForHome(catalog, catalogView, view);
}