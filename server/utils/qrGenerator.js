const QRCode = require('qrcode');

class QRGenerator {
    async generateQRCodeBase64(data) {
        try {
            const qrCode = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 300
            });
            return qrCode;
        } catch (error) {
            console.error('QR generation error:', error);
            throw error;
        }
    }
}

module.exports = new QRGenerator();