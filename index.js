'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
// const Gpio = require('pigpio').Gpio;
const PiGpio = require('./pigpio_temp');
const Gpio = PiGpio.Gpio;
const Pos = require('./lib');
// const PrintJob = new Pos.PrintJob();
const Printer = new Pos.Printer();


const LoopWatcher = require('./utils/loop-watcher');
const ticket = require('./utils/print-ticket');
const Ticket = require('./models/ticket-model');

PiGpio.initialize();
// SIGINT HANDLER //
process.on('SIGINT', () => {
    console.log('Received SIGINT.  Press Control-D to exit.');
});

function handle() {
    PiGpio.terminate();
    Printer.disconnect();
    console.log('Terminating ....');
}

// SIGINT HANDLER //

const EntryLoop = new Gpio(5, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
});

const EntryGate = new Gpio(19, {
    mode: Gpio.OUTPUT,
    alert: true
});

const TicketButton = new Gpio(6, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.RISING_EDGE,
});

const ExitLoop = new Gpio(13, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
});

mongoose.connect('mongodb://192.168.1.2:27017/bayTrans_v004', { useMongoClient: true });
mongoose.Promise = global.Promise;

const entryLoopActive = new LoopWatcher();
const exitLoopActive = new LoopWatcher();

let thisBarcode = undefined;
let thisIssuedAt = undefined;

console.log('Ticket Printer Module Acitve. Waiting for inputs....');

EntryLoop.on('interrupt', _.debounce((level) => {
    if ( level === 1 )
        entryLoopActive.isActive = true;
    else if ( level === 0 )
        entryLoopActive.isActive = false;
}, 500));

ExitLoop.on('interrupt', _.debounce((level) => {
    if ( level === 1 )
        exitLoopActive.isActive = true;
    else if ( level === 0 )
        exitLoopActive.isActive = false;
    if ( !entryLoopActive )
        saveTicket();
    if ( !entryLoopActive && !exitLoopActive )
        EntryGate.trigger(100, 1)
}, 500));

TicketButton.on('interrupt', _.debounce((level) => {
    if ( level === 1 && entryLoopActive.isActive )
        printTicket();
}, 500));

function printTicket() {
    const ticketData = ticket.ticketData();
    const printJobData = ticketData.printJob;
    thisBarcode = ticketData.barcode;
    thisIssuedAt = moment(ticketData.issuedAt, 'DDMMYYHHmmss');
    Printer.connect();
    Printer.print(printJobData);
    EntryGate.trigger(100, 1);
}

function saveTicket() {
    const newTicket = new Ticket({
        _id: thisBarcode,
        issuedAt: thisIssuedAt
    });

    newTicket.save()
        .then(result => {
            thisBarcode = undefined;
            thisIssuedAt = undefined;
        })
        .catch(err => console.error(err))
}

