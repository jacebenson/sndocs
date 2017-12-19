var newProductDescription = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_product_description"));
var newBannerColor = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_banner_color"));
var newBannerImage = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_banner_image"));
var newProductName = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_product_name"));
var newTimeZone = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_time_zone"));
var newDateFormat = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_date_format"));
var newTimeFormat = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_time_format"));
var newBannerTextColor = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_banner_text_color"));


if (typeof newProductDescription != "undefined" && gs.getProperty("glide.product.description") != newProductDescription ) 
    gs.setProperty("glide.product.description", newProductDescription);
    
if (typeof newBannerColor != "undefined" && gs.getProperty("css.base.color") != newBannerColor) 
    gs.setProperty("css.base.color", newBannerColor);
   
if (typeof newBannerImage != "undefined" && gs.getProperty("glide.product.image") != newBannerImage) 
    gs.setProperty("glide.product.image", newBannerImage);
    
if (typeof newProductName != "undefined" && gs.getProperty("glide.product.name") != newProductName) 
    gs.setProperty("glide.product.name", newProductName);
    
if (typeof newTimeZone != "undefined" && gs.getProperty("glide.sys.default.tz") != newTimeZone) 
    gs.setProperty("glide.sys.default.tz", newTimeZone);
    
if (typeof newDateFormat != "undefined" && gs.getProperty("glide.sys.date_format") != newDateFormat) 
    gs.setProperty("glide.sys.date_format", newDateFormat);
    
if (typeof newTimeFormat != "undefined" && gs.getProperty("glide.sys.time_format") != newTimeFormat) 
    gs.setProperty("glide.sys.time_format", newTimeFormat);
    
if (typeof newBannerTextColor != "undefined" && gs.getProperty("css.banner.description.color") != newBannerTextColor) 
    gs.setProperty("css.banner.description.color", newBannerTextColor);

g_response.sendRedirect("$system_properties_ui.do");

