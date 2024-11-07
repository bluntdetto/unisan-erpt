"use server";

import prisma from "@lib/prisma";

export const getByUserId = async (userId) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
};

export const create = async (data) => await prisma.notification.create({ data });


export const markAsRead = async (id) => {
    return prisma.notification.update({
        where: { id },
        data: { unread: false }
    });
};
