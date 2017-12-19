/**
 * Provides generic socket address utilities and parsers.
 * @var string address
 * @var integer port
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var SocketAddress = Class.create();

SocketAddress.FORMAT_COLON = 1; // <hostname>:<port>
SocketAddress.FORMAT_JDBC_DSN = 2; // jdbc:<dbtype>://<hostname>:<port>/...

SocketAddress.prototype = {
  /**
   * Constructor.
   * @param string address The IP address, hostname alias, or FQDN
   * @param string port
   */
  initialize: function(address, port) {
    this.address = address.toString();
    this.port = port.toString();
  },

  /**
   * Determines whether the address and port are valid values or not.
   * @return boolean true if valid, false if not.
   */
   isValid: function() {
     return ( !gs.nil(this.address) && !gs.nil(port) && port > 0 );
   },

  /**
   * Determines whether the address is local or not.
   * @return boolean true if local, false if not.
   */
   isLocal: function() {
     return ( this.address == 'localhost' || this.address == '127.0.0.1' );
   },

  /**
   * Determines whether this address is in the specified array of socket addresses or not.
   * @param array of SocketAddress to match against.
   * @return boolean true if found, false if not.
   */
  inArray: function(addresses) {
    for (var i = 0; i < addresses.length; ++i) {
      if (addresses[i].address == this.address && addresses[i].port == this.port)
        return true;
    }

    return false;
  },

  /**
   * Outputs in the format: <address>:<port>.
   */
  toString: function() {
    return this.address + ':' + this.port;
  }
}

/**
 * Parses various strings into a SocketAddress.
 * @param integer formatType The SocketAddress.FORMAT_ type to use.
 * @param string str The string to parse
 * @return SocketAddress|null SocketAddress on success, null on failure.
 */
SocketAddress.parse = function(formatType, str) {
  switch(formatType) {
    case this.FORMAT_COLON:
      var matches = str.match(/^([0-9\w\.\-]+):(\d+)$/);
      if (matches)
        return new SocketAddress(matches[1], matches[2]);
      break;

    case this.FORMAT_JDBC_DSN:
      var matches = str.match(/^jdbc:mysql\:\/\/([0-9\.\w\-]+)(?::(\d+))?/); // mysql
      if (matches)
        return new SocketAddress(matches[1], ( gs.nil(matches[2]) ? 3306 : matches[2] ));
      
      matches = str.match(/^jdbc:\w+:\w+:@([0-9\w\.\-]+):(\d+):\w+/); // oracle
      if (matches)
        return new SocketAddress(matches[1], matches[2]);
      break;    
  }  

  return null;
}

/**
 * Determines whether two arrays of socket addresses have at least one address in common.
 * @param array lhAddresses of SocketAddress to match against.
 * @param array rhAddresses of SocketAddress to match against.
 * @return boolean true if found, false if not.
 */
SocketAddress.addressesIntersect = function(lhAddresses, rhAddresses) {
  for (var i = 0; i < lhAddresses.length; ++i) {
    if (lhAddresses[i].inArray(rhAddresses))
      return true;
  }

  return false;
}

