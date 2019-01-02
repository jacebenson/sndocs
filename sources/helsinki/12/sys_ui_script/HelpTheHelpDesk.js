/******************************************************************************
 * Required Variables:
 * The following section should be modified if the information is not correct.
 ******************************************************************************/

// The variable should point to your instance URL, such as https://demo.service-now.com
var server = "${glide.servlet.uri}";

// If SOAP authentication is turned on on the instance. The http authentication should be provided here
var httpUsername = "${glide.hthd.http.username}";
var httpPassword = "${glide.hthd.http.password}";

/******************************************************************************
 * Optional Variables:
 * The following section can be modified for other purposes.
 ******************************************************************************/

// If this variable is set to true, the XML file (that contains the data of the wmi scan) will be
// saved to the user's local temp directory (can be accessed with %tmp% through command line) in addition
// to sending it back to the instance.
var writePayloadToDisk = false;

// If DEBUG is set to true, more debugging messages will be potentially available through popups.
var DEBUG = false;

/******************************************************************************
 * WMI Script section:
 * The starting portion of the actual WMI script.
 ******************************************************************************/
// Building two xml documents
// 1. The payload that goes into the ecc_queue
// 2. The soap xml document for the ecc_queue insert
var xmlPayload;
var root; // root element for the payload document
var wbemFlagReturnImmediately = 0x10;
var wbemFlagForwardOnly = 0x20;
var HKLM = 0x80000002;
var strUser = "";
var strPasswd = "";
var strMachines = [];
var currentMachine = 0;
var licenseItems = {};
    licenseItems.byname = {};
    licenseItems.byuuid = {};

var Base64;
var xmlSOAP;
var source;
var gCIMV2Service;
var gDefaultService;
var g_regProvider;
var g_license_key = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Installer\\UserData";
var g_license_key2 = "SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Installer\\UserData";
var g_regupath = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
var g_regupath2 = "SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
var g_officeBase = "SOFTWARE\\Microsoft\\Office";
var g_officeBase2 = "SOFTWARE\\Wow6432Node\\Microsoft\\Office";

var agentName = "wmi";
var invalidXMLDetection = "detectedInvalidXMLCharacter";

// Add new gathering routines here
// Gets around the fact that the HTA window does not want to redraw until our processing is complete
var g_index = 0;
var g_routines = [
    [ "OS Check", "win9X()", false ],
    [ "Getting OS Configuration", "getMachine()", true ],
    [ "Gathering Disk Configuration", "getLogicalDisks()", true ],
    [ "Gathering Network Configuration", "getNetworkAdapters()", true ],
    [ "Gathering Printer Configuration", "getPrinters()", true ],
    [ "Connecting to registry", "connectRegistry()", true ],
    [ "Gathering Software Licenses", "getSoftwareLicenses()", true ],
    [ "Gathering Microsoft Licenses", " getMicrosoftLicenses()", true ],
    [ "Gathering Software Configuration", "getSoftware()", true ],
    [ "Communicating", "eccEvent()", true ] ];

/*******************************************************************************
 * Determine if we are running in HTA mode
 ******************************************************************************/
if (typeof(isHTA) == 'undefined')
    isHTA = false;

/*******************************************************************************
 * Help The Help Desk specific functions
 * Only run these run these if in HTA mode
 ******************************************************************************/
remoteMode = "";
iscanNetwork = "";

