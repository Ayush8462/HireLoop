export const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!result.success) {
            next(result.error);
            return;
        }
        req.body = result.data.body;
        next();
    };
};
//# sourceMappingURL=validate.middleware.js.map