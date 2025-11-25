const snap = require('../config/midtrans.js');
const supabase = require('../config/supabase.js');
const { getStatus } = require('../helper/payment_status');

//generate midtrans token
exports.generate = async (req, res) => {
	try{
		const { email, amount, name, studentid, payment_type } = req.body;

		//idempotent check
		const { data: paymentData, error} = await supabase
			.from('tbpayment')
			.select()
			.match({ studentid, status: 'pending'})
			.limit(1);

		if (paymentData.length !== 0) {
			return res.status(200).json({
				success: false,
				message: 'reuse existing pending payment',
				redirect_url: paymentData[0].link,
				order_id: paymentData[0].midtrans_orderid,
				token: paymentData[0].token
			});
		};

		const orderid = "LMS-" + Date.now();
		const parameter = {
			transaction_details: {
				order_id: orderid,
				gross_amount: amount
			},
			customer_details: {
				first_name: name,
				email: email
			}
		};

		const transaction = await snap.createTransaction(parameter);

		// Create initial payment record with pending status
		if (studentid) {
			const { data: insertData, error: insertError } = await supabase
				.from('tbpayment')
				.insert({
					studentid: studentid,
					midtrans_orderid: orderid,
					amount: amount,
					payment_type: payment_type,
					status: 'pending',
					link: transaction.redirect_url,
					token: transaction.token
				});
			if(insertError) throw insertError;
		}

		return res.status(200).json({
			success: true,
			redirect_url: transaction.redirect_url,
			token: transaction.token,
			orderid
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

		const { data, error } = await supabase
			.from('tbpayment')
			.select()
			.eq('midtrans_orderid', orderId)
			.single();

		if (error) throw error;

		if (data) {
			const { data: updateData, error: updateError } = await supabase
				.from('tbpayment')
				.update({
					status: paymentStatus,
					midtrans_transactionid: transactionId
				})
				.eq('midtrans_orderid', orderId);
			if (updateError) throw updateError;

			const { data: logData, error: logError } = await supabase
				.from('tbpayment_log')
				.insert({
					paymentid: data.paymentid,
					old_status: data.status,
					new_status: paymentStatus,
					raw: notification
				});
			if (logError) throw logError;
		}

		res.status(200).json({
			success: true,
			status: paymentStatus
		});
	} catch (error) {
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

// Get payment all history
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

//re-check latest midtrans status by studentID
exports.refreshStudentID = async (req, res) => {
	try{
		const { studentid } = req.params;

		//idempotent check
		const { data, error} = await supabase
			.from('tbpayment')
			.select()
			.match({ studentid, status: 'pending'})
			.order('created_at', {ascending: false});

		if (error) throw error;

		if (Array.isArray(data) && data.length === 0) {
			return res.status(200).json({
				success: true,
				message: 'no pending payments recorded'
			});
		};

		//call midtrans endpoint to each pending row for refresh its payment status
		for (const [index, element] of data.entries()) {
			try{
				const status = await getStatus(element.midtrans_orderid);

				if (!status || typeof status !== 'object'){
					throw new Error('Invalid response from Midtrans');
				};

				const transactionStatus = status.transaction_status;
				const orderId = status.order_id;
				const transactionId = status.transaction_id;

				console.log(element.midtrans_orderid);
				console.log(status);

				if (transactionStatus === element.status){
					return;
				}

				const { data: insertData, error: insertError } = await supabase
					.from('tbpayment')
					.update({
						status: transactionStatus,
						midtrans_transactionid: transactionId
					})
					.eq('midtrans_orderid', orderId);
				if(insertError) throw insertError;

				const { data: logData, error: logError } = await supabase
					.from('tbpayment_log')
					.insert({
						paymentid: element.paymentid,
						old_status: element.status,
						new_status: transactionStatus,
						raw: status
					});
				if (logError) throw logError;

			} catch (error) {
				return res.status(500).json({
					success: false,
					message: `error send request on orderID: ${element?.midtrans_orderid ?? index}`,
					error: error.message
				})
			}
		};

		return res.status(200).json({
			success: true,
			message: 'status updated'
		});

	} catch(error) {
		return res.status(500).json({
			success: false,
			message: 'Error refreshing payment status'
		});
	};
};