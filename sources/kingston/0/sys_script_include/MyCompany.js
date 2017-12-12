var MyCompany = Class.create();

MyCompany.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      var item = this.newItem();
      item.setAttribute("banner_text", this.getBannerText());
      item.setAttribute("banner_image", this.getBannerSrc());
  },

  getBannerText: function() {
     return this.getReference("banner_text", "glide.product.description");
  },

  getBannerSrc: function() {
	 var useConcourse = gs.getPreference("use.concourse", "false");
     if (useConcourse == "false")
       return this.getReference("banner_image", "glide.product.image");
	 else
	   return this.getReference("banner_image_light", "glide.product.image.light");
  },

  getReference: function(fieldName, fallbackProperty) {
      var company = user.getCompanyRecord();
      var s = this.recurseFind(company, fieldName, 0);

      if (s)
          return s;

      company = this.getPrimaryCompany();
      if (company) {
          var field = company.getElement(fieldName);
          var s = new String(field.getDisplayValue());
	  if (s.length > 0)
	      return s;
      }

      return gs.getProperty(fallbackProperty);
  },

  getPrimaryCompany: function() {
      var gr = new GlideRecord("core_company");
      gr.addQuery("primary", "true");
      gr.query();

      if (gr.next())
          return gr;

      return null;
  },

  recurseFind: function(company, fieldName, depth) {
      if (!company || company.toString().length == 0)
         return null;

      var field = company.getElement(fieldName);
      var temp = new String(field.getDisplayValue(0));

      if (temp.length > 0)
          return temp;

      if (company.parent.isNil())
          return null;

      var id = company.parent.toString();
      company = new GlideRecord('core_company');
      company.get(id);
      depth++;

      if (depth > 10) {
          gs.print("Possible recursive company loop with user " + user.name);
          return null;
      }

      return this.recurseFind(company, fieldName, depth);
  },

  type: "MyCompany"
});