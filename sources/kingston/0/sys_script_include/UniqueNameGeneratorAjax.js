var UniqueNameGeneratorAjax = Class.create();

UniqueNameGeneratorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
	getUIPagePrefixAjax: function() {
    	var application = this.getParameter('sysparm_application');
        var applicationGR = new GlideRecord('sys_package');
        applicationGR.get(application);
        var scope = applicationGR.scope;
        var endpointPrefix = '';
         
        if (scope != '' && scope != undefined) {
        	endpointPrefix = scope;
        }
         
        var result = this.newItem('result');
        result.setAttribute('endpointPrefix', endpointPrefix);
     },
    
     getTablePrefixAjax: function() {
         
          var application = this.getParameter('sysparm_application');
          var applicationGR = new GlideRecord('sys_package');
          applicationGR.get(application);
          var scope = applicationGR.scope;
          var endpointPrefix = '';
         
          if (scope != '' && scope != undefined) {
               endpointPrefix = scope;
          } else if (!gs.hasRole("maint")) {
               endpointPrefix = "u";
          }

          var result = this.newItem('result');
        result.setAttribute('endpointPrefix', endpointPrefix);
     },
    
     getFieldPrefixAjax: function() {
         
          var tableID = this.getParameter('sysparm_tableName');
         
          var tableGR = new GlideRecord('sys_db_object');
          tableGR.get(tableID);
         
          var scope = tableGR.sys_package.scope;
         
          //var applicationGR = GlideRecord('sys_package');
          //applicationGR.get(application);
          //var scope = applicationGR.scope;
          var endpointPrefix = '';
         
          if (scope != '' && scope != undefined) {
               //var prefix = 'x';
               //var vendorID = GlideProperties.get("glide.appstore.company.prefix");
               endpointPrefix = scope;
          } else if (!gs.hasRole("maint")) {
               endpointPrefix = "u";
          }

          var result = this.newItem('result');
        result.setAttribute('endpointPrefix', endpointPrefix);
     },
    
    type: 'UniqueNameGeneratorAjax'
});