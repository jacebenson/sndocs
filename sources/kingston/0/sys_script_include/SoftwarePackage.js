/**
 * Software package related calculations.
 * 
 * Aleck Lin aleck.lin@service-now.com
 */

var SoftwarePackage = Class.create();

SoftwarePackage.prototype = {
  initialize : function() {
      this.spkgCache = {};
      this.licenseCount = 0;
  },

  /*
   * Calculates the total install count of each software package (cmdb_ci_spkg).
   */
  calcInstallCount: function() {
      var gr = new GlideRecord('cmdb_ci_spkg');
      gr.query();
      while (gr.next())
          this._calcInstallCount(gr);
  },

  _calcInstallCount: function(gr) {
      var ga = new GlideAggregate('cmdb_software_instance');
      ga.addQuery('software', gr.sys_id);
      ga.addAggregate('COUNT');
      ga.query();
      var count = 0;
      if (ga.next()) 
          count = ga.getAggregate('COUNT');
        
      if (gr.install_count == count) 
         return;

      gr.install_count = count;
      gr.update();   
  },

  calcLicenseCount: function() {
      var gr = new GlideRecord('cmdb_ci_spkg');
      gr.query();
      while (gr.next())
          this._calcLicenseCount(gr);
  },

  _calcLicenseCount: function(gr) {
      if (this.spkgCache[gr.sys_id])
          return;

      var spkgArr = this.findAllSpkgs([gr.sys_id]);

      var count = 0;
      var gr = new GlideRecord("cmdb_ci_spkg");
      gr.addQuery("sys_id", spkgArr);
      gr.orderBy("sys_created_on");
      gr.query();
      while (gr.next()) {
          this.spkgCache[gr.sys_id] = true;
          count++;
          
          // If this is the last spkg, then give it all the rest of the license_count
          if (count == spkgArr.length) {
              gr.license_count = this.licenseCount;
              this.licenseCount = 0;
          } else {
              if (this.licenseCount >= gr.install_count)
                  gr.license_count = gr.install_count;
              else
                  gr.license_count = this.licenseCount;

              this.licenseCount -= gr.license_count;
          }
          gr.update();
      }
  },

  
  findAllSpkgs: function(spkgArr) {
      var licenseArr = this.getASTLicenses(spkgArr);      
      var license = new ASTLicense();
      var spkgArr2 = license.getSoftwarePackages(licenseArr);   

      if (spkgArr2.length == spkgArr.length)
          return spkgArr2;
      else
          return this.findAllSpkgs(spkgArr2);
  },


  /*
   *  Get an array list of licenses based on software packages.
   */ 
  getASTLicenses: function(list) {
      this.licenseCount = 0;
      var licenses = [];
      var cache = {};
      var gr = new GlideRecord('ast_license_package_instance');
      gr.addQuery("ci_item", list);
      gr.query();
      while (gr.next()) {
          var licenseSysId = gr.ast_license.sys_id;
          if (cache[licenseSysId])
              continue;
          cache[licenseSysId] = true;

          licenses.push(licenseSysId);
          this.licenseCount += gr.ast_license.license_count;
      }
          
      return licenses;
  }

}