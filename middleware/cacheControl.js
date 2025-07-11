// middleware/cacheControl.js

const setCacheControl = (maxAge = 86400, staleWhileRevalidate = 86400) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set(
        'Cache-Control',
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      );
    }
    next();
  };
};

module.exports = setCacheControl;
