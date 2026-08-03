exports.normalize = (transactionStatus) => {
	let paymentStatus;

	if (transactionStatus === 'capture') {
		paymentStatus = 'success';
	} else if (transactionStatus === 'settlement') {
		paymentStatus = 'success';
	} else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
		paymentStatus = 'failed';
	} else if (transactionStatus === 'pending') {
		paymentStatus = 'pending';
	} else if (transactionStatus === 'expire' || transactionStatus === 'expired') {
		paymentStatus = 'expired';
	}

	return paymentStatus;
}