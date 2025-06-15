const jwt = require('jsonwebtoken');
// is ko dhiko 
// const { JWT_SECRET } = process.env;
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt. verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
}

module.exports = authenticateJWT;