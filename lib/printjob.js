const iconv = require('iconv-lite');
const c = require('./custom-commands');
const posUtils = require('./utils');

const PrintJob = function () {
    this._queue = [];
};

PrintJob.prototype = {

    text(text) {
        this._queue.push(iconv.encode(text, 'utf8'));
        return this;
    },

    newLine(count) {
        count = count || 1;
        const buf = Buffer.from(c.LF);
        for ( let i = 0; i < count; i++ )
            this._queue.push(buf);

        return this;
    },

    setTextSize(size) {
        size = size.toUpperCase() || 'NORMAL';

        const sizes = {
            NORMAL: c.TEXT.SIZE.NORMAL,
            DOUBLE: c.TEXT.SIZE.DOUBLE
        };

        const cmd = sizes[ size ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Text size must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;
    },

    setTextUnderline(state) {
        state = state.toUpperCase() || 'OFF';

        const states = {
            ON: c.TEXT.UNDERLINE.ON,
            DOUBLE: c.TEXT.UNDERLINE.DOUBLE,
            OFF: c.TEXT.UNDERLINE.OFF
        };

        const cmd = states[ state ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Text underline must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;

    },

    setTextBold(state) {
        state = state.toUpperCase() || 'OFF';

        const states = {
            ON: c.TEXT.BOLD.ON,
            OFF: c.TEXT.BOLD.OFF
        };

        const cmd = states[ state ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Text bold must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;

    },

    setTextItalic(state) {
        state = state.toUpperCase() || 'OFF';

        const states = {
            ON: c.TEXT.ITALIC.ON,
            OFF: c.TEXT.ITALIC.OFF
        };

        const cmd = states[ state ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Text italic must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;

    },

    setTextFont(type) {
        type = type.toUpperCase() || 'A';

        const types = {
            A: c.TEXT.FONT.A,
            B: c.TEXT.FONT.B
        };

        const cmd = types[ type ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Text font must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;

    },

    setTextAlignment(align) {
        align = align.toUpperCase() || 'CENTER';

        const alignments = {
            LEFT: c.TEXT.ALIGN.LEFT,
            CENTER: c.TEXT.ALIGN.CENTER,
            RIGHT: c.TEXT.ALIGN.RIGHT
        };

        const cmd = alignments[ align ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Text alignment must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;

    },

    cut(cut) {
        cut = cut.toUpperCase() || 'FULL';

        const cuts = {
            FULL: c.CUT.FULL,
            PARTIAL: c.CUT.PARTIAL
        };

        const cmd = cuts[ cut ];

        if ( cmd ) {
            const buf = Buffer.from(cmd);
            this._queue.push(buf);
        }
        else {
            throw new Error('Paper cuts must be one of: ' + Object.keys(sizes).join(', '));
        }

        return this;
    },

    setBarcode(code) {
        if ( code.length > 12 )
            throw new Error('EAN13 cannot be more than 12 digits');

        const checkSum = posUtils.getEAN13CheckSum(code);
        const barcode = iconv.encode(code + checkSum, 'utf8');

        // width + height + font + HRI + type + DATA + checksum + end
        const width = c.BARCODE.DIMS.WIDTH;
        const height = c.BARCODE.DIMS.HEIGHT;
        const font = c.BARCODE.FONT.A;
        const hri = c.BARCODE.HRI.BELOW;
        const type = c.BARCODE.TYPE.EAN13;
        const end = c.BARCODE.DATA_END;

        const data = width.concat(height, font, hri, type, barcode, end);

        if ( data ) {
            const buf = Buffer.from(data);
            this._queue.push(buf);
        } else {
            throw new Error('Error constructing barcode');
        }

        return this;
    },


    printData() {
        const init = Buffer.from(c.INIT);

        const queue = this._queue.slice(0);
        queue.unshift(init);

        return Buffer.concat(queue);
    }
};

module.exports = PrintJob;