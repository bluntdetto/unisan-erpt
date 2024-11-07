"use server";

import prisma from "@lib/prisma";
import { PaymentStatus } from "@prisma/client";

export const all = async (filter = {}) => {
    let where = {
        ...filter,
        status: PaymentStatus.PAID
    };

    if (filter.status === "All")
        delete where.status;

    return prisma.transaction.findMany({
        where: { ...where },
        include: {
            paymentsCovered: {
                include: {
                    property: true
                }
            },
            user: true
        },
        orderBy: { createdAt: "desc" }
    });
};

export const create = async (data) => await prisma.transaction.create({ data });

export const update = async (id, data) => await prisma.transaction.update({
    data,
    where: { id },
    include: {
        paymentsCovered: {
            include: { property: true }
        }
    }
});
