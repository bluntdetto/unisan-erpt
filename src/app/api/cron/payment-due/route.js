import prisma from "@lib/prisma";
import { getQuarter, getQuarterStart } from "@utils/date";
import {
    computeAdvanceDiscount,
    computeLatePaymentTax,
    computeQuarterDiscount,
} from "@utils/computation";
import { paymentNotification } from "@utils/notification";
import { NotificationType, PaymentStatus } from "@prisma/client";
import { format } from "date-fns";

export const POST = async (_req) => {
    const properties = await prisma.property.findMany();
    const year = new Date().getFullYear();
    const quarter = getQuarter();

    for (const property of properties) {
        for (let i = 1; i <= 4; i++) {
            const referenceNumber = (
                new Date().getTime() + Math.floor(Math.random() * 1000)
            ).toString();

            const exists = await prisma.paymentDue.findFirst({
                where: {
                    OR: [
                        { referenceNumber },
                        { propertyId: property.id, year, quarter: i },
                    ],
                },
            });

            if (exists) continue;

            let notify = false;

            if (i < quarter) continue;

            let tax = computeQuarterDiscount(property.assessedValue);

            // current year -> current year (2024) quarter discounts lalabas and the next year (2025)

            // if owner did not pay year (2025)
            // next year -> next yr (2025) quarter discounts and next next year advance (2026)

            // if the owner paid year (2025)
            // next year -> next year advance (2026

            const data = {
                referenceNumber,
                ...tax,
                propertyId: property.id,
                quarter: i,
                year,
            };

            const due = await prisma.paymentDue.create({ data });

            if (!notify) continue;

            let notification = paymentNotification(
                "due",
                property.taxDeclarationNumber,
                i,
                tax.total,
                format(getQuarterStart(year, i + 1), "MMMM dd, yyyy")
            );

            await prisma.notification.create({
                data: {
                    type: NotificationType.WARNING,
                    userId: property.userId,
                    paymentDueId: due.id,
                    message: notification,
                },
            });
        }

        const referenceNumber = new Date().getTime().toString() + "adv";
        // Removed random number to be used to check to the current year
        // and the year when the due was made
        // (Gets used to check if the advance payment should be deleted or not in the PUT request)

        const advExists = await prisma.paymentDue.findFirst({
            where: { propertyId: property.id, year: year + 1, quarter: 1 },
        });

        if (advExists) continue;

        const advance = computeAdvanceDiscount(property.assessedValue);

        const data = {
            ...advance,
            referenceNumber,
            propertyId: property.id,
            quarter: 1,
            year: year + 1,
        };

        await prisma.paymentDue.create({ data });
    }

    return Response.json({ message: "Payment Dues created" });
};

export const PUT = async (_req) => {
    const properties = await prisma.property.findMany();
    const quarter = getQuarter();
    const year = new Date().getFullYear();

    for (const property of properties) {
        let dues = await prisma.paymentDue.findMany({
            where: { propertyId: property.id },
        });

        dues = dues.filter(
            (dues) =>
                dues.status === PaymentStatus.PENDING ||
                dues.status === PaymentStatus.UNPAID
        );

        // TODO: Verify if this logic is correct
        let minYear = Math.min(...dues.map((due) => due.year));

        for (const due of dues) {
            const reference = due.referenceNumber;

            if (reference.includes("adv")) {
                const dueD = new Date(
                    Number.parseInt(reference.replace("adv", "")) // Reference number used as date check
                );

                if (dueD.getFullYear() < year)
                    await prisma.paymentDue.delete({ where: { id: due.id } });

                continue;
            }

            if (due.year === year && due.quarter === quarter) {
                await prisma.paymentDue.update({
                    where: { id: due.id },
                    data: {
                        ...computeQuarterDiscount(property.assessedValue),
                    },
                });
                continue;
            }

            if (
                minYear === year ||
                (due.year === year && due.quarter >= quarter) ||
                reference.includes("adv")
            )
                continue;

            const dueMonths = minYear * 12 + due.quarter * 3;
            const currentMonths = year * 12 + quarter * 3;

            const monthsLate = Math.abs(currentMonths - dueMonths) + 1;

            const updatedDue = await prisma.paymentDue.update({
                where: { id: due.id },
                data: {
                    status: PaymentStatus.UNPAID,
                    ...computeLatePaymentTax(
                        property.assessedValue,
                        monthsLate
                    ),
                },
            });

            const notification = paymentNotification(
                "late",
                property.taxDeclarationNumber,
                updatedDue.quarter,
                updatedDue.total,
                null
            );

            await prisma.notification.create({
                data: {
                    type: NotificationType.DANGER,
                    userId: property.userId,
                    paymentDueId: updatedDue.id,
                    message: notification,
                },
            });
        }
    }

    return Response.json({ message: "Payment Dues updated" });
};
