const pos = require('../lib');
const moment = require('moment');
const Printer = new pos.Printer();
const PrintJob = new pos.PrintJob();

Printer.connect();
const getDateText = moment().format('DD-MM-YYYY');
const getTimeText = moment().format('HH:mm:ss');
const barcode12 = moment().format('DDMMYYHHmmss');

//const barcode13 = utils.getEAN13CheckSum(barcode12).toString();

const printJob = PrintJob
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
    .setBarcode(barcode12)
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

Printer.print(printJob);
Printer.disconnect();