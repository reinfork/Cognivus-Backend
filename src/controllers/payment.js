const snap = require('../config/midtrans.js');
const supabase = require('../config/supabase.js');

exports.generate = async (req, res) => {
	try{
		const { email, amount, name, studentid, payment_type } = req.body;
		const orderid = "ORDER-" + Date.now();
		const parameter = {
			transaction_details: {
				order_id: orderid,
				gross_amount: amount
			},
			customer_details: {
				first_name: name,
				email: email
			}
		}

		const transaction = await snap.createTransaction(parameter);

		console.log(transaction);

		// Create initial payment record with pending status
		if (studentid) {
			await supabase
				.from('tbpayment')
				.insert({
					studentid: studentid,
					midtrans_orderid: orderid,
					amount: amount,
					payment_type: payment_type || 'monthly',
					status: 'pending'
				});
		}

		return res.status(200).json({
			success: true,
			redirect_url: transaction.redirect_url,
			token: transaction.token,
			order_id: orderid
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Error generate new midtrans token',
			error
		})
	}
};

exports.webhook = async (req, res) => {
	try{
		const notification = req.body;
		
		const transactionStatus = notification.transaction_status;
		const fraudStatus = notification.fraud_status;
		const orderId = notification.order_id;
		const transactionId = notification.transaction_id;
		const paymentType = notification.payment_type;
		const grossAmount = notification.gross_amount;

		let paymentStatus = 'pending';
		
		if (transactionStatus === 'capture') {
			if (fraudStatus === 'accept') {
				paymentStatus = 'success';
			}
		} else if (transactionStatus === 'settlement') {
			paymentStatus = 'success';
		} else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
			paymentStatus = 'failed';
		} else if (transactionStatus === 'pending') {
			paymentStatus = 'pending';
		}

		// Update payment status in tbpayment
		const { data: existingPayment, error: fetchError } = await supabase
			.from('tbpayment')
			.select('*')
			.eq('midtrans_orderid', orderId);

		if (existingPayment) {
			// Update existing payment
			await supabase
				.from('tbpayment')
				.update({
					status: paymentStatus,
					midtrans_transactionid: transactionId
				})
				.eq('midtrans_orderid', orderId);

			// Log status change
			await supabase
				.from('tbpayment_log')
				.insert({
					paymentid: existingPayment.paymentid,
					old_status: existingPayment.status,
					new_status: paymentStatus,
					raw: notification
				});
		}

		res.status(200).json({
			success: true,
			status: paymentStatus
		});
	} catch (error) {
		console.error('Webhook error:', error);
		res.status(500).json({
			success: false,
			message: 'Midtrans webhook error',
			error
		})
	}
};

// Get payment history for a student
exports.historyByID = async (req, res) => {
	try {
		const { studentid } = req.params;

		const { data, error } = await supabase
			.from('tbpayment')
			.select('*')
			.eq('studentid', studentid)
			.order('created_at', { ascending: false });

		if (error) throw error;

		return res.status(200).json({
			success: true,
			data
		});
	} catch (error) {
		console.error('Error fetching payment history:', error);
		return res.status(500).json({
			success: false,
			message: 'Error fetching payment history',
			error
		});
	}
};

// Get payment history for a student
exports.history = async (req, res) => {
	try {
		const { studentid } = req.params;

		const { data, error } = await supabase
			.from('tbpayment')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;

		return res.status(200).json({
			success: true,
			data
		});
	} catch (error) {
		console.error('Error fetching payment history:', error);
		return res.status(500).json({
			success: false,
			message: 'Error fetching payment history',
			error
		});
	}
};