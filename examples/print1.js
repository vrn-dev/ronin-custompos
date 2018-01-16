const pos = require('../lib');
const moment = require('moment');
const fs = require('fs');

// const printer = new pos.Printer();

const getDateText = moment().format('DD-MM-YYYY');
const getTimeText = moment().format('HH:mm:ss');
const barcode = moment().format('DDMMYYHHmmss');

// printer.connect();

const printJob = new pos.PrintJob();

const printBuilder = printJob
    .setTextFont('A')
    .setTextAlignment('CENTER')
    .setTextBold('ON')
    .setTextUnderline('ON')
    .setTextSize('DOUBLE')
    .text('RoninTech Parking')
    .newLine()
    .setTextBold('OFF')
    .setTextUnderline('OFF')
    .setTextSize('NORMAL')
    .setBarcode(barcode)
    .newLine()
    .newLine()
    .text(getDateText)
    .newLine()
    .text(getTimeText)
    .newLine()
    .newLine()
    .text('1 Hours AED 10')
    .newLine()
    .text('First 15 Minutes Free')
    .newLine()
    .text('Lost Ticket Charge AED 150')
    .newLine()
    .setTextItalic('ON')
    .text('Thank You');

const printData = printBuilder.printData();

// fs.writeFileSync('buffer.txt', printData);

console.log(printData);