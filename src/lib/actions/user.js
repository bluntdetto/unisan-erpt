"use server";

import prisma from "@lib/prisma";
import { Role } from "@prisma/client";

export const create = (user) => {
    const { properties } = user;
    return prisma.user.create({
        data: {
            ...user,
            properties: {
                createMany: {
                    data: properties.map((property) => ({
                        ...property,
                        assessedValue: parseFloat(property.assessedValue),
                    })),
                },
            },
            role: Role.USER,
        },
        include: { properties: true },
    });
};

export const all = () => {
    return prisma.user.findMany({
        where: { role: Role.USER },
        include: { properties: true },
    });
};

export const deleteUser = (email) => {
    return prisma.user.delete({
        where: { email },
        include: { properties: true },
    });
};

export const get = (id) => {
    return prisma.user.findUnique({
        where: { id },
        include: { properties: true },
    });
};

export const update = (id, user) => {
    return prisma.user.update({
        where: { id },
        data: {
            name: user.name,
            email: user.email,
            properties: {
                deleteMany: {},
                createMany: {
                    data: user.properties.map((property) => {
                        delete property.userId;

                        return {
                            ...property,
                            lastPaymentDate: property.lastPaymentDate
                                ? property.lastPaymentDate
                                : null,
                            assessedValue: parseFloat(property.assessedValue),
                        };
                    }),
                },
            },
        },
        include: { properties: true },
    });
};
