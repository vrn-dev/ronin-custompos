const pos = require('../lib');
const printJob = new pos.PrintJob();
const moment = require('moment');

const getDateText = moment().format('DD-MM-YYYY');
const getTimeText = moment().format('HH:mm:ss');
const barcode = moment().format('DDMMYYHHmmss');

exports.ticketData = function () {
    return printJob
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
};