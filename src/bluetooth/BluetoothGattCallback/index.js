// https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback

//const BluetoothGattCallback = Java.use("h.a.j.a.a");
//const BluetoothGattCallback = Java.use("com.garmin.device.ble.a");
const BluetoothGattCallback = Java.use("d.j.e.a.h");

const BluetoothGattCharacteristic = Java.use("android.bluetooth.BluetoothGattCharacteristic");
const BluetoothGattService = Java.use("android.bluetooth.BluetoothGattService");

// const String = Java.use("java.lang.String");

const buffersIn = {};
const buffers = {};

const onCharacteristicRead = BluetoothGattCallback.onCharacteristicRead;
const onCharacteristicWrite = BluetoothGattCallback.onCharacteristicWrite;
const onCharacteristicChanged = BluetoothGattCallback.onCharacteristicChanged;

const size = 16;

var Color = {
    RESET: "\x1b[39;49;00m", Black: "0;01", Blue: "4;01", Cyan: "6;01", Gray: "7;11", Green: "2;01", Purple: "5;01", Red: "1;01", Yellow: "3;01",
    Light: {
	Black: "0;11", Blue: "4;11", Cyan: "6;11", Gray: "7;01", Green: "2;11", Purple: "5;11", Red: "1;11", Yellow: "3;11"
    }
};

/**
 *
 * @param input. 
 *      If an object is passed it will print as json 
 * @param kwargs  options map {
 *     -l level: string;   log/warn/error
 *     -i indent: boolean;     print JSON prettify
 *     -c color: @see ColorMap
 * }
 */
var LOG = function (input, kwargs) {
    kwargs = kwargs || {};
    var logLevel = kwargs['l'] || 'log', colorPrefix = '\x1b[3', colorSuffix = 'm';
    if (typeof input === 'object')
        input = JSON.stringify(input, null, kwargs['i'] ? 2 : null);
    if (kwargs['c'])
        input = colorPrefix + kwargs['c'] + colorSuffix + input + Color.RESET;
    console[logLevel](input);
};

var printBacktrace = function () {
    Java.perform(function() {
        var android_util_Log = Java.use('android.util.Log'), java_lang_Exception = Java.use('java.lang.Exception');
        // getting stacktrace by throwing an exception
        LOG(android_util_Log.getStackTraceString(java_lang_Exception.$new()), { c: Color.Gray });
    });
};

const pad = function(data, size) {
	if (data.length < size) {
		data += new Array(size - data.length + 1).map(() => "").join(" ");
	}

	return data;
};

const logBinary = function(data) {
	if (data.length == 0) {
		return;
	}

	const packet = data.slice(0, size);

	data = data.slice(size);

	const packetHex = packet.map(num => (num & 0xFF).toString(16));

	const packetPlain = packet.map(num => {
		if (num < 1 || num > 127) {
			return ".";
		}

		try {
			return String.fromCharCode(num) || ".";
		} catch (e) {
			return ".";
		}
	});

	console.log(
		`\t${pad((packet).join(" "), 54)} \t| ${pad(packetHex.join(" "), 54)} \t| ${pad(packetPlain.join(" "), 54)}`
	);

	logBinary(data);
};

onCharacteristicRead.implementation = function(gatt, characteristic, status) {
	console.log(1);
	const value = BluetoothGattCharacteristic.getValue.call(characteristic);

	console.log(value);

	onCharacteristicRead.call(this, gatt, characteristic, status);
};

onCharacteristicChanged.implementation = function(gatt, characteristic) {
	console.log(2);
	const value = BluetoothGattCharacteristic.getValue.call(characteristic);

	const buffer = Java.array("byte", value);

	const uuid = BluetoothGattCharacteristic.getUuid.call(characteristic);
        const service = BluetoothGattCharacteristic.getService.call(characteristic);
        const serviceUuid = BluetoothGattService.getUuid.call(service);

	const packet = [];

	if (buffersIn[uuid] === undefined) {
		buffersIn[uuid] = [];
	}

	for (var i = 0; i < buffer.length; ++i) {
		packet.push(buffer[i]);
	}

	console.log(`Characteristic ${uuid} of service ${serviceUuid} changed`);
	logBinary(packet);

	buffersIn[uuid].push(packet);

	onCharacteristicChanged.call(this, gatt, characteristic);
};

onCharacteristicWrite.implementation = function(gatt, characteristic, status) {
	console.log(3);
	const value = BluetoothGattCharacteristic.getValue.call(characteristic);

	const buffer = Java.array("byte", value);

	const uuid = BluetoothGattCharacteristic.getUuid.call(characteristic);
        const service = BluetoothGattCharacteristic.getService.call(characteristic);
        const serviceUuid = BluetoothGattService.getUuid.call(service);

	const packet = [];

	if (buffers[uuid] === undefined) {
		buffers[uuid] = [];
	}

	for (var i = 0; i < buffer.length; ++i) {
		packet.push(buffer[i]);
	}

	buffers[uuid].push(packet);

	console.log(`Characteristic ${uuid} of service ${serviceUuid} written`);
	logBinary(packet);

	printBacktrace();

	onCharacteristicWrite.call(this, gatt, characteristic, status);
};

module.exports = {};

