'use strict';
const _ = require('lodash');
// const Gpio = require('pigpio').Gpio;
const Gpio = require('./pigpio_temp').Gpio;
const Pos = require('./lib');
// const PrintJob = new Pos.PrintJob();
const Printer = new Pos.Printer();


const LoopWatcher = require('./utils/loop-watcher');
const ticket = require('./utils/print-ticket');


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

const entryLoopActive = new LoopWatcher();
const exitLoopActive = new LoopWatcher();

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
    Printer.connect();
    Printer.print(ticketData);
    EntryGate.trigger(100, 1);
}

function saveTicket() {
    //save to DB
}


process.on('SIGINT', function () {
    Printer.disconnect();
    console.log('exiting');
});
