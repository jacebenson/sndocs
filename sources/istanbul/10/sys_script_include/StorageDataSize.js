/**
 * Performs conversions between common data sizes.
 *
 * @since fuji
 * @author roy.laurie
 **
 * @param int|float|string size
 * @param string|undefined unitOfMeasurement Optional unit of measurement. See StorageDataSize.Unit
 */
var StorageDataSize = function(size, unitOfMeasurement) {
	this.bytes = 0;

	// handle one argument
	if (typeof unitOfMeasurement === 'undefined') {
		
		// check to see if it's an integer
		var intSize = parseInt(size);
		
		if (intSize == size && intSize >= 0) {
			this.bytes = intSize;
		} else if (!isNaN(size)) { // if it's a float or invalid number
			gs.logWarning('Invalid size without unit-of-measurement specified: ' + size, 'StorageDataSize' );
			return;
			
		} else { // handle string parsing. e.g., 32GB, 4.3 KB etc.
			var matches = (''+size).match(StorageDataSize._PARSE_REGEX);
			if (matches === null){
				gs.logWarning('Data size not parsable: ' + size, 'StorageDataSize');
				return;
			}
			
			var parsedSize = matches[1];
			var unit = StorageDataSize.getUnitOfMeasurement(matches[2]);
			this.bytes = parseInt((parsedSize * unit.multiplier).toFixed());
		}

		return;
	}

	// both argument provided
	if (isNaN(size)){
		gs.warn('Size is not a number: ' + size);
		return;
	}

	var unit = StorageDataSize.getUnitOfMeasurement(unitOfMeasurement);
	this.bytes = parseInt((size * unit.multiplier).toFixed());
};

StorageDataSize.Unit = function(symbol, singular, plural, multiplier) {
	this.symbol = symbol;
	this.singular = singular;
	this.plural = plural;
	this.multiplier = multiplier;
};

StorageDataSize.Unit.prototype.toString = function() {
	return this.symbol;
};

StorageDataSize.Units = {
	B: new StorageDataSize.Unit('B', 'Byte', 'bytes', 1),
	KB: new StorageDataSize.Unit('KB', 'Kilobyte', 'Kilobytes', 1024),
	MB: new StorageDataSize.Unit('MB', 'Megabyte', 'Megabytes', 1048576),
	GB: new StorageDataSize.Unit('GB', 'Gigabyte', 'Gigabytes', 1073741824),
	TB: new StorageDataSize.Unit('TB', 'Terrabyte', 'Terrabytes', 1099511627776),
	PB: new StorageDataSize.Unit('PB', 'Petabyte', 'Petabytes', 1125899906842624)
};

StorageDataSize._OrderedUnits = [
	StorageDataSize.Units.B,
	StorageDataSize.Units.KB,
	StorageDataSize.Units.MB,
	StorageDataSize.Units.GB,
	StorageDataSize.Units.TB,
	StorageDataSize.Units.PB
];

StorageDataSize.getUnitOfMeasurement = function(unitOfMeasurement) {
	if (typeof unitOfMeasurement === 'undefined') {
		gs.logWarning('Unit of measurement not specified','StorageDataSize');
		return StorageDataSize.Units.B;
	}
	else if (unitOfMeasurement instanceof StorageDataSize.Unit)
		return unitOfMeasurement;
	else if (typeof StorageDataSize.Units[unitOfMeasurement] !== 'undefined')
		return StorageDataSize.Units[unitOfMeasurement];

	gs.logWarning('Unrecognized unit of measurement: ' + unitOfMeasurement,'StorageDataSize' );
	return StorageDataSize.Units.B;
};

// 1: size, 2: unit of measurement
StorageDataSize._PARSE_REGEX = /^\s*(\d+(?:\.\d+)?)\s*([\w ]+)\s*$/;

StorageDataSize._extendsFromTable = function(tableName, parentTableName) {
	var heirarchy = GlideDBObjectManager.getTables(tableName);
	return heirarchy.contains(parentTableName);
};

StorageDataSize._getDeviceTable = function(device, defaultTable) {
	if (device instanceof CIData)
		return device.data.sys_class_name;
	else if (typeof Ci !== 'undefined' && device instanceof Ci)
		return device.table;
	else if (device instanceof GlideRecord)
		return JSUtil.notNil(device.sys_class_name) ? device.sys_class_name : device.getRecordClassName();
	else
		return defaultTable;
};

StorageDataSize._getDeviceData = function(device) {
	if (device instanceof CIData)
		return device.data;
	else if (typeof Ci !== 'undefined' && device instanceof Ci)
		return device.data;
	else if (device instanceof GlideRecord)
		return device;
	else
		return device;
};


StorageDataSize.prototype.type = 'StorageDataSize';

StorageDataSize.prototype.to = function(unitOfMeasurement) {
	var unit = StorageDataSize.getUnitOfMeasurement(unitOfMeasurement);
	return this.bytes / unit.multiplier;
};

StorageDataSize.prototype.getBytes = function() {
	return this.bytes;
};

