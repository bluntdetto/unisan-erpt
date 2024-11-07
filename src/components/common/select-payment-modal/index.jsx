import React, { useState } from "react";
import { Button, Form, Modal, Alert } from "react-bootstrap";

const SelectPaymentModal = ({ show, handleClose, handleNext, payments }) => {
  const [selectedPayments, setSelectedPayments] = useState([]);

  const groupedPayments = payments.reduce((acc, payment) => {
    if (!acc[payment.status]) {
      acc[payment.status] = [];
    }
    acc[payment.status].push(payment);
    return acc;
  }, {});

  React.useEffect(() => {
    if (!show) {
      setSelectedPayments([]);
    }
  }, [show]);

  // Find the earliest unpaid payment
  const earliestUnpaidPayment = React.useMemo(() => {
    const unpaidPayments = payments.filter((p) => p.status === "Unpaid");
    if (unpaidPayments.length === 0) return null;

    return unpaidPayments.reduce((earliest, current) => {
      const earliestDate = new Date(earliest.date.split(" - ")[0]);
      const currentDate = new Date(current.date.split(" - ")[0]);
      return currentDate < earliestDate ? current : earliest;
    });
  }, [payments]);

  const isCheckboxDisabled = (payment) => {
    // If there are no unpaid payments, enable all checkboxes
    if (!earliestUnpaidPayment) return false;

    // If this is the earliest unpaid payment, enable it
    if (payment.id === earliestUnpaidPayment.id) return false;

    // If there are unpaid payments, disable all other payments
    return true;
  };

  const handleCheckboxChange = (id, status) => {
    setSelectedPayments((prev) => {
      const isSelected = prev.includes(id);
      const paymentsToUpdate = payments
        .filter((payment) => {
          if (status === "Pending") {
            // Get all pending and unpaid payments with a date before the selected payment
            return (
              (payment.status === "Pending" || payment.status === "Unpaid") &&
              new Date(payment.date.split(" - ")[0]) <=
                new Date(payments.find((p) => p.id === id).date.split(" - ")[0])
            );
          } else {
            // Get all payments with the same status as the selected payment
            return payment.status === status;
          }
        })
        .map((payment) => payment.id);

      if (!isSelected) {
        return [
          ...prev.filter((item) => !paymentsToUpdate.includes(item)),
          ...paymentsToUpdate,
        ];
      }
      return prev.filter((item) => !paymentsToUpdate.includes(item));
    });
  };

  const handleNextClick = () => {
    if (selectedPayments.length === 0) {
      alert("Please select at least one payment to proceed.");
      return;
    }
    handleNext(selectedPayments);
    setSelectedPayments([]); // Reset selections after moving to next step
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Tax Dues</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4">
          Select the payments you want to make and click 'Next' to proceed.
        </p>

        {earliestUnpaidPayment && (
          <Alert variant="warning" className="mb-3 me-2 ms-2">
            <i className="bi bi-info-circle me-2"></i>
            You have unpaid taxes. You must pay the earliest unpaid tax (
            {earliestUnpaidPayment.quarter}) before proceeding with other
            payments.
          </Alert>
        )}

        {Object.keys(groupedPayments).map((status) => (
          <div key={status} className="mb-1 p-2">
            <h5>{status}</h5>
            {groupedPayments[status].map((payment) => (
              <div
                key={payment.id}
                className={`p-3 mb-3 rounded border ${
                  payment.status === "Unpaid"
                    ? "border-danger"
                    : payment.status === "Pending"
                    ? "border-warning"
                    : "border-primary"
                }`}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Check
                    type="checkbox"
                    id={`payment-${payment.id}`}
                    label={payment.quarter}
                    checked={selectedPayments.includes(payment.id)}
                    onChange={() =>
                      handleCheckboxChange(payment.id, payment.status)
                    }
                    disabled={isCheckboxDisabled(payment)}
                    className={`custom-checkbox mb-0 ${
                      payment.status === "Unpaid"
                        ? "border-danger"
                        : payment.status === "Pending"
                        ? "border-warning"
                        : "border-success"
                    }`}
                  />
                  <span className="font-weight-bold">
                    ₱ {payment.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-muted small mb-1">{payment.date}</p>
              </div>
            ))}
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleNextClick}
          disabled={selectedPayments.length === 0}
        >
          Next
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { SelectPaymentModal };