if (isHTA) {
    top.moveTo(5, 5); // 1024 X 768 monitors, we are sometimes off the screen
    top.resizeTo(675, 725);

    // Everything is driven from the onload
    function onload() {
        adjustServer(); // hta bugs :-(

        setStatus("Setup");

        strMachines.push("");
        runDiscovery('pageSetup');

    }

    function runDiscovery(page) {
        if (page == null)
            page = "page0";

        gotoPage(page, 'page1');

        try {
            initPayload();
            clearBoxes();
        } catch (exception) {
            setStatus("Error creating XML document, contact SNC");
            setErrorText(exception.description);
            return;
        }

        doNext();
    }

    // dispatcher that permits redraw of the status area
    function doNext() {
        if (g_index == g_routines.length) {
            setStatus("Complete");
            return;
        }

        setStatus(g_routines[g_index][0] + " - (" + (g_index + 1) + " of " + g_routines.length + ")");
        setTimeout("catcher(" + "'" + g_routines[g_index][1] + "'" + ")", 50);

        g_index++;
    }

    // navigation
    function gotoPage(from, to) {
        var p = document.getElementById(from);
        p.style.display = "none";

        p = document.getElementById(to);
        p.style.display = "inline";
    }

    function setStatus(status) {
        var span = document.getElementById("status");
        span.innerText = " - " + status;
    }

    function setErrorText(status) {
        var span = document.getElementById("error_text");
        span.innerText = status;
    }

    // no append in this one
    function setInputValue(name, value) {
        var i = document.getElementById(name);
        if (i)
            i.value = value;
    }

    function clearBoxes() {
        var k = document.getElementsByTagName("input");
        for (var i = 0; i < k.length; i++)
            if (k[i].type == "text")
                k[i].value = "";
    }

    // ultimate strategy is to download the agent to a known location
    // here, adjust the url to get around the permission bug in xmlhttp
    function adjustServer() {
        if (window.location.protocol == "file:")
            return;

        server = window.location.protocol + "//" + window.location.host;

        if (window.location.pathname.indexOf("/") > -1) {
            var fp = window.location.pathname;
            fp = fp.substring(0, fp.lastIndexOf("/"));
            server = server + "/" + fp;
        }

        server += "/";

        // quick fix... if the server ends with hta, then we need to
        // strip that off
        if (server.substring(server.length - 4) == "hta/")
            server = server.substring(0, server.length - 4);
    }

} // end of if(isHTA)

/*******************************************************************************
 * END OF Help The Help Desk specific functions
 ******************************************************************************/

if (isHTA == false)
    scan();

function scan() {
    initPayload();

    for (var i = 0; i < g_routines.length; i++)
        catcher(g_routines[i][1]);
}

function catcher(functionName) {
    try {
        eval(functionName);
    } catch (exception) {
        if (isHTA && exception.description != "The RPC server is unavailable.")
            setErrorText("Error executing " + functionName + ": " + exception.description);
        debug("Error executing " + functionName + ": " + exception.name + " " + exception.message);
    }
    if (isHTA)
        doNext();
}

function debug(msg) {
    if (!DEBUG)
        return;

    if (isHTA)
        alert(msg);
    else
        WScript.echo(msg);
}

// create the payload XML
function initPayload() {
    xmlPayload = new ActiveXObject("Microsoft.XMLDOM");
    root = xmlPayload.createElement(agentName);
    xmlPayload.appendChild(root);
}

// for machines without WMI installed, try to get some information
function win9X() {
    var n = new ActiveXObject("WScript.Network");
    var s = new ActiveXObject("WScript.Shell");
    
    // get the hostname
    var regKey = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\";
    try {
        source = s.RegRead(regKey + "Hostname");
    } catch (e) {
        debug("Getting name from registry failed - falling back on WScript.Network");
        source = n.ComputerName;
    }
    setInput("name", source);

    // get the username
    try {
        var userName = n.UserDomain ? n.UserDomain + "\\" + n.UserName : n.UserName;
        setInput("user_name", userName);
    } catch (e) {}
    
    // get processor information
    regKey = "HKLM\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0\\";
    try {
        setInput("cpu_name", s.RegRead(regKey + "Identifier"));
        setInput("cpu_manufacturer", s.RegRead(regKey + "VendorIdentifier"));
    } catch (e) {}

    // Grab basic OS info for non-NT systems
    var populated = false;
    var regKey = "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\";
    try {
        setInput("os", s.RegRead(regKey + "ProductName"));
        setInput("os_product_id", s.RegRead(regKey + "ProductId"));
        setInput("os_product_key", s.RegRead(regKey + "ProductKey"));
        setInput("user_full_name", s.RegRead(regKey + "RegisteredOwner"));
        setInput("os_version", s.RegRead(regKey + "VersionNumber"));

        populated = true;
    } catch (e) {}

    // If we successfully collected basic OS info above, return
    if (populated == true)
        return;

    // Otherwise, get NT OS info
    regKey = "HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\";
    try {
        setInput("os", s.RegRead(regKey + "ProductName"));
        setInput("os_product_id", s.RegRead(regKey + "ProductId"));
        setInput("os_service_pack", s.RegRead(regKey + "CSDVersion"));
        // registration key is base 24 encoded in bytes 52 through 66
        var x = s.RegRead(regKey + "DigitalProductId");
        var arrayBSTR = x.toArray();
        setInput("os_digital_product_id", arrayBSTR.toString());
    } catch (e) {}
}

