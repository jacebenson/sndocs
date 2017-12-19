/**
 * Install counts / License count management of the following three tables
 *  - cmdb_ci_spkg
 *  - ast_license_base
 *  - ast_software_license
 * 
 * Originally written by Pat Casey, but has been heavily modified by Aleck Lin aleck.lin@service-now.com
 */

var SoftwareLicenseManager = Class.create();

SoftwareLicenseManager.prototype = {
  initialize : function() {
  },

  countAll : function() {
      this.refreshSWInstallCount();
      this.refreshASTInstallCount();
      this.refreshSWLicenseCount();
      this.refreshLicenseTableInstallCount();
  },

  /*
   * Calculates the install count field of each software package (cmdb_ci_spkg).
   */
  refreshSWInstallCount: function() {
      new SoftwarePackage().calcInstallCount();
  },

  /*
   * Calculates the install count field of AST licenses.
   */
  refreshASTInstallCount: function() {
      new ASTLicense().calcInstallCount();  
  },

  /*
   * Calculates the license count field of software packages
   */
  refreshSWLicenseCount: function() {
      new SoftwarePackage().calcLicenseCount();
  },

  /*
   * Calculates the total install count and license count of the license bundle (ast_software_license)
   * The scenario is that a license bundle may contain multiple licenses (such as adobe 3.0, adobe 4.0 and adobe 5.0)
   */
  refreshLicenseTableInstallCount: function() {
      var gr = new GlideRecord("ast_software_license");
      gr.query();
      while(gr.next())
          this._refreshLicenseTableInstallCount(gr);
  },

  _refreshLicenseTableInstallCount: function(gr) {
      var purchasedCnt = 0;
      var installedCnt = 0;

      var astGr = new GlideRecord('ast_license_base');
      astGr.addQuery('parent', gr.sys_id);
      astGr.query();

      while(astGr.next()) {
          purchasedCnt += astGr.license_count;
          installedCnt += astGr.install_count;
      }

      gr.license_count = purchasedCnt;
      gr.install_count = installedCnt;
      gr.update();
  },

}