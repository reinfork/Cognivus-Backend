exports.validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'failed to validate input'
        });
    }
    req.body = value;
    next();
};