function getMachine() {
    gCIMV2Service = connectServer("root\\cimv2"); // global

    if (isHTA)
        setInput("run_by", user);

    var items = gCIMV2Service.ExecQuery("Select * from Win32_OperatingSystem");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("os", item.Caption);
        setInput("os_version", item.Version);
        setInput("os_service_pack", item.CSDVersion);
        setInput("description", item.Description);
        setInput("os_install_date", WMIDateToString(item.InstallDate));
        setInput("os_last_boot", WMIDateToString(item.LastBootUpTime));
    }

    var items = gCIMV2Service.ExecQuery("Select * from Win32_ComputerSystemProduct");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("serial_number", item.IdentifyingNumber);
        setInput("uuid", item.UUID);
    }

    var items = gCIMV2Service.ExecQuery("Select * from Win32_BaseBoard");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("baseboard_serial_number", item.SerialNumber);
    }

    var items = gCIMV2Service.ExecQuery("Select * from Win32_SystemEnclosure");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("chassis_serial_number", item.SerialNumber);
        var typeStr = getChassisType(item.ChassisTypes.toArray()[0]);
        setInput("chassis_type", typeStr);
    }

    var items = gCIMV2Service.ExecQuery("Select * from Win32_BIOS");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("bios_serial_number", item.SerialNumber);
    }

    var items = gCIMV2Service.ExecQuery("Select * from Win32_ComputerSystem");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("manufacturer", item.Manufacturer);
        setInput("model_id", item.Model);
        setInput("ram", item.TotalPhysicalMemory);
        setInput("user_name", item.UserName);
        setInput("domain", item.Domain);
        if (item.NumberOfProcessors)
            setInput("cpu_count", item.NumberOfProcessors);
        else
            setInput("cpu_count", "1");
    }

    var items = gCIMV2Service.ExecQuery("Select * from Win32_Processor");
    var enumItems = new Enumerator(items);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var item = enumItems.item();
        setInput("cpu_manufacturer", item.Manufacturer);
        setInput("cpu_speed", item.MaxClockSpeed);
        setInput("cpu_speed_current", item.CurrentClockSpeed);
        setInput("cpu_name", item.Name);
        setInput("os_address_width", item.AddressWidth);
        if (item.NumberOfCores)
            setInput("cpu_core_count", item.NumberOfCores);
        else
            setInput("cpu_core_count", 1);        
    }
}

function getChassisType(index) {
    var types = ["Other", "Unknown", "Desktop", "Low Profile Desktop", "Pizza Box", 
                 "Mini Tower", "Tower", "Portable", "Laptop", "Notebook", "Hand Held", 
                 "Docking Station", "All in One", "Sub Notebook", "Space-Saving", 
                 "Lunch Box", "Main System Chassis", "Expansion Chassis", "SubChassis", 
                 "Bus Expansion Chassis", "Peripheral Chassis", "Storage Chassis", 
                 "Rack Mount Chassis", "Sealed-Case PC"];
    return types[index - 1];
}

