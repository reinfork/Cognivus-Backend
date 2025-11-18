const email = require('../config/email');

exports.send = async (req, res) => {
	try{
		await email.sendEmail(
			"modmasterid@gmail.com",
			"Hello World",
			"<h1>Hello from cognivus</h1>"
		);

		res.status(200).json({
			message: "Email sends!"
		})
	} catch (error) {
		res.status(500).json({
			message: "Email not send",
			error
		})
	}
}