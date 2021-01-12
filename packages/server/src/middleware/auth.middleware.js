import jwt from 'jsonwebtoken';

export const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      return res.status(401).send('You need to Login');
    }
    const data = await jwt.verify(token, process.env.JWT_TOKEN);
    req.user = data;
    next();
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

export const verifyAdmin = async (req, res, next) => {
  if (req.user.isAdmin) next();
  else return res.sendStatus(403);
};