function getPrinters() {
    var colItems = gCIMV2Service.ExecQuery("SELECT * FROM Win32_Printer");
    var enumItems = new Enumerator(colItems);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var o = enumItems.item();
        var nap = xmlPayload.createElement("printer");
        root.appendChild(nap);
        appendElement(nap, "printer_name", o.Name);
        appendElement(nap, "device_id", o.DeviceID);
        appendElement(nap, "port_name", o.PortName);
        appendElement(nap, "printer_address", grabItem('Win32_TCPIPPrinterPort', 'Name', o.PortName, 'HostAddress'));
    }
}

function getNetworkAdapters() {
    var colItems = gCIMV2Service.ExecQuery("SELECT * FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = true");
    var enumItems = new Enumerator(colItems);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var o = enumItems.item();
        var nap = xmlPayload.createElement("network_adapter");
        root.appendChild(nap);
        appendElement(nap, "caption", o.Caption);
        appendElement(nap, "ip_address", o.IPAddress);
        appendElement(nap, "netmask", o.IPSubnet);
        appendElement(nap, "mac_address", o.MACAddress);
        appendElement(nap, "ip_default_gateway", o.DefaultIPGateway);
        appendElement(nap, "dhcp_enabled", o.DHCPEnabled);
        appendElement(nap, "adapter_manufacturer", grabItem('Win32_NetworkAdapter', 'Index', o.Index, 'Manufacturer'));
        if (isHTA) {
            var ip = o.IPAddress;
            if (ip != null && ip.toArray().join(",") != "0.0.0.0") {
                setInputValue("ip_address", ip.toArray().join(","));
                setInputValue("mac_address", o.MACAddress);
            }
        }
    }
}

function getLogicalDisks() {
    var colItems = gCIMV2Service.ExecQuery("SELECT * FROM Win32_LogicalDisk");
    var enumItems = new Enumerator(colItems);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var o = enumItems.item();
        var disk = xmlPayload.createElement("logical_disk");
        root.appendChild(disk);
        appendElement(disk, "device_id", o.DeviceID);
        appendElement(disk, "file_system", o.FileSystem);
        appendElement(disk, "free_space", o.FreeSpace);
        appendElement(disk, "disk_space", o.Size);
        appendElement(disk, "volume_name", o.VolumeName);
        appendElement(disk, "volume_serial_number", o.VolumeSerialNumber);
        appendElement(disk, "description", o.Description);
        appendElement(disk, "drive_type", o.DriveType);
    }
}

function connectRegistry() {
    gDefaultService = connectServer("root\\default");
    g_regProvider = gDefaultService.Get("StdRegProv");
}

function getSoftwareLicenses() {
    var paths = [ g_license_key, g_license_key2 ];
    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var folders = getRegEnumValue(path);
        if (folders)
            _getSoftwareLicenses(folders, path);
    }
}

function _getSoftwareLicenses(folders, license_key) {
    for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        var folderKey = license_key + "\\" + folder + "\\" + "Products";
        var products = getRegEnumValue(folderKey);
        if (products == null)
            continue;
        for (var n = 0; n < products.length; n++) {
            var product = products[n];
            productKey = folderKey + "\\" + product + "\\" + "InstallProperties";
            var publisher = getRegStringValue(productKey, "Publisher");
            var productID = getRegStringValue(productKey, "ProductID");
            if (productID == null || productID.length == 0 || productID.toLowerCase() == "none")
                continue;

            var storeKey = getRegStringValue(productKey, "DisplayName") + " " + getRegStringValue(productKey, "DisplayVersion");
            licenseItems['byname'][storeKey] = productID;
        }
    }
}

function getMicrosoftLicenses() {
    // grab OS key
    var osPKey = "Software\\Microsoft\\Windows\\CurrentVersion";
    var osDigPKey = "Software\\Microsoft\\Windows NT\\CurrentVersion";
    var os_digProductID = getRegBinValue(osDigPKey, "DigitalProductID");
    if (os_digProductID) {
        var os_arrayBSTR = os_digProductID.toArray();
        setInput("os_digital_product_id", os_arrayBSTR.toString());
    }
    var os_productID = getRegStringValue(osPKey, "ProductId");
    if (!os_productID)
        os_productID = getRegStringValue(osDigPKey, "ProductId");
    setInput("os_product_id", os_productID);

    // Get office related licenses
    var paths = [ g_officeBase, g_officeBase2 ];
    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var folders = getRegEnumValue(path);
        if (folders)
            _getOfficeLicenses(folders, path);
    }
}

