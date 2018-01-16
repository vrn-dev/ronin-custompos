'use strict';
const usb = require('usb');
const util = require('util');
const events = require('events');

const IFACE_CLASS = {
    AUDIO: 0x01,
    HID: 0x03,
    PRINTER: 0x07,
    HUB: 0x09
};

let Printer = function (vendorId, productId) {
    this._vendorId = vendorId;
    this._productId = productId;
    this._usbEndpoint = undefined;
    this._device = undefined;

    const self = this;
    if ( vendorId && productId ) {
        this._device = usb.findByIds(vendorId, productId);
    } else if ( vendorId ) {
        this._device = vendorId;
    } else {
        let devices = Printer.findPrinter();
        if ( devices && devices.length ) {
            this._device = devices[ 0 ];
        }
    }
    if ( !this._device )
        throw new Error('Cannot find printer');
};

Printer.findPrinter = () => {
    return usb.getDeviceList()
        .filter(device => {
            try {
                return device.configDescriptor.interfaces
                    .filter(iface => {
                        return iface
                            .filter(config => {
                                return config.bInterfaceClass === IFACE_CLASS.PRINTER;
                            }).length;
                    }).length;
            } catch ( err ) {
                console.error(err);
                return false;
            }
        });
};

util.inherits(Printer, events.EventEmitter);

Printer.prototype.connect = (vendorId, productId, usbEndpoint, callback) => {
    const self = this;
    vendorId = vendorId || this._vendorId;
    productId = productId || this._productId;

    const device = this._device;
    device.open();

    const iface = device.interfaces[ 0 ];

    if ( iface.isKernelDriverActive() ) {
        try {
            iface.detachKernelDriver();
        } catch ( err ) {
            console.error('[ERROR] Could not detach kernel driver: %s', e);
        }
    }

    iface.claim();
    iface.endpoints
        .filter(endpoint => {
            if ( endpoint.direction === 'out' && !self.endpoint )
                self._usbEndpoint = endpoint || usbEndpoint;
        });
    if ( callback )
        callback();

    this.emit('connect');
};

Printer.prototype.disconnect = (callback) => {
    const self = this;
    callback = callback || function () {
    };
    this._device.interfaces[ 0 ].release((error) => {
        if ( error ) {
            if ( callback )
                callback(error);
            self.emit('error', error);
        } else {
            self._device.interfaces[ 0 ].attachKernelDriver();
            self._device.close();
            self._device = undefined;
            if ( callback )
                callback();
            self.emit('disconnect');
        }
    });
};

Printer.prototype.print = (printJob, callback) => {
    const printer = this._device.interfaces[ 0 ].endpoint(this._usbEndpoint);
    const printData = printJob.printData();

    // const packets = [];
    // const packetCount = Math.ceil(printData.length / packetSize);
    //
    // for ( let i = 0; i < packetCount; i++ ) {
    //     let packet = Buffer.alloc(packetSize);
    //     packet.fill(' ');
    //
    //     printData.copy(packet, 0, i * packetSize, (i + 1) * packetSize);
    //     packets.push(packet);
    // }

    printer.transfer(printData, (err) => {
        if ( err )
            console.error(err);
    });

    printer.once('end', () => {
        if ( callback )
            callback();
        self.emit('print');
    });
};

module.exports = Printer;