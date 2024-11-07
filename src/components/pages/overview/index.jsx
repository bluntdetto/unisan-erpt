"use client";

import React, { useEffect, useState } from "react";
import { format, isSameDay, isYesterday } from "date-fns";
import { Badge, Button, Form, Modal, Table } from "react-bootstrap";
import classes from "./page.module.css";
import { SelectPaymentModal } from "@components/common/select-payment-modal";
import { PayTaxDue } from "@components/common/paytaxdue";
import { TaxPaymentInstructionsModal } from "@components/modals/instruction";
import Link from "next/link";
import { get as getAccount } from "@actions/auth/account";
import { all as getPayments, getLastPayment } from "@actions/payments";
import { getByUserId as getNotifications, markAsRead } from "@actions/notification";
import { formatDate } from "@lib/utils/date";
import { computeTax } from '@utils/computation';
import { upperFirst } from '@utils/string';
import { PaymentStatus } from '@prisma/client';


const Overview = () => {
    const [ account, setAccount ] = useState({});
    const [ payments, setPayments ] = useState([]);
    const [ properties, setProperties ] = useState([]);
    const [ lastPayment, setLastPayment ] = useState({});
    const [ notifications, setNotifications ] = useState([]);
    const [ selectedPaymentDues, setSelectedPaymentDues ] = useState([]);

    const [ showModal, setShowModal ] = useState(false);
    const [ showTaxModal, setShowTaxModal ] = useState(false);
    const [ showSelectPaymentModal, setShowSelectPaymentModal ] = useState(false);
    const [ showNotifications, setShowNotifications ] = useState(false); // Notification dropdown state
    const [ selectedProperty, setSelectedProperty ] = useState({});
    const [ payTaxPayments, setPayTaxPayments ] = useState([]);

    const getQuarterDate = (quarter, year) => {
        if (quarter === 5) {
            quarter = 1;
            year += 1;
        }

        const m = {
            1: `January 1, ${ year } - March 31, ${ year }`,
            2: `April 1, ${ year } - June 30, ${ year }`,
            3: `July 1, ${ year } - September 30, ${ year }`,
            4: `October 1, ${ year } - December 31, ${ year }`
        }

        return m[quarter];
    }

    useEffect(() => {
        const fetchData = async () => {
            const accountData = await getAccount();
            const paymentData = await getPayments("All");
            const notificationData = await getNotifications(accountData.id);

            let pTaxPayments = []

            for (const payment of paymentData.filter(p => p.status !== PaymentStatus.PAID && !p.transactionId)) {
                pTaxPayments.push({
                    id: payment.id,
                    propertyId: payment.propertyId,
                    quarter: payment.quarter,
                    date: getQuarterDate(payment.quarter, payment.year),
                    total: payment.total,
                    status: upperFirst(payment.status)
                });
            }

            pTaxPayments = pTaxPayments.sort((a, b) => a.createdAt - b.createdAt).reverse().filter(p => accountData.properties[0] ? p.propertyId === accountData.properties[0].id : false);

            setPayTaxPayments(pTaxPayments);
            setAccount(accountData);
            setPayments(paymentData);
            setProperties(accountData.properties);
            setSelectedProperty(accountData.properties[0] ?? {});
            setNotifications(notificationData);

            const lastPayment = await getLastPayment(accountData.properties[0]?.id) ?? {};
            setLastPayment(lastPayment);
        };

        fetchData();
    }, []);

    const handleSelectProperty = (property) => {
        setSelectedProperty(property);

        let pTaxPayments = []

        for (const payment of payments.filter(p => p.status !== PaymentStatus.PAID && !p.transactionId)) {
            pTaxPayments.push({
                id: payment.id,
                propertyId: payment.propertyId,
                quarter: payment.quarter,
                date: getQuarterDate(payment.quarter, payment.year),
                total: payment.total,
                status: upperFirst(payment.status)
            });
        }

        pTaxPayments = pTaxPayments.sort((a, b) => a.createdAt - b.createdAt).reverse().filter(p => property ? p.propertyId === property.id : false);

        setPayTaxPayments(pTaxPayments);
        setPayTaxPayments(prev => prev.filter(p => p.propertyId === property.id));
    };

    const handleShowSelectPaymentModal = () => setShowSelectPaymentModal(true);
    const handleCloseSelectPaymentModal = () => setShowSelectPaymentModal(false);
    const handleShowPayTaxDueModal = () => setShowTaxModal(true);
    const handleClosePayTaxDueModal = () => setShowTaxModal(false);

    const handleNext = (paymentDueIds) => {
        setSelectedPaymentDues(paymentDueIds);
        handleCloseSelectPaymentModal();
        handleShowPayTaxDueModal();
    };

    const [ highlightedProperty, setHighlightedProperty ] = useState(null);

    const getQuarterInt = (date) => {
        const month = date.getMonth();
        return Math.floor(month / 3) + 1;
    }

    const getQuarter = (date) => {
        const quarter = getQuarterInt(date);
        const mapping = {
            1: "1st",
            2: "2nd",
            3: "3rd",
            4: "4th"
        }

        return `${ mapping[quarter] } Quarter`;
    }

    const propertyInfo = {
        taxDeclarationNumber: selectedProperty.taxDeclarationNumber,
        assessedValue: selectedProperty.assessedValue,
        pin: selectedProperty.pin
    };

    const [ currentPage, setCurrentPage ] = useState(1);
    const rowsPerPage = 6;

    const renderStatusBadge = (status) => {
        switch (status) {
            case "PAID":
                return <Badge bg='success'>Paid</Badge>;
            case "PENDING":
                return <Badge bg='warning'>Pending</Badge>;
            case "UNPAID":
                return <Badge bg='danger'>Unpaid</Badge>;
            default:
                return <Badge bg='secondary'>Unknown</Badge>;
        }
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = payments.slice(indexOfFirstRow, indexOfLastRow);

    const handleSaveProperty = () => {
        if (highlightedProperty) {
            setSelectedProperty(highlightedProperty);
        }
        setShowModal(false);
    };

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [ showTaxInstructionsModal, setShowTaxInstructionsModal ] =
        useState(false);

    const handleShowTaxInstructionsModal = () =>
        setShowTaxInstructionsModal(true);
    const handleCloseTaxInstructionsModal = () =>
        setShowTaxInstructionsModal(false);


    const handleCloseNotifications = () => {
        setShowNotifications(false);
    };

    const readNotification = async (id) => {
        await markAsRead(id)

        setNotifications(prev => prev.map(n => {
            if (n.id === id) {
                return {
                    ...n,
                    unread: false
                }
            }

            return n;
        }));
    }
    return (
      <div>
        <div className="container-fluid px-4 mr-0">
          <div className="row pt-3">
            <div className="col-12">
              <div className="row m-0">
                <div className="col-md-12 pb-2 d-flex justify-content-between">
                  <h4>
                    <strong>Overview</strong>
                  </h4>
                  <h5 className="circle-background d-inline-flex align-items-center justify-content-center float-sm-right">
                    <i
                      className={`bi ${
                        showNotifications ? "bi-bell-fill" : "bi-bell"
                      }`}
                      onClick={() => setShowNotifications(!showNotifications)}
                      style={{
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {/* Red circle for new notifications */}
                      {notifications.some((n) => n.unread) && (
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "0px",
                            height: "10px",
                            width: "10px",
                            backgroundColor: "red",
                            borderRadius: "50%",
                            border: "1px solid white", // Optional: adds a white border for better visibility
                          }}
                        ></span>
                      )}
                    </i>
                    {showNotifications && (
                      <div
                        className="notification-dropdown"
                        style={{
                          position: "absolute",
                          top: "60px",
                          right: "25px",
                          background: "#fff",
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                          width: "350px",
                          zIndex: 10,
                          borderRadius: "8px",
                        }}
                      >
                        <div className="p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 mt-1">
                              <strong>Notifications</strong>
                            </h5>
                            <Button
                              variant="link"
                              className="text-decoration-none"
                              onClick={handleCloseNotifications}
                              style={{
                                position: "absolute",
                                
                                right: "10px",
                              }}
                            >
                              <i className=" bi bi-x"></i>
                            </Button>
                          </div>
                          <div className="d-flex align-items-center mt-2">
                            
                          </div>
                          <hr />
                          <div
                            className={classes.notificationList}
                            style={{ maxHeight: "300px", overflowY: "auto" }}
                          >
                            {notifications
                              .filter((n) => isSameDay(new Date(), n.createdAt))
                              .map((notification) => (
                                <div
                                  key={notification.id}
                                  className="d-flex justify-content-between align-items-center mb-3"
                                  onClick={() =>
                                    readNotification(notification.id)
                                  }
                                >
                                  <div>
                                    <p
                                      className="mb-0 fw-bold"
                                      style={{ fontSize: "14px" }}
                                    >
                                      {notification.message}
                                    </p>
                                    <p
                                      className="mb-0 text-muted"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {notification.description}
                                    </p>
                                  </div>
                                  {notification.unread && (
                                    <span
                                      className="badge"
                                      style={{
                                        fontSize: "10px",
                                        backgroundColor: "#635EF6",
                                        color: "#ffffff",
                                      }}
                                    >
                                      New
                                    </span>
                                  )}
                                </div>
                              ))}
                            
                            <p
                              className="text-muted"
                              style={{ fontSize: "12px" }}
                            ></p>
                            {notifications
                              .filter((n) => isYesterday(n.createdAt))
                              .map((notification) => (
                                <div
                                  key={notification.id}
                                  className="d-flex justify-content-between align-items-center mb-3"
                                  onClick={() =>
                                    readNotification(notification.id)
                                  }
                                >
                                  <div>
                                    <p
                                      className="mb-0 fw-bold"
                                      style={{ fontSize: "14px" }}
                                    >
                                      {notification.message}
                                    </p>
                                    <p
                                      className="mb-0 text-muted"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {notification.description}
                                    </p>
                                  </div>
                                  {notification.unread && (
                                    <span
                                      className="badge"
                                      style={{
                                        fontSize: "10px",
                                        backgroundColor: "#635EF6",
                                        color: "#ffffff",
                                      }}
                                    >
                                      New
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </h5>
                </div>
              </div>
              <div className="row pb-2">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-body p-4">
                      <h5 className="card-title">
                        <strong>Tax Due</strong>
                      </h5>
                      <p className="sub-info">
                        Your current tax due information are shown here
                      </p>

                      <p className="card-text title mb-0">Last Payment</p>
                      <p className="card-text info mb-0 ">
                        {selectedProperty.lastPaymentDate
                          ? `${getQuarter(
                              selectedProperty.lastPaymentDate
                            )} - ${format(
                              selectedProperty.lastPaymentDate,
                              "MMMM  dd, yyyy"
                            )}`
                          : `N/A`}
                      </p>
                      <p className="card-text info fs-5 fw-bold">
                        {selectedProperty.lastPaymentDate && lastPayment.total
                          ? `₱${lastPayment.total.toFixed(2)}`
                          : "No payment yet"}
                      </p>

                      <p className="card-text title mb-0">Next Payment</p>
                      <p className="card-text info mb-0">
                        {getQuarterDate(
                          selectedProperty.lastPaymentDate
                            ? getQuarterInt(selectedProperty.lastPaymentDate) +
                                1
                            : getQuarterInt(new Date()),
                          selectedProperty.lastPaymentDate
                            ? selectedProperty.lastPaymentDate.getFullYear()
                            : new Date().getFullYear()
                        )}
                      </p>
                      <p className="card-text info fs-5 fw-bold">
                        ₱
                        {computeTax(
                          selectedProperty.assessedValue,
                          selectedProperty.lastPaymentDate
                        ).total.toFixed(2)}
                      </p>
                      <div className="d-flex pt-3 align-items-center justify-content-between">
                        <div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleShowSelectPaymentModal}
                          >
                            Pay Tax Due
                          </button>
                        </div>
                        <button
                          className="btn btn-link btn-sm howtopay"
                          onClick={handleShowTaxInstructionsModal}
                        >
                          How to pay?
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-4">
                      <h5 className="card-title">
                        <strong>Property Information</strong>
                      </h5>
                      <p className="sub-info">
                        The next payment will be made with the selected property
                        below
                      </p>
                      <p className="card-text title mb-0">Taxpayer</p>
                      <p className="card-text info">{account.name}</p>
                      <div className="d-flex mb-3">
                        <div className="col-8">
                          <p className="card-text title mb-0 ">
                            Tax Declaration Number
                          </p>
                          <p className="card-text info">
                            {selectedProperty.taxDeclarationNumber}
                          </p>
                        </div>
                        <div>
                          <p className="card-text title mb-0">PIN</p>
                          <p className="card-text info">
                            {selectedProperty.pin}
                          </p>
                        </div>
                      </div>
                      <p className="card-text title mb-0">Property Location</p>
                      <p className="card-text info">
                        {selectedProperty.location}
                      </p>
                      <div className="d-flex pt-3">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleShowModal}
                        >
                          Select Property
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row pb-2">
                <div className="col-md-12">
                  <div className="card mb-3">
                    <div className="card-body p-4">
                      <h5 className="card-title pb-2">
                        <strong>Recent Payment History and Tax Bill</strong>
                      </h5>

                      <div className="table-container">
                        <div className="table-responsive ">
                          <Table hover responsive>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Official Receipt No.</th>
                                <th>Amount</th>
                                <th>Period Covered</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRows.map((row) => (
                                <tr key={row.id}>
                                  <td>{formatDate(row.createdAt)}</td>
                                  <td>
                                    {row.transaction
                                      ? row.transaction.originalReceiptNumber
                                      : "N/A"}
                                  </td>
                                  <td>{row.total}</td>
                                  <td>
                                    {row.transaction?.periodCovered ??
                                      "Not yet paid"}
                                  </td>
                                  <td>{renderStatusBadge(row.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          <div className="d-flex justify-content-end">
                            <Link href="/payments" passHref>
                              <button className="btn btn-sm btn-primary">
                                View All
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Property Modal */}
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Select Property</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    {properties.map((property, index) => (
                      <div
                        key={index}
                        className={`mb-3 card p-2 ${
                          selectedProperty?.barangay === property.barangay &&
                          selectedProperty?.taxDeclarationNumber ===
                            property.taxDeclarationNumber
                            ? "bg-light"
                            : ""
                        }`}
                        onClick={() => handleSelectProperty(property)}
                      >
                        <Form.Check
                          type="radio"
                          label={
                            <>
                              <div>
                                <strong>Barangay:</strong> {property.location}
                              </div>
                              <div>
                                <strong>Tax Declaration:</strong>{" "}
                                {property.taxDeclarationNumber}
                              </div>
                            </>
                          }
                          name="propertySelect"
                          checked={
                            selectedProperty?.barangay === property.barangay &&
                            selectedProperty?.taxDeclarationNumber ===
                              property.taxDeclarationNumber
                          }
                          onChange={() => handleSelectProperty(property)}
                        />
                      </div>
                    ))}
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSaveProperty(selectedProperty)}
                  >
                    Save
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Pay Tax Due Modal */}
              <PayTaxDue
                show={showTaxModal}
                handleClose={handleClosePayTaxDueModal}
                selectedPaymentDues={selectedPaymentDues}
                propertyInfo={propertyInfo}
                userData={account}
              />

              {/* SelectPaymentModal */}
              <SelectPaymentModal
                payments={payTaxPayments}
                show={showSelectPaymentModal}
                handleClose={handleCloseSelectPaymentModal}
                handleNext={handleNext}
              />

              <TaxPaymentInstructionsModal
                show={showTaxInstructionsModal}
                handleClose={handleCloseTaxInstructionsModal}
              />
            </div>
          </div>
        </div>
      </div>
    );
};

export { Overview };
