"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button, Form, Modal, Table, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PayTaxDue } from "@components/common/paytaxdue";
import { PayTaxDueReceipt } from "@components/common/paytaxdue-receipt";
import { get as getUser } from "@actions/auth/account";
import { all as getPayments, get as getPayment } from "@actions/payments";
import { formatDate } from "@lib/utils/date";
import classes from "./page.module.css";

const Payments = () => {
    const [ filter, setFilter ] = useState("All");
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ selectedDue, setSelectedDue ] = useState([]);
    const [ selectedProperty, setSelectedProperty ] = useState({});
    const [ user, setUser ] = useState({});
    const [ payments, setPayments ] = useState([]);
    const rowsPerPage = 9;

    const [ showFilterModal, setShowFilterModal ] = useState(false);

    // State for modal visibility
    const [ showPayTaxModal, setShowPayTaxModal ] = useState(false);
    const [showPayTaxReceiptModal, setShowPayTaxReceiptModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getUser();
            const payments = await getPayments(filter);
            setUser(userData);
            setPayments(payments);
        };

        fetchData().then();
    }, [ filter ]);

    const [ filterData, setFilterData ] = useState({
        fromDate: null,
        toDate: null,
        minAmount: "",
        maxAmount: "",
        plan: ""
    });
    const earliestUnpaidPayment = React.useMemo(() => {
      const unpaidPayments = payments.filter((p) => p.status === "UNPAID");
      if (unpaidPayments.length === 0) return null;

      return unpaidPayments.reduce((earliest, current) => {
        const earliestDate = new Date(earliest.createdAt);
        const currentDate = new Date(current.createdAt);
        return currentDate < earliestDate ? current : earliest;
      });
    }, [payments]);

    const isPaymentDisabled = (payment) => {
      // If payment is already in a pending state
      if (payment.transactionId !== null) return true;

      // If there are no unpaid payments, enable all payments
      if (!earliestUnpaidPayment) return false;

      // If this is not an unpaid payment, disable it when there are unpaid payments
      if (payment.status !== "UNPAID") return true;

      // If this is an unpaid payment but not the earliest one, disable it
      if (
        payment.status === "UNPAID" &&
        payment.id !== earliestUnpaidPayment.id
      )
        return true;

      return false;
    };

    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilterData({ ...filterData, [name]: value });
    };

    const applyFilter = () => {
      setShowPayTaxModal(false);
      // Implement the filtering logic here
    };

    const renderStatusBadge = (status) => {
      switch (status) {
        case "PAID":
          return <Badge bg="success">Paid</Badge>;
        case "PENDING":
          return <Badge bg="warning">Pending</Badge>;
        case "UNPAID":
          return <Badge bg="danger">Unpaid</Badge>;
        default:
          return <Badge bg="secondary">Unknown</Badge>;
      }
    };

    const renderActionButton = (payment) => {
      return payment.status === "PAID" ? (
        <Button
          variant="outline-primary btn-sm"
          className="btn-outline-primary"
          onClick={async () => {
            setSelectedProperty(payment.property);
            setSelectedDue([payment.id]);
            setShowPayTaxReceiptModal(true);
          }}
        >
          View Receipt
        </Button>
      ) : payment.transactionId !== null ? (
        <Button
          variant="primary btn-sm"
          className="btn-primary"
          onClick={async () => {
            setSelectedProperty(payment.property);
            setSelectedDue([payment.id]);
            setShowPayTaxModal(true);
          }}
          disabled={isPaymentDisabled(payment)}
        >
          Pending approval
        </Button>
      ) : (
        <div className="my-1">N/A</div>
      );
    };

    const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    const filteredData = payments.filter((payment) => {
      // Filter by status
      if (filter !== "All" && payment.status !== filter) {
        return false;
      }

      // Filter by date range
      if (
        filterData.fromDate &&
        new Date(payment.createdAt) < new Date(filterData.fromDate)
      ) {
        return false;
      }
      if (
        filterData.toDate &&
        new Date(payment.createdAt) > new Date(filterData.toDate)
      ) {
        return false;
      }

      // Filter by amount
      const paymentAmount = parseFloat(
        payment.total.toString().replace(/[₱,]/g, "")
      );
      if (
        filterData.minAmount &&
        paymentAmount < parseFloat(filterData.minAmount)
      ) {
        return false;
      }
      if (
        filterData.maxAmount &&
        paymentAmount > parseFloat(filterData.maxAmount)
      ) {
        return false;
      }

      // Filter by plan
      if (filterData.plan) {
        if (filterData.plan === "F") {
          // Check if periodCovered contains 'F' if filterData.plan is 'F'
          if (!payment.periodCovered.includes("F")) {
            return false;
          }
        } else {
          // Check if periodCovered includes the specific plan
          if (payment.periodCovered.indexOf(filterData.plan) === -1) {
            return false;
          }
        }
      }

      return !(filterData.status && payment.status !== filterData.status);
    });

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (
      <div className="container-fluid px-4 mr-0">
        <div className="row pt-3">
          <div className="col-12">
            <div className="row m-0">
              <div className="col-md-12 pb-2">
                <h4>
                  <strong>Payment History and Tax Bill</strong>
                </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-12 pb-4">
                <div className="card">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      
                      <div className="grid grid-cols-1 sm:block">
                        <div className="btn-group flex flex-col sm:flex-row">
                          <Button
                            className={`btn-sm px-3 border-b sm:border-b-0 sm:border-r last:border-b-0 ${
                              filter === "All"
                                ? classes.activeButton
                                : classes.inactiveButton
                            }`}
                            variant="outline-secondary"
                            onClick={() => setFilter("All")}
                          >
                            All
                          </Button>
                          <Button
                            className={`btn-sm px-3 border-b sm:border-b-0 sm:border-r last:border-b-0 ${
                              filter === "PAID"
                                ? classes.activeButton
                                : classes.inactiveButton
                            }`}
                            variant="outline-secondary"
                            onClick={() => setFilter("PAID")}
                          >
                            Paid
                          </Button>
                          <Button
                            className={`btn-sm px-3 border-b sm:border-b-0 sm:border-r last:border-b-0 ${
                              filter === "PENDING"
                                ? classes.activeButton
                                : classes.inactiveButton
                            }`}
                            variant="outline-secondary"
                            onClick={() => setFilter("PENDING")}
                          >
                            Pending
                          </Button>
                          <Button
                            className={`btn-sm px-3 border-b sm:border-b-0 sm:border-r last:border-b-0 ${
                              filter === "UNPAID"
                                ? classes.activeButton
                                : classes.inactiveButton
                            }`}
                            variant="outline-secondary"
                            onClick={() => setFilter("UNPAID")}
                          >
                            Unpaid
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline-secondary"
                        className="ms-2 btn-sm"
                        onClick={() => setShowFilterModal(true)}
                      >
                        Filter
                      </Button>
                    </div>
                    <div className="table-container">
                      <div className="table-responsive">
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Official Receipt No.</th>
                              <th>Amount</th>
                              <th>Period Covered</th>
                              <th>Status</th>
                              <th>Receipt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRows.map((payment) => (
                              <tr key={payment.id}>
                                <td>{formatDate(payment.createdAt)}</td>
                                <td>
                                  {payment.transaction?.originalReceiptNumber ||
                                    "N/A"}
                                </td>
                                <td>{payment.total}</td>
                                <td>
                                  {payment.transaction?.periodCovered ||
                                    "Not yet paid"}
                                </td>
                                <td>{renderStatusBadge(payment.status)}</td>
                                <td>{renderActionButton(payment)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    <div className="d-flex">
                      <Button
                        variant="outline-secondary text-center"
                        className="btn-sm mx-2"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline-secondary text-center"
                        className="btn-sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                      >
                        Next
                      </Button>
                      <div className="sub-info mx-3 mt-1">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Filter Modal */}
        <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Filter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="d-flex justify-content-between">
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <DatePicker
                    selected={filterData.fromDate}
                    onChange={(date) =>
                      setFilterData({ ...filterData, fromDate: date })
                    }
                    className="form-control"
                    placeholderText="From"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
                  <DatePicker
                    selected={filterData.toDate}
                    onChange={(date) =>
                      setFilterData({ ...filterData, toDate: date })
                    }
                    className="form-control"
                    placeholderText="To"
                  />
                </Form.Group>
              </div>
              <Form.Group className="mt-3">
                <Form.Label>Amount</Form.Label>
                <div className="d-flex justify-content-between">
                  <Form.Control
                    type="number"
                    name="minAmount"
                    value={filterData.minAmount}
                    onChange={handleFilterChange}
                    placeholder="min"
                    className="me-2"
                  />
                  <Form.Control
                    type="number"
                    name="maxAmount"
                    value={filterData.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="max"
                  />
                </div>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Plan</Form.Label>
                <Form.Control
                  as="select"
                  name="plan"
                  value={filterData.plan}
                  onChange={handleFilterChange}
                >
                  <option value="">None</option>
                  <option value="F">Advanced Year Payment</option>
                  <option value="Quarterly">Quarterly</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowFilterModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                applyFilter();
                setCurrentPage(1); // Reset pagination
                setShowFilterModal(false);
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Pay Tax Due Modal */}
        <PayTaxDue
          show={showPayTaxModal}
          handleClose={() => setShowPayTaxModal(false)}
          propertyInfo={selectedProperty}
          selectedPaymentDues={selectedDue}
          userData={user}
        />

        <PayTaxDueReceipt
          show={showPayTaxReceiptModal}
          handleClose={() => setShowPayTaxReceiptModal(false)}
          propertyInfo={selectedProperty}
          selectedPaymentDues={selectedDue}
          userData={user}
        />
      </div>
    );
};

export { Payments };
