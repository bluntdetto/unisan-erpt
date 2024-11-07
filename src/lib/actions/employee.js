'use server'


import prisma from '@lib/prisma';
import { Role } from '@prisma/client';
import { hash } from '@utils/hashing';

export const get = async () => {
    return prisma.user.findMany({
        where: { role: Role.EMPLOYEE }
    })
}

export const create = async (data) => {
    return prisma.user.create({
        data: {
            ...data,
            password: await hash(data.password),
            role: Role.EMPLOYEE
        }
    })
}

export const update = async (data) => {
    const { id, ...user } = data;

    return prisma.user.update({
        where: { id },
        data: {
            ...user,
            password: await hash(user.password)
        }
    })
}

export const deleteEmployee = async (id) => {
    return prisma.user.delete({
        where: { id }
    })
}

