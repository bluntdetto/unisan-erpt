'use server'

import prisma from '@lib/prisma';

export const update = async (id, data) => await prisma.property.update({ data, where: { id } });