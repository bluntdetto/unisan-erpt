import { generateToken, verifyToken } from "@utils/jwt";
import crypto from "crypto";

export const generateAccessToken = (payload) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET not found");
    }

    if (!process.env.ACCESS_TOKEN_EXPIRY) {
        throw new Error("ACCESS_TOKEN_EXPIRY not found");
    }

    return generateToken(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRY
    );
};

export const verifyAccessToken = async (token) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET not found");
    }

    try {
        return await verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        return undefined;
    }
};

export const generateRandomToken = () => crypto.randomBytes(32).toString("hex");

export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export function generatePageToken(token) {
    const userJson = JSON.stringify(token);

    return Buffer.from(userJson).toString("base64");
}

export function parsePageToken(token) {
    try {
        const userJson = Buffer.from(token, "base64").toString("ascii");

        return JSON.parse(userJson);
    } catch (err) {
        return undefined;
    }
}

export function generateCouponCode(length = 10) {
    const chars = "AaBbCcDdEeFfGgHhJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz1234567890";
    let coupon = "";

    for (let i = 0; i < length; i++) {
        coupon += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return coupon;
}
