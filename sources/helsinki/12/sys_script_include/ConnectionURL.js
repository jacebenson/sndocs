var ConnectionURL = Class.create();

ConnectionURL.prototype = {
	initialize : function(gr) {
		this.sysDataSourceGR = gr;
		this.type = gr.type;
		this.connection_url;
	},
	
	getFileConnectionURL : function () {
		if (this.sysDataSourceGR.file_retrieval_method == "File") {
			// file paths must be absolute
			this.connection_url = "file://" + this.sysDataSourceGR.file_path;
			return this.connection_url;
		}
		
		if (this.sysDataSourceGR.file_retrieval_method == "HTTP" || this.sysDataSourceGR.file_retrieval_method == "HTTPS")
			return this.getHTTPConnectionURL();
		
		if (this.sysDataSourceGR.file_retrieval_method == "SCP")
			return this.getSCPConnectionURL();
		
		if (this.sysDataSourceGR.file_retrieval_method == "Attachment") {
			this.connection_url = "attachment://sys_data_source:" +
			this.sysDataSourceGR.sys_id + "/" + this.sysDataSourceGR.file_path;
			
			if (!this.sysDataSourceGR.ssh_keyfile_path.nil())
				this.connection_url += "#" + this.sysDataSourceGR.ssh_keyfile_path;
			
			return this.connection_url;
		}
		
		if (this.sysDataSourceGR.file_retrieval_method.toString().indexOf("FTP") >= 0)
			return this.getFTPConnectionURL();
		
		return this.connection_url;
	},
	
	getFTPConnectionURL : function () {
		var frm = this.sysDataSourceGR.file_retrieval_method;
		if(frm == "FTP")
			this.connection_url = "ftp://";
		else if(frm == "SFTP")
			this.connection_url = "sftp://";
		else if(frm == "FTPS (Implicit SSL)")
			this.connection_url = "ftpssl://";
		else if(frm == "FTPS (Implicit TLS)")
			this.connection_url = "ftptls://";
		else if(frm == "FTPS (Auth SSL)")
			this.connection_url = "ftpauthssl://";
		else if(frm == "FTPS (Auth TLS)")
			this.connection_url = "ftpauthtls://";
		
		this.buildAuthPartOfUrl();
		this.appendServer(this.sysDataSourceGR.scp_server);
		
		if (frm == "SFTP")
			this.appendPort(this.sysDataSourceGR.scp_port);
		
		if (this.sysDataSourceGR.file_path.startsWith("/"))
			this.connection_url += "/%2F" + this.sysDataSourceGR.file_path.substring(1);
		else
			this.connection_url += "/" + this.sysDataSourceGR.file_path;
		
		return this.connection_url;
	},
	
	getSCPConnectionURL : function () {
		this.connection_url = "scp://";
		
		if (!this.sysDataSourceGR.scp_user_name.nil())
			this.buildAuthPartOfUrl();
		
		this.appendServer(this.sysDataSourceGR.scp_server);
		this.appendFilePath(this.sysDataSourceGR.file_path);
		
		if (!this.sysDataSourceGR.ssh_keyfile_path.nil())
			this.connection_url += "#" + this.sysDataSourceGR.ssh_keyfile_path;
		
		return this.connection_url;
	},
	
	getHTTPConnectionURL : function () {
		if (this.sysDataSourceGR.file_retrieval_method == "HTTP")
			this.connection_url = "http://";
		
		if (this.sysDataSourceGR.file_retrieval_method == "HTTPS")
			this.connection_url = "https://";
		
		var encoded_file_path = this.getEncodedFilePath(this.sysDataSourceGR.file_path);
		
		if (!this.sysDataSourceGR.scp_user_name.nil())
			this.buildAuthPartOfUrl();
		
		this.appendServer(this.sysDataSourceGR.scp_server);
		this.appendPort(this.sysDataSourceGR.scp_port);
		this.appendFilePath(encoded_file_path);
		
		return this.connection_url;
	},
	
	getJDBCConnectionURL : function () {
		var SQLServer = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
		var MySQL = "org.mariadb.jdbc.Driver";
		var oldMySQL = "com.mysql.jdbc.Driver";
		var Oracle = "oracle.jdbc.OracleDriver";
		var DB2 = "com.ibm.db2.jcc.DB2Driver";
		var Sybase = "com.sybase.jdbc3.jdbc.SybDriver";
		
		var format = this.sysDataSourceGR.format;
		var instanceName = this.sysDataSourceGR.instance_name;
		var databaseName = this.sysDataSourceGR.database_name;
		var server = this.sysDataSourceGR.jdbc_server;
		var port = this.sysDataSourceGR.database_port;
		var connection_url_parameters =  this.sysDataSourceGR.connection_url_parameters;
		
		if (format == MySQL || format == oldMySQL || format == SQLServer) {
			if (!this.sysDataSourceGR.database_port.nil())
				port = ":" + port;
			else
				port = "";
			
			var driver = "jdbc:mysql://";
			if (format == SQLServer)
				driver = "jdbc:sqlserver://";
			
			this.connection_url = driver + server + port;
			
			if (format == SQLServer) {
				if (JSUtil.notNil(instanceName))
					this.connection_url += ";instanceName=" + instanceName;
				
				this.connection_url += ";selectMethod=cursor;databaseName=" + databaseName;
				
				if (this.sysDataSourceGR.use_integrated_authentication == true)
					this.connection_url += ";integratedSecurity=true";
				
			} else {
				this.connection_url += "/" + databaseName;
			}
		}
		
		if (format == Sybase) {
			this.connection_url = "jdbc:sybase:Tds:" + server + ":" +
			port + "/" + databaseName;
		}
		
		if (format == Oracle) {
			this.connection_url = "jdbc:oracle:thin:@" + server + ":" +
			this.sysDataSourceGR.oracle_port + ":" + this.sysDataSourceGR.oracle_sid;
		}
		
		if (format == DB2) {
			this.connection_url = "jdbc:db2://" + server + ":" +
			port + "/" + databaseName;
		}
		
		if (JSUtil.notNil(connection_url_parameters)) {
			this.connection_url += ";" + connection_url_parameters;
		}
		return this.connection_url;
	},
	
	getConnectionURL : function () {
		if (this.sysDataSourceGR.type == "File")
			return this.getFileConnectionURL();
		
		if (this.sysDataSourceGR.type == "JDBC")
			return this.getJDBCConnectionURL();
		
		return this.connection_url;
	},
	
	getEncodedFilePath : function(file_path) {
		var encoded_file_path = encodeURI(file_path);
		return encoded_file_path;
	},
	
	buildAuthPartOfUrl : function () {
		var passwd = "${scp_password}";
		this.connection_url += this.sysDataSourceGR.scp_user_name + ":" +passwd + '@';
	},
	
	appendServer : function (server_name) {
		if (JSUtil.notNil(server_name))
			this.connection_url += server_name;
	},
	
	appendPort : function (server_port) {
		if (JSUtil.notNil(server_port))
			this.connection_url += ':' + server_port;
	},
	
	appendFilePath : function (file_path) {
		if (JSUtil.notNil(file_path)) {
			if (file_path.startsWith("/"))
				this.connection_url += file_path;
			else 
				this.connection_url += "/" + file_path;
		}
	},
	
	getPassword : function (encrypted) {
		var Encrypter = new GlideEncrypter();
		return Encrypter.decrypt(encrypted);
	},
}