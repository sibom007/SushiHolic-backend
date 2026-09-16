import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../config';

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
    const token = jwt.sign(
        payload,
        secret,
        {
            algorithm: 'HS256',
            expiresIn
        }
    );

    return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const generateUserTokens = (user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
}) => {
  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.accesToken_secret as Secret,
    config.accesToken_secret_exparein!,
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.refreshToken_secret as Secret,
    config.refreshToken_secret_exparein!,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};


