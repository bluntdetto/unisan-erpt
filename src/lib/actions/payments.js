"use server";

import prisma from "@lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { auth } from "@lib/auth";

const all = async (filter) => {
    const where = {};
    const { user } = (await auth()) || {};

    if (filter !== "All") where.status = filter.toUpperCase();

    return prisma.paymentDue.findMany({
        where: { ...where, property: { userId: user.id } },
        include: {
            transaction: true,
            property: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const get = async (id) =>
    prisma.paymentDue.findUnique({
        where: { id },
        include: {
            transaction: true,
            property: true,
        },
    });

export const update = async (id, data) =>
    prisma.paymentDue.update({
        where: { id },
        data,
    });

export const getLastPayment = async (propertyId) => {
    return prisma.paymentDue.findFirst({
        where: {
            propertyId,
            status: PaymentStatus.PAID,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export { all };