StorageDataSize.prototype.toString = function() {
	var unit = StorageDataSize.Units.B;

	// find largest unit of measurement
	for (var i = StorageDataSize._OrderedUnits.length - 1; i >= 0; --i) {
		unit = StorageDataSize._OrderedUnits[i];
		if (this.bytes > unit.multiplier)
			break;
	}

	// convert to desired unit, rounding to the nearest 1st decimal place
	var converted = (this.bytes / unit.multiplier).toFixed(1);
	return converted + ' ' + unit.toString();
};

/**
 * Applies this data size to the storage device's size.
 * @param (CIData, Ci, or GlideRecord) storageDevice: the storage device, is or extending 'cmdb_ci_storage_device'
 */
StorageDataSize.prototype.applyToStorageDeviceSize = function(storageDevice) {
	var table = StorageDataSize._getDeviceTable(storageDevice, 'cmdb_ci_disk');
	var data = StorageDataSize._getDeviceData(storageDevice);

	// make sure that it's is a storage device
	if (!StorageDataSize._extendsFromTable(table, 'cmdb_ci_storage_device'))
		return;

	// apply to base storage device table
	data.size_bytes = this.getBytes();

	// if table is cmdb_ci_disk, set legacy field
	if (StorageDataSize._extendsFromTable(table, 'cmdb_ci_disk'))
		data.disk_space = this.to(StorageDataSize.Units.GB);
};

/**
 * Applies this data size to the storage volume's size.
 * @param (CIData, Ci, or GlideRecord) storageVolume: the storage volume, is or extending 'cmdb_ci_storage_volume'
 */
StorageDataSize.prototype.applyToStorageVolumeSize = function(storageVolume) {
	var table = StorageDataSize._getDeviceTable(storageVolume, 'cmdb_ci_file_system');
	var data = StorageDataSize._getDeviceData(storageVolume);

	// make sure that it's is a storage volume
	if (!StorageDataSize._extendsFromTable(table, 'cmdb_ci_storage_volume'))
		return;

	// apply to base storage volume table
	data.size_bytes = this.getBytes();
	data.disk_space = this.to(StorageDataSize.Units.GB);	// legacy field

	// if table is cmdb_ci_file_system, set legacy field
	if (StorageDataSize._extendsFromTable(table, 'cmdb_ci_file_system'))
		data.capacity = this.to(StorageDataSize.Units.MB);
};

/**
 * Applies this data size to the storage volume's free space.
 * @param (CIData, Ci, or GlideRecord) storageVolume: the storage volume, is or extending 'cmdb_ci_storage_volume'
 */
StorageDataSize.prototype.applyToStorageVolumeFreeSpace = function(storageVolume) {
	var table = StorageDataSize._getDeviceTable(storageVolume, 'cmdb_ci_file_system');
	var data = StorageDataSize._getDeviceData(storageVolume);

	// make sure that it's is a storage volume
	if (!StorageDataSize._extendsFromTable(table, 'cmdb_ci_storage_volume'))
		return;

	// apply to base storage volume table
	data.free_space_bytes = this.getBytes();

	// if table is cmdb_ci_file_system, set legacy field
	if (StorageDataSize._extendsFromTable(table, 'cmdb_ci_file_system'))
		data.available_space = this.to(StorageDataSize.Units.MB);
};

/**
 * Applies this data size to the storage pool's size.
 * @param (CIData, Ci, or GlideRecord) storagePool: the storage pool, is or extending 'cmdb_ci_storage_pool'
 */
StorageDataSize.prototype.applyToStoragePoolSize = function(storagePool) {
	var table = StorageDataSize._getDeviceTable(storagePool, 'cmdb_ci_storage_pool');
	var data = StorageDataSize._getDeviceData(storagePool);

	// make sure that it's is a storage pool
	if (!StorageDataSize._extendsFromTable(table, 'cmdb_ci_storage_pool'))
		return;

	// apply to base storage pool table
	data.size_bytes = this.getBytes();
	data.disk_space = this.to(StorageDataSize.Units.GB);	// legacy field
};

/**
 * Applies this data size to the storage pool's free space.
 * @param (CIData, Ci, or GlideRecord) storagePool: the storage pool, is or extending 'cmdb_ci_storage_pool'
 */
StorageDataSize.prototype.applyToStoragePoolFreeSpace = function(storagePool) {
	var table = StorageDataSize._getDeviceTable(storagePool, 'cmdb_ci_storage_pool');
	var data = StorageDataSize._getDeviceData(storagePool);

	// make sure that it's is a storage pool
	if (!StorageDataSize._extendsFromTable(table, 'cmdb_ci_storage_pool'))
		return;

	// apply to base storage pool table
	data.free_space_bytes = this.getBytes();
};

/**
 * Applies this data size to the disk partition's size.
 * @param (CIData, Ci, or GlideRecord) diskPartition: the disk partition, is or extending 'cmdb_ci_disk_partition'
 */
StorageDataSize.prototype.applyToDiskPartitionSize = function(diskPartition) {
	var table = StorageDataSize._getDeviceTable(diskPartition, 'cmdb_ci_disk_partition');
	var data = StorageDataSize._getDeviceData(diskPartition);

	// make sure that it's is a disk partition
	if (!StorageDataSize._extendsFromTable(table, 'cmdb_ci_disk_partition'))
		return;

	// apply to base disk partition table
	data.size_bytes = this.getBytes();
};