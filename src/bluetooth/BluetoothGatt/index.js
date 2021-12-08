const devices = require("../BluetoothDevice");

const BluetoothGatt = Java.use("android.bluetooth.BluetoothGatt");
const BluetoothGattService = Java.use("android.bluetooth.BluetoothGattService");

const getDevice = BluetoothGatt.getDevice;
const getServices = BluetoothGatt.getServices;

getDevice.implementation = function() {
	console.log(8);
	const device = getDevice.call(this);

	devices.getDeviceInfo(device);

	return device;
};

getServices.implementation = function() {
	console.log(9);
	const services = getServices.call(this);

	const iter = services.iterator();

	while (iter.hasNext()) {
		const service = iter.next();

		console.log(BluetoothGattService.getUuid.call(service));
	}

	return services;
};

module.exports = {};