function _getOfficeLicenses(folders, officeBase) {
    for (var i = 0; i < folders.length; i++) {
        var version = folders[i];
        var folderKey = officeBase + "\\" + version + "\\" + "Registration";

        try {
            var regKeys = getRegEnumValue(folderKey);

            if (regKeys != null && regKeys.length > 0) {
                for (z = 0; z <= regKeys.length - 1; z++) {
                    var muuid = regKeys[z];
                    var keyPath = folderKey + "\\" + muuid;
                    var productID = getRegStringValue(keyPath, "ProductID");
                    var digProductID = getRegBinValue(keyPath, "DigitalProductID");
                    var arrayBSTR = digProductID.toArray();
                    digProductID = arrayBSTR.toString();

                    if (muuid.substring(0, 1) == "{")
                        muuid = muuid.substring(1, muuid.length - 1);

                    licenseItems['byuuid'][muuid] = {};
                    licenseItems['byuuid'][muuid]['productid'] = productID;
                    licenseItems['byuuid'][muuid]['digitalproductid'] = digProductID;
                }
            }
        } catch (e) {} // didn't find key
    }
}

function getSoftware() {
    var processed = {};
    var paths = [ g_regupath, g_regupath2 ];
    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var softKeys = getRegEnumValue(path);
        if (softKeys)
            _getSoftware(softKeys, path, processed);
    }
	
	_getInternetExplorerInfo();
}

function _getSoftware(softKeys, regupath, processed) {
    for (var i = 0; i < softKeys.length; i++) {
        var subKey = softKeys[i];
        var sParentDisplayName = getRegStringValue(regupath + "\\" + subKey, "ParentDisplayName");
        var sDisplayName = getRegStringValue(regupath + "\\" + subKey, "DisplayName");
        var sDisplayVersion = getRegStringValue(regupath + "\\" + subKey, "DisplayVersion");
        var sPublisher = getRegStringValue(regupath + "\\" + subKey, "Publisher");
        var sUninstStr = getRegStringValue(regupath + "\\" + subKey, "UninstallString");
        var sInstallDate = getRegStringValue(regupath + "\\" + subKey, "InstallDate");
        var msiID = "";

        if (sUninstStr && sUninstStr.toLowerCase().indexOf("msiexec") > -1) {
            var start = sUninstStr.indexOf("{");
            var finalString = sUninstStr.substring(start + 1);
            var end = finalString.indexOf("}");
            msiID = finalString.substring(0, end);
        }

        // If the name is empty, skip it
        if (!sDisplayName)
            continue;

        var sName = sDisplayName + "__" + sDisplayVersion;

        if (processed[sName])
            continue;

        if (sDisplayName == invalidXMLDetection)
            continue;

        var product = xmlPayload.createElement("product");
        appendElement(product, "name", sDisplayName);
        appendElement(product, "version", sDisplayVersion);
        appendElement(product, "vendor", sPublisher);
        appendElement(product, "part_of", sParentDisplayName);
        appendElement(product, "product_id", licenseItems['byname'][sDisplayName + " " + sDisplayVersion]);
        appendElement(product, "uninstall_string", sUninstStr);
        appendElement(product, "install_date", asGlideDateStr(sInstallDate));

        if (msiID.length > 0) {
            appendElement(product, "msi_id", msiID);

            if (licenseItems['byuuid'][msiID])
                appendElement(product, "digital_product_id", licenseItems['byuuid'][msiID]['digitalproductid']);
        }

        root.appendChild(product);
        processed[sName] = 1;
    }
}

