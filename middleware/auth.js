// middleware/auth.js
const basicAuth = (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Access to API"');
        return res.status(401).json({ message: 'Authentication required' });
    }

    const [scheme, credentials] = auth.split(' ');

    if (scheme !== 'Basic' || !credentials) {
        return res.status(400).json({ message: 'Invalid authentication format' });
    }

    const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (
        username === process.env.API_USERNAME &&
        password === process.env.API_PASSWORD
    ) {
        return next();
    } else {
        return res.status(403).json({ message: 'Invalid credentials' });
    }
};

module.exports = basicAuth;
