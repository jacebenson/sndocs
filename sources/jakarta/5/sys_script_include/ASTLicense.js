/**
 * License related calculations.
 * 
 * Aleck Lin aleck.lin@service-now.com
 */

var ASTLicense = Class.create();

ASTLicense.prototype = {
  initialize: function() {
      this.installCount = 0;
      this.licenseCache = {};
  },

  calcInstallCount: function() {
      this.calcDiscoverableInstallCount();
      this.calcNonDiscoverableInstallCount();
  },

  calcDiscoverableInstallCount: function() {
      var gr = new GlideRecord("ast_license_base");
      gr.addQuery("manual", "false");
      gr.addQuery("discoverable_key", "true");
      gr.query();
      while (gr.next()) 
          this.calcInstalledCountByInstalledOn(gr);
  },

  calcInstalledCountByInstalledOn: function(licenseGr) {
    var ga = new GlideAggregate("ast_license_software_instance");
    ga.addQuery("ast_license", licenseGr.sys_id);
    ga.addAggregate('COUNT');
    ga.query();
    var count = 0;
    if (ga.next())
        count = ga.getAggregate('COUNT');

    var gr = new GlideRecord("ast_license_base");
    if (!gr.get(licenseGr.sys_id))
        return;

    gr.install_count = count;
    gr.update();
  },

  calcNonDiscoverableInstallCount: function() {
      var gr = new GlideRecord("ast_license_base");
      gr.addQuery("manual", "false");
      gr.addQuery("discoverable_key", "false");
      gr.query();
      while (gr.next()) 
          this._calcInstallCount(gr);
  },

  _calcInstallCount: function(gr) {
      if (this.licenseCache[gr.sys_id])
          return;

      var licenseArr = this.findAllLicenses([gr.sys_id]);

      var count = 0;
      var gr = new GlideRecord("ast_license_base");
      gr.addQuery("sys_id", licenseArr);
      gr.orderBy("sys_created_on");
      gr.query();
      while (gr.next()) {
          this.licenseCache[gr.sys_id] = true;
          count++;
         
          // If this is the last license, then give it all the rest of the install_count
          if (count == licenseArr.length) {
              gr.install_count = this.installCount;
              this.installCount = 0;
          } else {
              if (this.installCount >= gr.license_count)
                  gr.install_count = gr.license_count;
              else
                  gr.install_count = this.installCount;

              this.installCount -= gr.install_count;
          }
          gr.update();
      }
  },

  findAllLicenses: function(licenseArr) {
      var spkgArr = this.getSoftwarePackages(licenseArr);      
      var spkg = new SoftwarePackage();
      var licenseArr2 = spkg.getASTLicenses(spkgArr);   

      if (licenseArr2.length == licenseArr.length)
          return licenseArr2;
      else
          return this.findAllLicenses(licenseArr2);
  },

  /*
   *  Get an array list of software packages based on licenses.
   */ 
  getSoftwarePackages: function(list) {
      this.installCount = 0;
      var spkgs = [];
      var cache = {};
      var gr = new GlideRecord('ast_license_package_instance');
      gr.addQuery("ast_license", list);
      gr.query();
      while (gr.next()) {
          var pkgSysId = gr.ci_item.sys_id;
          if (cache[pkgSysId])
              continue;
          cache[pkgSysId] = true;

          spkgs.push(pkgSysId);
          this.installCount += gr.ci_item.install_count;
      }

      return spkgs;
  },

  calcManualManagedInstallCount: function(licenseGr) {
    if (licenseGr.manual == false)
        return;

    this.calcInstalledCountByInstalledOn(licenseGr);
  },

}