function _getInternetExplorerInfo() {
	var ieKey = "Software\\Microsoft\\Internet Explorer";
	
	var svcVersion = getRegStringValue(ieKey, "svcVersion");
	var version = getRegStringValue(ieKey, "Version");
		
	// Check if we can detect IE
	if (svcVersion == null && version == null)
		return;
	
	// Version should work for IE 4.0+. svcVersion is new to IE 10. 
	version = svcVersion ? svcVersion : version;
	
	var regKey = "Software\\Microsoft\\Internet Explorer\\Registration";
	var productId = getRegStringValue(regKey, "ProductId");
	
	if (productId == null)
	   productId = "";
	
	var product = xmlPayload.createElement("product");
    appendElement(product, "name", "Internet Explorer");
    appendElement(product, "version", version);
    appendElement(product, "vendor", "Microsoft");
    appendElement(product, "part_of", "");
    appendElement(product, "product_id", productId);
    appendElement(product, "uninstall_string", "");
    appendElement(product, "install_date", "");

    root.appendChild(product);
}

function asGlideDateStr(date) {
    var pattern = /(\d{4})(\d{2})(\d{2})/;
    if (date == null || date == "" || !date.match(pattern))
        return "";

    var format = "$1-$2-$3 00:00:00";
    return date.replace(pattern, format);
}

function connectServer(path) {
    var sLoc = new ActiveXObject("WbemScripting.SWbemLocator");
    var arch = new ActiveXObject("WbemScripting.SWbemNamedValueSet");
    arch.Add("__ProviderArchitecture", 64);
    return sLoc.ConnectServer(strMachines[currentMachine], path, strUser, strPasswd, null, null, null, arch);
}

function getRegStringValue(key, name) {
    return registryGet(g_regProvider, "GetStringValue", key, name);
}

function getRegEnumValue(key) {
    return registryGet(g_regProvider, "EnumKey", key);
}

function getRegBinValue(key, name) {
    return registryGet(g_regProvider, "GetBinaryValue", key, name);
}

function registryGet(regCon, funcName, key, value) {
    var mfunc = regCon.Methods_.Item(funcName);
    var funcParams = mfunc.InParameters.SpawnInstance_();
    funcParams.hDefKey = HKLM;
    funcParams.sSubKeyName = key;

    if (value && value.length > 0)
        funcParams.sValueName = value;

    var retParam = regCon.ExecMethod_(funcName, funcParams);

    // protect against unknown keys with try / catch
    try {
        if (!retParam)
            return null;

        if (funcName == "GetBinaryValue")
            return retParam.uValue;
        else if (value)
            return stripNonValidXMLCharacters(retParam.sValue);
        else
            return retParam.sNames.toArray();

    } catch (e) {
        debug("Error getting registry key: " + key + "due to " + e.description);
        return null;
    }
}

function stripNonValidXMLCharacters(value) {
    if (value == null || value == "")
        return "";

    var output = "";
    for (var i = 0; i < value.length; i++) {
        var current = value.charCodeAt(i);

        if (current == 0x9 || current == 0xA || current == 0xD || (current >= 0x20 && current <= 0xD7FF) || (current >= 0xE000 && current <= 0xFFFD) || (current >= 0x10000 && current <= 0x10FFFF))
            output += String.fromCharCode(current);
        else // Detected invalid xml characters
            return invalidXMLDetection;
    }

    return output;
}

function WMIDateToString(dtmDate) {
    if (dtmDate == null)
        return "null date";

    var strDateTime;
    if (dtmDate.substr(4, 1) == 0)
        strDateTime = dtmDate.substr(5, 1) + "/";
    else
        strDateTime = dtmDate.substr(4, 2) + "/";

    if (dtmDate.substr(6, 1) == 0)
        strDateTime = strDateTime + dtmDate.substr(7, 1) + "/";
    else 
        strDateTime = strDateTime + dtmDate.substr(6, 2) + "/";

    strDateTime = strDateTime + dtmDate.substr(0, 4) + " " + dtmDate.substr(8, 2) + ":" + dtmDate.substr(10, 2) + ":" + dtmDate.substr(12, 2);
    return strDateTime;
}

