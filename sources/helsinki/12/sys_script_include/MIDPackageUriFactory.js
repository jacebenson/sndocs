var MIDPackageUriFactory = Class.create();

MIDPackageUriFactory._BASE_HTTPS_URI = 'https://install.service-now.com/glide/distribution/builds/package';
MIDPackageUriFactory._BASE_HTTP_URI = 'http://install.service-now.com/glide/distribution/builds/package';
MIDPackageUriFactory._LATEST_DIR = 'latest';
MIDPackageUriFactory._SEPARATOR = '/';

MIDPackageUriFactory.prototype = {
  /**
   * @param midPackage Optional.
   */
  initialize: function(midPackage) {
    if (!gs.nil(midPackage))
      this.setPackage(midPackage);
  },

  /**
   * Sets the package that this factory will provide URIs for.
   * Required.
   * @param MIDPackage midPackage
   */
  setPackage: function(midPackage) {
    this._midPackage = midPackage;
  },

  /**
   * Retrieves a list of URIs that a package can be downloaded from by order of preference.
   * Requires that the package has been set.
   */
  getUris: function(maxUris) {
    this._validate();
    var uris = [];
	// https
    var uri = MIDPackageUriFactory._BASE_HTTPS_URI
    + MIDPackageUriFactory._SEPARATOR + this._getDirectoryPath(this._midPackage)
    + MIDPackageUriFactory._SEPARATOR + this._midPackage.getFilename();
    uris.push(uri);
	  
	// http
    uri = MIDPackageUriFactory._BASE_HTTP_URI
    + MIDPackageUriFactory._SEPARATOR + this._getDirectoryPath(this._midPackage)
    + MIDPackageUriFactory._SEPARATOR + this._midPackage.getFilename();
    uris.push(uri);
	  
    return uris;
  },

  /**
   * @param MIDPackage distPackage
   */
  _getDirectoryPath: function(midPackage) {
    var buildstamp = midPackage.getBuildStamp();
    if (JSUtil.nil(buildstamp))
        return midPackage.getName() + MIDPackageUriFactory._SEPARATOR + MIDPackageUriFactory._LATEST_DIR;
    
    var matches = MIDPackage.BUILDSTAMP_REGEX.exec(buildstamp);
    if (matches === null)
      throw new IllegalArgumentException('Invalid buildstamp `' + buildstamp + '`.');

    var path = midPackage.getName()
    + MIDPackageUriFactory._SEPARATOR + matches[3]
    + MIDPackageUriFactory._SEPARATOR + matches[1]
    + MIDPackageUriFactory._SEPARATOR + matches[2];
    return path;
  },

  /**
   * @throws IllegalArgumentException If not factory state is not valid
   */
  _validate: function() {
    if (this._midPackage === null)
      throw new IllegalArgumentException('Package is required.');
  },

  type: 'MIDPackageUriFactory'
};