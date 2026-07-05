const stripScriptTags = (value) => {
  if (typeof value === 'string') return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  if (Array.isArray(value)) return value.map(stripScriptTags);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, stripScriptTags(nested)]));
  }
  return value;
};

export const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = stripScriptTags(req.body);
  if (req.query) req.query = stripScriptTags(req.query);
  if (req.params) req.params = stripScriptTags(req.params);
  next();
};