function grabItem(table, field, value, retv) {
    value = new String(value);
    var arItems = value.split("\\");
    if (arItems.length > 1)
        value = arItems.join("\\\\");

    var eQuery = "SELECT " + retv + " FROM " + table + " WHERE " + field + " = '" + value + "'";
    var colItems = gCIMV2Service.ExecQuery(eQuery);
    var enumItems = new Enumerator(colItems);
    for (; !enumItems.atEnd(); enumItems.moveNext()) {
        var o = enumItems.item();
        if (o[retv] != null)
            return o[retv];
    }
}

function setInput(name, value) {
    if (isHTA)
        setInputValue(name, value);

    var i = root.getElementsByTagName(name);

    if (i.length) {
        if (value == null)
            return;

        var child = i.item(0);
        child.firstChild.nodeValue = value;
    } else
        appendElement(root, name, value);
}

function appendElement(parent, name, value) {
    var e = xmlPayload.createElement(name);
    var vtype = typeof value;

    if (value != null) {
        if (vtype == "boolean")
            value = value ? 1 : 0;
        else if (vtype == "object" || vtype == "unknown")
            value = value.toArray().join(",");

        // If the value shows bad XML character has been detected, then clear
        // out the text value and set an attribute
        if (value == invalidXMLDetection) {
            value = "";
            e.setAttribute("invalidChar", "true");
        }

        e.appendChild(xmlPayload.createTextNode(value));
    }

    parent.appendChild(e);
}

/*******************************************************************************
 * SOAP Section
 * Headers...
 * SOAPAction: "http://www.service-now.com/ecc_event/insert"
 * User-Agent: Mindreef SOAPscope 4.1.2000 (http://www.mindreef.com)
 * Content-Type: text/xml; charset=UTF-8
 * Payload...
 * ecc_event.do?SOAP
 * 
 * <?xml version="1.0" encoding="UTF-8"?>
 * <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.service-now.com/ecc_event" xmlns:xs="http://www.w3.org/2001/XMLSchema">
 *     <soap:Body>
 *         <tns:insert>
 *             <agent/>
 *             <description/>
 *             <name/>
 *             <severity/>
 *             <source/>
 *             <status/>
 *         </tns:insert>
 *     </soap:Body>
 * </soap:Envelope>
 ******************************************************************************/
function eccEvent() {
    // Write the payload XML out to the temp direcotry for debugging purpose.
    if (writePayloadToDisk) {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var fileName = fso.getSpecialFolder(2) + "\\snc_discovery_output.xml"; // Inside %tmp% folder
        var newFile = fso.CreateTextFile(fileName, true);
        newFile.WriteLine("<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" + xmlPayload.xml);
        newFile.Close();

        if (isHTA) {
            var span = document.getElementById("url");
            span.innerHTML = "<a href=file:" + fso.GetAbsolutePathName(fileName) + ">View XML</a>";
        }
    }

    xmlSOAP = new ActiveXObject("Microsoft.XMLDOM");
    var x = xmlSOAP.createProcessingInstruction("xml", "version=\"1.0\"")
    xmlSOAP.appendChild(x);

    var e = xmlSOAP.createElement("soap:Envelope");
    e.setAttribute("xmlns:soap", "http://schemas.xmlsoap.org/soap/envelope/");
    e.setAttribute("xmlns:tns", "http://www.service-now.com/ecc_event");
    e.setAttribute("xmlns:xs", "http://www.w3.org/2001/XMLSchema");
    xmlSOAP.appendChild(e);

    var e1 = xmlSOAP.createElement("soap:Body");
    e.appendChild(e1);

    var e2 = xmlSOAP.createElement("tns:insert");
    e1.appendChild(e2);

    addField(e2, "agent", agentName);
    addField(e2, "source", source);
    addField(e2, "name", agentName + (isHTA ? ".hta" : ".script"));
    addField(e2, "topic", "WMILoader");
    addField(e2, "payload", "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" + xmlPayload.xml);

    if (isHTA)
        setStatus("Sending data");

    sendRequest(server + "ecc_queue.do?SOAP", null, xmlSOAP);
}

