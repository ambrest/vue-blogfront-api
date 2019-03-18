const sharp = require('sharp');
const {Readable, Writable} = require('stream');
const PngQuant = require('pngquant');

module.exports = base64dec => new Promise(async (resolve, reject) => {

    // Restrict size
    if (base64dec.length > 10000000) {
        reject('Image too big. Try a smaller one.');
    }

    // Remove meta data
    const metaDataEnd = base64dec.indexOf(',') + 1;
    const base64part = metaDataEnd ? base64dec.substring(metaDataEnd) : base64dec;

    if (base64part) {

        // Resize and convert to png
        const buffer = await sharp(Buffer.from(base64part, 'base64'))
            .resize(240, 240, {fit: 'cover'})
            .png({force: true})
            .toBuffer().catch(() => reject('Can\'t process image. Try another one.'));

        if (buffer) {

            // Move into readable stream
            const readable = new Readable();
            readable._read = () => undefined;
            readable.push(buffer);
            readable.push(null);

            // Byte buffer
            const writable = new Writable();
            let writableByteBuffer = [];

            writable.on('error', reject);

            writable.on('finish', () => {

                // Convert back to base64 and resolve
                resolve(Buffer.from(writableByteBuffer).toString('base64'));
            });

            writable._write = (chunk, _, callback) => {
                writableByteBuffer.push(...chunk);
                callback();
            };

            // Pipe initial image to PngQuant and into consumer stream
            readable.pipe(new PngQuant([240, '--quality', '90', '--nofs', '-'])).pipe(writable);
        } else {
            reject('Can\'t process image');
        }
    } else {
        reject('Can\'t process image');
    }
});
