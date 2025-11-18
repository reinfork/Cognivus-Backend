const snap = require('../config/midtrans.js');

exports.generate = async (req, res) => {
	try{
		const { email, amount, name } = req.body;
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

		return res.status(200).json({
			success: true,
			redirect_url: transaction.redirect_url,
			token: transaction.token
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
		console.log('raw: ' + notification);
		const status = notification.status;
		const orderid = notification.orderid;

		console.log(status);
		res.status(200).json({
			success: true,
			status
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'midtrans webhook error',
			error
		})
	}
}