function addField(parent, name, value) {
    var x = xmlSOAP.createElement(name);
    parent.appendChild(x);
    var t = xmlSOAP.createTextNode(value);
    x.appendChild(t);
}

function createXHR() {
    try { return new XMLHttpRequest(); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
    try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}

    debug("XMLHttpRequest not supported. Abort sending data to instance.");
    return null;
}

//We need to manipulate the glide_user cookie when basic auth is enabled for HTHD
var gSavedCookie = false;

function clearUserCookie() {
	if(isHTA) {
		var regex = /glide_user=([^;]*);/;
		var matchResult = regex.exec(""+document.cookie);
		
		if(matchResult && matchResult[1])
			gSavedCookie = matchResult[1];
		
		setUserCookie("", -1);
	}
}

function restoreUserCookieIfNeeded() {
	if(gSavedCookie) {
		setUserCookie(gSavedCookie, 24855); //same expiry as in CookieMan
	}
}

function setUserCookie(value, maxAge) {
	if(isHTA) {
		var d = new Date();
		d.setDate(d.getDate() + maxAge);
		document.cookie = "glide_user=" + value + "; expires=" + d + "; domain=" + document.domain + "; path=/";
	}
}


// different than xmlhttp.js - pass the xml doc payload
function sendRequest(url, loadedFunction, xmlSOAP) {
    var req = createXHR();
    if (!req)
        return;

    req.onreadystatechange = function() {
        processReqChange(req, loadedFunction, null);
    };
    req.open("POST", url, isHTA ? true : false);

    req.setRequestHeader("Content-Type", "text/xml");
    if (httpUsername != "") {
		clearUserCookie();
        req.setRequestHeader("Authorization", "Basic " + getBasicAuthorization());
	}
    req.send(xmlSOAP.xml);
}

function getBasicAuthorization() {
    initBase64();
    if (httpPassword.indexOf("encrypt:") == 0) {
        httpPassword = httpPassword.substring("encrypt:".length, httpPassword.length);
        httpPassword = Base64.decode(httpPassword);
    }

    return Base64.encode(httpUsername + ":" + httpPassword)
}

// handle onreadystatechange event of req object
function processReqChange(r, docLoadedFunction, docLoadedFunctionArgs) {
    // only if req shows "loaded"
    if (r.readyState != 4)
        return;
	
	restoreUserCookieIfNeeded();

    // only if "OK"
    if (r.status == 200) {
        alertIfFaultString(r.responseText);
        if (docLoadedFunction)
            docLoadedFunction(r, docLoadedFunctionArgs);
    } else if (r.status == 401)
        debug("Unable to post results, basic auth is enabled!");
    else
        debug("There was a problem retrieving the XML data(" + r.status + "): \n" + r.statusText);
}

// Looks at the XML string returned by SOAP and display error string if there's
// any.
function alertIfFaultString(xmlString) {
    var pattern = "<faultstring>";
    var beginning = xmlString.search(pattern);
    if (beginning == -1)
        return;

    var end = xmlString.search("</faultstring>");
    debug("Error: " + xmlString.substring((beginning + pattern.length), end));
}

/**
 * Base64 encode / decode http://www.webtoolkit.info/
 */
function initBase64() {
    Base64 = {
        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2))
                    enc3 = enc4 = 64;
                else if (isNaN(chr3))
                    enc4 = 64;

                output = output + 
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + 
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }

            return output;
        },

        // public method for decoding
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64)
                    output = output + String.fromCharCode(chr2);

                if (enc4 != 64)
                    output = output + String.fromCharCode(chr3);

            }
            output = Base64._utf8_decode(output);

            return output;
        },

        // private method for UTF-8 encoding
        _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var i = 0; i < string.length; i++) {

                var c = string.charCodeAt(i);

                if (c < 128)
                    utftext += String.fromCharCode(c);
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode: function(utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {
                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }

            return string;
        }
    }
}
