var DBKeyStore = Class.create();

DBKeyStore.prototype = {
  initialize : function() {
    this.fDbKeyStoreFactory = new GlideDBKeyStoreFactory();
    this.fStore;
  },

  loadBySysId : function (sys_id) {
    var cgr = new GlideRecord("sys_certificate");
    cgr.addQuery("sys_id", sys_id);
    cgr.query();
    if(cgr.next()) {
      return this.loadRecord(cgr);
    }

    return false;
  },

  loadByName : function (entryName) {
    var cgr = new GlideRecord("sys_certificate");
    cgr.addQuery("name", entryName);
    cgr.query();
    if(cgr.next()) {
      return this.loadRecord(cgr);
    }

    return false;
  },

  /**
   * To convert pfx files into pkcs12 keystores, follow the following steps:
   *
   * Assuming that you have a pfx (Personal Info Exchange) file that contains 
   * your CA-signed or self-signed certificate and your private key,
   *
   * [One way of getting the pfx file could be by exporting the certificate 
   * from the Microsoft Windows Certificate Mangaement console)
   *
   * 1. (If you already have a pkcs12 pem file, skip #1)
   *    openssl pkcs12 -in mypfxfile.pfx -out mypemfile.pem
   *
   * 2.
   *    openssl pkcs12 -export -in mypemfile.pem -out mykeystore.p12 -name "My Certificate"
   *
   * 3. (To verify that the keystore exists)
   * keytool -v -list -keystore mykeystore.p12 -storetype pkcs12 
   *
   */
  loadRecord : function (glideRecord) {
    var type = "JKS";
    if (glideRecord.type == "pkcs12_key_store") {
      type = "PKCS12";
    }

    this.fStore = Packages.java.security.KeyStore.getInstance(type);
    this.fDbKeyStoreFactory.loadKeyStore(this.fStore, glideRecord);

    return true;
  },

  getKey : function (alias, keyPass) {
    var keyPassword = new Packages.java.lang.String(keyPass);
    return this.fStore.getKey(alias, keyPassword.toCharArray());
  },

  getKeyPEM : function (alias, keyPass) {
    var key = this.getKey(alias, keyPass);
    if (key == null)
      return "";

    var b64 = new Packages.sun.misc.BASE64Encoder().encode(key.getEncoded());
    var str = "-----BEGIN PRIVATE KEY-----\n";
    str += b64 + "\n";
    str += "-----END PRIVATE KEY-----\n";
    return str;
  },

  /*
   * Method to check if the current loaded keystore contains an alias
   * @param alias (string) - the alias to check in the keystore 
   * @returns true if the keystore contains the alias, false if not or if no keystore is currently loaded
   */
  containsAlias : function(alias)  {
  	  if (!this.fStore)
  	  	return false;
  	  	
	  return this.fStore.containsAlias(alias);
  },

  listAliases : function () {
    if (this.fStore == null) {
      return;
    }

    var en = this.fStore.aliases();
    while (en.hasMoreElements()) {
      var alias = en.nextElement();

      // Does alias refer to a private key?
      if(this.fStore.isKeyEntry(alias)) {
        gs.log(alias + " (key)");
      }

      // Does alias refer to a trusted certificate?
      if(this.fStore.isCertificateEntry(alias)) {
        gs.log(alias + " (certificate)");
      }
    }
  }
}