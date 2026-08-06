const { extendForPayment } = require('../helper/validity.js')

exports.grantValidity = async (req, row, newStatus) => {
	if (!row || row.status === 'success' || newStatus !== 'success') return;

	try {
		await extendForPayment(row.studentid, row.payment_type);
	} catch (error) {
		req.log.error(
			{ reqId: req.id, paymentid: row.paymentid, studentid: row.studentid, error },
			'Failed to extend class validity after successful payment'
		);
	}
};