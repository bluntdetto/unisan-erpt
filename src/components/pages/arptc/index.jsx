"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";

import { ARPTCDocument } from "@components/common/arptc-document";
import { ARPTCDocumentSEF } from "@components/common/arptc-document-sef";
import { all } from "@src/lib/actions/transaction";
import { format } from 'date-fns';
import { computeQuaterDiscountNoSef } from "@src/lib/utils/computation";

const Arptc = () => {
    const [ filter, setFilter ] = useState("All");
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ selectedMonth, setSelectedMonth ] = useState(new Date().getMonth() + 1);
    const [ selectedYear, setSelectedYear ] = useState(new Date().getFullYear());
    const [ reports, setReports ] = useState([]);
    const rowsPerPage = 9;

    useEffect(() => {
        (async () => {
            const reports = []

            const transactions = await all();

            for (const transaction of transactions) {
                const payment = transaction.paymentsCovered[0];
                const currentYear = await all({
                    userId: transaction.userId,
                    createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) }
                });
                let priorYears = await all({
                    userId: transaction.userId,
                    createdAt: { lt: transaction.createdAt }
                });
                priorYears = priorYears.filter(transaction => transaction.paymentsCovered[0].id === payment.id);

                const { total } = computeQuaterDiscountNoSef(payment.property.assessedValue);

                const report = {
                    date: format(new Date(transaction.createdAt), "M/d/yyyy"),
                    taxpayer: transaction.user.name,
                    period: transaction.periodCovered,
                    ORNumber: transaction.originalReceiptNumber,
                    brgy: payment.property.location,
                    class: payment.property.class.charAt(0),
                    currentYear: transaction.basicQuarterTax,
                    discount: transaction.discount,
                    priorYears: priorYears.reduce((acc, curr) => acc + curr.basicQuarterTax, 0),
                    penaltiesCurrentYear: currentYear.reduce((acc, curr) => acc + curr.interest, 0),
                    penaltiesPriorYears: priorYears.reduce((acc, curr) => acc + curr.interest, 0),
                    total: total
                };

                reports.push(report);
            }

            setReports(reports);
        })();
    }, [ filter ]);

    const { filteredData, dailyTotals, cumulativeDailyTotals, overallTotals } =
        useMemo(() => {
            const filtered = reports.filter((user) => {
                const classFilter = filter === "All" || user.class === filter;
                const [ month, day, year ] = user.date.split("/");
                const dateFilter =
                    (selectedMonth === 0 ||
                        parseInt(month) === selectedMonth) &&
                    parseInt(year) === selectedYear;

                const searchFilter =
                    searchTerm === "" ||
                    [
                        user.date,
                        user.taxpayer,
                        user.period,
                        user.ORNumber,
                        user.brgy,
                        user.class
                    ].some((field) =>
                        field
                            .toString()
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                    );

                return classFilter && dateFilter && searchFilter;
            });

            // Sort the filtered data by date
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

            const dailyTotals = filtered.reduce((acc, curr) => {
                if (!acc[curr.date]) {
                    acc[curr.date] = {
                        currentYear: 0,
                        discount: 0,
                        priorYears: 0,
                        penaltiesCurrentYear: 0,
                        penaltiesPriorYears: 0,
                        total: 0
                    };
                }
                acc[curr.date].currentYear += curr.currentYear;
                acc[curr.date].discount += curr.discount;
                acc[curr.date].priorYears += curr.priorYears;
                acc[curr.date].penaltiesCurrentYear +=
                    curr.penaltiesCurrentYear;
                acc[curr.date].penaltiesPriorYears += curr.penaltiesPriorYears;
                acc[curr.date].total += curr.total;
                return acc;
            }, {});

            const cumulativeDailyTotals = Object.entries(dailyTotals).reduce(
                (acc, [ date, totals ]) => {
                    const prevTotal = acc[acc.length - 1] || {
                        date: "",
                        currentYear: 0,
                        discount: 0,
                        priorYears: 0,
                        penaltiesCurrentYear: 0,
                        penaltiesPriorYears: 0,
                        total: 0
                    };

                    acc.push({
                        date,
                        currentYear: prevTotal.currentYear + totals.currentYear,
                        discount: prevTotal.discount + totals.discount,
                        priorYears: prevTotal.priorYears + totals.priorYears,
                        penaltiesCurrentYear:
                            prevTotal.penaltiesCurrentYear +
                            totals.penaltiesCurrentYear,
                        penaltiesPriorYears:
                            prevTotal.penaltiesPriorYears +
                            totals.penaltiesPriorYears,
                        total: prevTotal.total + totals.total
                    });

                    return acc;
                },
                []
            );

            const overallTotals = cumulativeDailyTotals[
            cumulativeDailyTotals.length - 1
                ] || {
                currentYear: 0,
                discount: 0,
                priorYears: 0,
                penaltiesCurrentYear: 0,
                penaltiesPriorYears: 0,
                total: 0
            };

            return {
                filteredData: filtered,
                dailyTotals,
                cumulativeDailyTotals,
                overallTotals
            };
        }, [ reports, filter, selectedMonth, selectedYear, searchTerm ]);

    const dayTotal = useMemo(() => {
        return (
            overallTotals.currentYear +
            overallTotals.discount +
            overallTotals.priorYears +
            overallTotals.penaltiesCurrentYear +
            overallTotals.penaltiesPriorYears
        );
    }, [ overallTotals ]);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const monthOptions = [
        { value: 0, label: "All" },
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" }
    ];

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 2024;
        return Array.from(
            { length: currentYear - startYear + 1 },
            (_, index) => currentYear - index
        ).filter((year) => year >= startYear);
    }, []);

    const pdfDocument = useMemo(
        () => (
            <ARPTCDocument
                data={ filteredData }
                selectedMonth={ selectedMonth }
                selectedYear={ selectedYear }
            />
        ),
        [ filteredData, selectedMonth, selectedYear ]
    );

    const pdfDocumentSEF = useMemo(
        () => (
            <ARPTCDocumentSEF
                data={ filteredData }
                selectedMonth={ selectedMonth }
                selectedYear={ selectedYear }
            />
        ),
        [ filteredData, selectedMonth, selectedYear ]
    );

    const formatFilename = () => {
        const monthName = new Date(
            selectedYear,
            selectedMonth - 1
        ).toLocaleString("default", { month: "long" });
        return `ARPTC_BASIC_${ monthName }_${ selectedYear }.pdf`;
    };

    const formatFilenameSEF = () => {
        const monthName = new Date(
            selectedYear,
            selectedMonth - 1
        ).toLocaleString("default", { month: "long" });
        return `ARPTC_SEF_${ monthName }_${ selectedYear }.pdf`;
    };

    return (
        <div className='container-fluid px-4'>
            <div className='row pt-3'>
                <div className='col-12 pb-2'>
                    <h4>
                        <strong>
                            Abstract of Real Property Tax Collection
                        </strong>
                    </h4>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body p-4'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                <div className='d-flex'>
                                    <select
                                        className='form-select me-2'
                                        value={ selectedMonth }
                                        onChange={ (e) =>
                                            setSelectedMonth(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    >
                                        { monthOptions.map((option) => (
                                            <option
                                                key={ option.value }
                                                value={ option.value }
                                            >
                                                { option.label }
                                            </option>
                                        )) }
                                    </select>
                                    <select
                                        className='form-select me-2'
                                        value={ selectedYear }
                                        onChange={ (e) =>
                                            setSelectedYear(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    >
                                        { yearOptions.map((year) => (
                                            <option key={ year } value={ year }>
                                                { year }
                                            </option>
                                        )) }
                                    </select>
                                </div>
                                <div className='d-flex'>
                                    <input
                                        type='text'
                                        placeholder='Search all fields'
                                        className='form-control me-2'
                                        value={ searchTerm }
                                        onChange={ (e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <PDFDownloadLink
                                        document={ pdfDocument }
                                        fileName={ formatFilename() }
                                    >
                                        { ({ blob, url, loading, error }) => (
                                            <button
                                                className='btn btn-primary me-2 btn-sm download-btn'
                                                disabled={ loading }
                                            >
                                                { loading
                                                    ? "Preparing PDF..."
                                                    : "Download Basic Tax" }
                                            </button>
                                        ) }
                                    </PDFDownloadLink>
                                    <PDFDownloadLink
                                        document={ pdfDocumentSEF }
                                        fileName={ formatFilenameSEF() }
                                    >
                                        { ({ blob, url, loading, error }) => (
                                            <button
                                                className='btn btn-primary me-2 btn-sm download-btn-sef'
                                                disabled={ loading }
                                            >
                                                { loading
                                                    ? "Preparing PDF..."
                                                    : "Download SEF" }
                                            </button>
                                        ) }
                                    </PDFDownloadLink>
                                </div>
                            </div>
                            <div className='table-container'>
                                <table
                                    className='table table-hover table-responsive table-bordered arptc table-striped'>
                                    <thead>
                                    <tr>
                                        <th
                                            rowSpan='3'
                                            className='align-bottom'
                                        >
                                            Date
                                        </th>
                                        <th
                                            rowSpan='3'
                                            className='align-bottom'
                                        >
                                            Taxpayer
                                        </th>
                                        <th
                                            rowSpan='3'
                                            className='align-bottom'
                                        >
                                            Period Covered
                                        </th>
                                        <th
                                            rowSpan='3'
                                            className='align-bottom'
                                        >
                                            O.R. No
                                        </th>
                                        <th
                                            rowSpan='3'
                                            className='align-bottom'
                                        >
                                            Name of Brgy.
                                        </th>
                                        <th
                                            rowSpan='3'
                                            className='align-bottom'
                                        >
                                            Class
                                        </th>
                                        <th
                                            colSpan='8'
                                            className='text-center'
                                        >
                                            Basic
                                        </th>
                                    </tr>
                                    <tr>
                                        <th rowSpan='2'>Current Yr.</th>
                                        <th rowSpan='2'>Discount</th>
                                        <th rowSpan='2'>Prior Yrs.</th>
                                        <th
                                            colSpan='2'
                                            className='text-center'
                                        >
                                            Penalties{ " " }
                                        </th>
                                        <th rowSpan='2'>Total</th>
                                        <th rowSpan='2'>Day Total</th>
                                    </tr>
                                    <tr>
                                        <th>Current Yr.</th>
                                        <th>Prior Yr.</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    { currentRows.map((user, index) => (
                                        <React.Fragment key={ index }>
                                            <tr>
                                                <td>{ user.date }</td>
                                                <td>{ user.taxpayer }</td>
                                                <td>{ user.period }</td>
                                                <td>{ user.ORNumber }</td>
                                                <td>{ user.brgy }</td>
                                                <td>{ user.class }</td>
                                                <td>
                                                    { user.currentYear.toFixed(
                                                        2
                                                    ) }
                                                </td>
                                                <td>
                                                    { user.discount.toFixed(
                                                        2
                                                    ) }
                                                </td>
                                                <td>
                                                    { user.priorYears.toFixed(
                                                        2
                                                    ) }
                                                </td>
                                                <td>
                                                    { user.penaltiesCurrentYear.toFixed(
                                                        2
                                                    ) }
                                                </td>
                                                <td>
                                                    { user.penaltiesPriorYears.toFixed(
                                                        2
                                                    ) }
                                                </td>
                                                <td>
                                                    { user.total.toFixed(2) }
                                                </td>
                                                <td></td>
                                            </tr>
                                            { (index ===
                                                currentRows.length - 1 ||
                                                currentRows[index + 1]
                                                    ?.date !==
                                                user.date) && (
                                                <>
                                                    <tr className='font-weight-bold table-secondary'>
                                                        <td
                                                            colSpan='6'
                                                            className='text-end'
                                                        >
                                                            Day Total (
                                                            { user.date }):
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].currentYear.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].discount.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].priorYears.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].penaltiesCurrentYear.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].penaltiesPriorYears.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].total.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                        <td>
                                                            { dailyTotals[
                                                                user.date
                                                                ].total.toFixed(
                                                                2
                                                            ) }
                                                        </td>
                                                    </tr>
                                                    <tr className='font-weight-bold table-warning'>
                                                        <td
                                                            colSpan='6'
                                                            className='text-end'
                                                        >
                                                            Cumulative
                                                            Total:
                                                        </td>
                                                        { cumulativeDailyTotals.find(
                                                            (total) =>
                                                                total.date ===
                                                                user.date
                                                        ) && (
                                                            <>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .currentYear.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .discount.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .priorYears.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .penaltiesCurrentYear.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .penaltiesPriorYears.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .total.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                                <td>
                                                                    { cumulativeDailyTotals
                                                                        .find(
                                                                            (
                                                                                total
                                                                            ) =>
                                                                                total.date ===
                                                                                user.date
                                                                        )
                                                                        .total.toFixed(
                                                                            2
                                                                        ) }
                                                                </td>
                                                            </>
                                                        ) }
                                                    </tr>
                                                </>
                                            ) }
                                        </React.Fragment>
                                    )) }
                                    <tr className='font-weight-bold table-danger'>
                                        <td
                                            colSpan='6'
                                            className='text-end'
                                        >
                                            Overall Total:
                                        </td>
                                        <td>
                                            { overallTotals.currentYear.toFixed(
                                                2
                                            ) }
                                        </td>
                                        <td>
                                            { overallTotals.discount.toFixed(
                                                2
                                            ) }
                                        </td>
                                        <td>
                                            { overallTotals.priorYears.toFixed(
                                                2
                                            ) }
                                        </td>
                                        <td>
                                            { overallTotals.penaltiesCurrentYear.toFixed(
                                                2
                                            ) }
                                        </td>
                                        <td>
                                            { overallTotals.penaltiesPriorYears.toFixed(
                                                2
                                            ) }
                                        </td>
                                        <td>
                                            { overallTotals.total.toFixed(2) }
                                        </td>
                                        <td>
                                            { overallTotals.total.toFixed(2) }
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='d-flex mt-2'>
                                <button
                                    className='btn btn-outline-secondary btn-sm mx-2'
                                    onClick={ () => paginate(currentPage - 1) }
                                    disabled={ currentPage === 1 }
                                >
                                    Previous
                                </button>
                                <button
                                    className='btn btn-outline-secondary btn-sm'
                                    onClick={ () => paginate(currentPage + 1) }
                                    disabled={ currentPage === totalPages }
                                >
                                    Next
                                </button>
                                <div className='sub-info mx-3 mt-1'>
                                    Page { currentPage } of { totalPages }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Arptc };
