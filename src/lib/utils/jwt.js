import { sign, verify } from "jsonwebtoken";

export const generateToken = (payload, secret, expiresIn) => {
    return sign(payload, secret, {
        expiresIn,
    });
};

export const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        try {
            verify(token, secret, (err, decoded) => {
                if (err || !decoded) {
                    return reject(err);
                }
                const userDecoded = decoded;
                const userSession = {
                    id: userDecoded.id,
                    email: userDecoded.email,
                    name: userDecoded.name,
                    phone: userDecoded.phone,
                    role: userDecoded.role,
                };
                resolve(userSession);
            });
        } catch (err) {
            reject(err);
        }
    });
};
