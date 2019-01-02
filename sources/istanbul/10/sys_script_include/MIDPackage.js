var MIDPackage = Class.create();

MIDPackage.BUILDSTAMP_REGEX = /(\d{2})-(\d{2})-(\d{4})_(\d{4})$/;

MIDPackage._DOT = '.';
MIDPackage._FILENAME_SUFFIX = '.zip';
MIDPackage._DASH = '-';
MIDPackage._UNDERSCORE = '_';
MIDPackage._EMPTY_STRING = '';

/**
 * Converts a 'modern' buildstamp (YYYY-MM-DD-hhmm) to the legacy format (MM-DD-YYYY_hhmm).
 * @param string modernBuildstamp
 * @return string
 * @throws IllegalArgumentException If the specified modern buildstamp is invalid.
 */
MIDPackage.createLegacyBuildstamp = function(modernBuildstamp) {
    var matches = MIDPackage.BUILDSTAMP_REGEX.exec(modernBuildstamp);
    if (matches === null)
        throw new IllegalArgumentException('Invalid modern buildstamp `' + modernBuildstamp + '`.');
    
    var legacyBuildstamp = MIDPackage._EMPTY_STRING + matches[1]
    + MIDPackage._DASH + matches[2]
    + MIDPackage._DASH + matches[3]
    + MIDPackage._UNDERSCORE + matches[4];
    return legacyBuildstamp;
};

MIDPackage.prototype = {
  initialize: function(name, buildstamp, operatingSystem, architecture) {
    this._name = name;
    this._buildstamp = buildstamp;
    this._operatingSystem = operatingSystem;
    this._architecture = architecture;
  },

  getName: function() {
    return this._name;
  },

  getBuildStamp: function() {
    return this._buildstamp;
  },

  getOperatingSystem: function() {
    return this._operatingSystem;
  },

  getOperatingSystemName: function() {
    switch(this._operatingSystem) {
      case 'windows':
        return 'Windows';
      case 'linux':
        return 'Linux';
      case 'osx':
        return 'OSX';
    }

    return this._operatingSystem;
  },

  getArchitecture: function() {
    return this._architecture;
  },

  getArchitectureName: function() {
    return this._architecture;
  },

  getFilename: function() {
    var filename = this._name;
    if (JSUtil.notNil(this._buildstamp)) // handle headless build filenames
        filename += MIDPackage._DOT + this._buildstamp;
      
    filename += MIDPackage._DOT + this._operatingSystem
    + MIDPackage._DOT + this._architecture
    + MIDPackage._FILENAME_SUFFIX;
    return filename;
  },

  // Gets pre-geneva file name for backward compatibility, converting the buildstamp
  // from 'branchname_MM-DD-YYYY_hhmm' to 'YYYY-MM-DD-hhmm'
  getLegacyFilename: function() {
    var matches = MIDPackage.BUILDSTAMP_REGEX.exec(this._buildstamp);
    gs.log(matches, 'matches');
    if (matches === null)
        throw new IllegalArgumentException('Invalid buildstamp `' + this._buildstamp + '`.');
    
    var legacyBuildstamp = matches[3]
      + MIDPackage._DASH + matches[1]
      + MIDPackage._DASH + matches[2]
      + MIDPackage._DASH + matches[4];
    var filename = this._name
      + MIDPackage._DOT + legacyBuildstamp
      + MIDPackage._DOT + this._operatingSystem
      + MIDPackage._DOT + this._architecture
      + MIDPackage._FILENAME_SUFFIX;
    return filename;
  },

  type: 'MIDPackage'
}