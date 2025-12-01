const { v4: uuid } = require('uuid');

exports.requestID = ( req, res, next ) => {
	req.id = req.headers['x-request-id'] || uuid();
	res.setHeader('x-request-id', req.id);
	next();
};