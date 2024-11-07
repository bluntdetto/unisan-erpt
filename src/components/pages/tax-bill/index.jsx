"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, Form, Modal } from "react-bootstrap";
import { update as updatePayment } from '@actions/payments';
import {update as updateProperty} from '@actions/property';
import { get as getUser } from '@actions/user';
import { all as getTransactions, update as updateTransaction } from '@actions/transaction';
import { create as notify } from '@actions/notification';
import { generateOriginalReceiptNumber, upperFirst } from '@utils/string';
import { paymentNotification } from '@utils/notification';
import { NotificationType } from '@prisma/client';

const Taxbill = () => {
    const [ filter, setFilter ] = useState("All");
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ showFilterModal, setShowFilterModal ] = useState(false);
    const [ filteredData, setFilteredData ] = useState([]);
    const initialFilterOptions = {
        classification: "",
        minAssessedValue: "",
        maxAssessedValue: "",
        minAmount: "",
        maxAmount: "",
        year: ""
    };
    const [ filterOptions, setFilterOptions ] = useState(initialFilterOptions);
    const [ tempFilterOptions, setTempFilterOptions ] = useState(initialFilterOptions);
    const rowsPerPage = 11;

    const [ dues, setDues ] = useState([]);

    useEffect(() => {
        (async () => {
            const data = await getTransactions({
                status: filter
            });

            const dues = await Promise.all(data.map(async due => {
                const user = await getUser(due.userId);
                const payment = due.paymentsCovered[0];
                const property = payment.property;

                return {
                    id: due.id,
                    userId: user.id,
                    originalReceiptNumber: due.originalReceiptNumber,
                    taxpayer: user.name,
                    pin: property.pin,
                    taxDeclarationNo: property.taxDeclarationNumber,
                    periodCovered: due.periodCovered,
                    propertyLocation: property.location,
                    classification: property.class,
                    assessedValue: property.assessedValue,
                    total: due.total,
                    status: due.status,
                    paymentsCovered: due.paymentsCovered
                };
            }));

            setDues(dues);
        })();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [ dues, filter ]);

    const getStatusVariant = (status) => {
        switch (status) {
            case "PAID":
                return "success";
            case "PENDING":
                return "warning";
            case "UNPAID":
                return "danger";
            default:
                return "secondary";
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const existing = dues.find(due => due.id === id);

        if (existing.originalReceiptNumber) return;

        const message = paymentNotification(
            "confirmed",
            existing.taxDeclarationNo,
            existing.periodCovered,
            existing.total
        )

        const user = await getUser(existing.userId);

        await notify({
            type: NotificationType.SUCCESS,
            userId: user.id,
            message
        })

        const transaction = await updateTransaction(id, {
            originalReceiptNumber: generateOriginalReceiptNumber(),
            status: newStatus
        });

        for (const payment of transaction.paymentsCovered) {
            await updatePayment(payment.id, { status: newStatus });
            
            await updateProperty(payment.propertyId, {
                lastPaymentDate: new Date(),
            })
        }

        setDues(prev => prev.map(due => {
            if (due.id === id) {
                return {
                    ...due,
                    status: newStatus
                };
            }

            return due;
        }))
    };

    const applyFilters = () => {
        let result = dues;

        if (filter !== "All") {
            result = result.filter((user) => user.status === filter);
        }

        if (filterOptions.classification) {
            result = result.filter(
                (user) => user.classification === filterOptions.classification
            );
        }

        if (filterOptions.minAssessedValue) {
            result = result.filter(
                (user) =>
                    parseFloat(user.assessedValue.replace(/,/g, "")) >=
                    parseFloat(filterOptions.minAssessedValue)
            );
        }

        if (filterOptions.maxAssessedValue) {
            result = result.filter(
                (user) =>
                    parseFloat(user.assessedValue.replace(/,/g, "")) <=
                    parseFloat(filterOptions.maxAssessedValue)
            );
        }

        if (filterOptions.minAmount) {
            result = result.filter(
                (user) =>
                    parseFloat(user.amount.replace(/,/g, "")) >=
                    parseFloat(filterOptions.minAmount)
            );
        }

        if (filterOptions.maxAmount) {
            result = result.filter(
                (user) =>
                    parseFloat(user.amount.replace(/,/g, "")) <=
                    parseFloat(filterOptions.maxAmount)
            );
        }

        if (filterOptions.year) {
            result = result.filter((user) =>
                user.periodCovered.includes(filterOptions.year)
            );
        }

        setFilteredData(result);
    };

    const handleSearch = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (searchTerm) {
                const searchResult = filteredData.filter((user) =>
                    Object.values(user).some((value) =>
                        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                    )
                );
                setFilteredData(searchResult);
            } else {
                applyFilters();
            }
            setCurrentPage(1);
        }
    };

    const resetFilters = () => {
        setTempFilterOptions(initialFilterOptions);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (
        <div className='container-fluid px-4'>
            <div className='row pt-3'>
                <div className='col-12 pb-2'>
                    <h4>
                        <strong>Real Property Tax Bills</strong>
                    </h4>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-body p-4'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                <select
                                    className='form-select w-auto'
                                    value={ filter }
                                    onChange={ (e) => setFilter(e.target.value) }
                                >
                                    <option value='All'>All</option>
                                    <option value='PENDING'>Pending</option>
                                    <option value='PAID'>Paid</option>
                                    <option value='UNPAID'>Unpaid</option>
                                </select>

                                <div className='d-flex'>
                                    <input
                                        type='text'
                                        placeholder='Enter Here'
                                        className='form-control me-2'
                                        value={ searchTerm }
                                        onChange={ (e) => setSearchTerm(e.target.value) }
                                        onKeyDown={ handleSearch }
                                    />
                                    <Button onClick={ handleSearch } className='me-2 '>
                                        Search
                                    </Button>
                                    <Button
                                        variant='btn btn-secondary'
                                        onClick={ () => {
                                            setTempFilterOptions({ ...filterOptions });
                                            setShowFilterModal(true);
                                        } }
                                    >
                                        Filter
                                    </Button>
                                </div>
                            </div>
                            <div className='table-responsive table-container'>
                                <table className='table table-hover table-striped'>
                                    <thead>
                                    <tr>
                                        <th>Taxpayer</th>
                                        <th>Tax Declaration No.</th>
                                        <th>PIN</th>
                                        <th>Period Covered</th>
                                        <th>Property Location</th>
                                        <th>Classification</th>
                                        <th>Assessed Value</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    { currentRows.map(due => (
                                        <tr key={ due.id }>
                                            <td>{ due.taxpayer }</td>
                                            <td>{ due.taxDeclarationNo }</td>
                                            <td>{ due.pin }</td>
                                            <td>{ due.periodCovered }</td>
                                            <td>{ due.propertyLocation }</td>
                                            <td>{ due.classification }</td>
                                            <td>{ due.assessedValue }</td>
                                            <td>{ due.total }</td>
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        as='span'
                                                        className='dropdown-toggle-as-normal'
                                                    >
                                                        <Badge bg={ getStatusVariant(due.status) }>
                                                            { upperFirst(due.status || '') }
                                                        </Badge>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item
                                                            onClick={ () =>
                                                                handleStatusChange(due.id, "PAID")
                                                            }
                                                        >
                                                            Paid
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={ () =>
                                                                handleStatusChange(due.id, "PENDING")
                                                            }
                                                        >
                                                            Pending
                                                        </Dropdown.Item>
                                                        
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    )) }
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
                                <div className='sub-info ms-3 mt-1'>
                                    Page { currentPage } of { totalPages }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={ showFilterModal } onHide={ () => setShowFilterModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>Filter Options</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label>Classification</Form.Label>
                            <Form.Control
                                as='select'
                                value={ tempFilterOptions.classification }
                                onChange={ (e) =>
                                    setTempFilterOptions({
                                        ...tempFilterOptions,
                                        classification: e.target.value
                                    })
                                }
                            >
                                <option value=''>All</option>
                                <option value='Residential'>Residential</option>
                                <option value='Commercial'>Commercial</option>
                                <option value='Agricultural'>Agricultural</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Assessed Value Range</Form.Label>
                            <div className='d-flex'>
                                <Form.Control
                                    type='number'
                                    placeholder='Min'
                                    value={ tempFilterOptions.minAssessedValue }
                                    onChange={ (e) =>
                                        setTempFilterOptions({
                                            ...tempFilterOptions,
                                            minAssessedValue: e.target.value
                                        })
                                    }
                                    className='me-2'
                                />
                                <Form.Control
                                    type='number'
                                    placeholder='Max'
                                    value={ tempFilterOptions.maxAssessedValue }
                                    onChange={ (e) =>
                                        setTempFilterOptions({
                                            ...tempFilterOptions,
                                            maxAssessedValue: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Amount Range</Form.Label>
                            <div className='d-flex'>
                                <Form.Control
                                    type='number'
                                    placeholder='Min'
                                    value={ tempFilterOptions.minAmount }
                                    onChange={ (e) =>
                                        setTempFilterOptions({
                                            ...tempFilterOptions,
                                            minAmount: e.target.value
                                        })
                                    }
                                    className='me-2'
                                />
                                <Form.Control
                                    type='number'
                                    placeholder='Max'
                                    value={ tempFilterOptions.maxAmount }
                                    onChange={ (e) =>
                                        setTempFilterOptions({
                                            ...tempFilterOptions,
                                            maxAmount: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                                type='number'
                                placeholder='Year'
                                value={ tempFilterOptions.year }
                                onChange={ (e) =>
                                    setTempFilterOptions({
                                        ...tempFilterOptions,
                                        year: e.target.value
                                    })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={ () => setShowFilterModal(false) }
                    >
                        Close
                    </Button>
                    <Button variant='secondary' onClick={ resetFilters }>
                        Reset
                    </Button>
                    <Button
                        variant='primary'
                        onClick={ () => {
                            setFilterOptions(tempFilterOptions);
                            applyFilters();
                            setShowFilterModal(false);
                        } }
                    >
                        Apply Filters
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export { Taxbill };
