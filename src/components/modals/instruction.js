import React from "react";
import { Modal, Button, Card } from "react-bootstrap";
import { CreditCard, HelpCircle } from "lucide-react";

const TaxPaymentInstructionsModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title className="h4 fw-bold">How to Pay Tax Dues</Modal.Title>
      </Modal.Header>
      <Modal.Body className=" p-4">
        <Card className="border-0 mb-4">
          <Card.Header className="bg-white border-0 py-3">
            <h5 className="mb-0 d-flex align-items-center">
              <CreditCard
                className="me-2"
                size={20}
                style={{ color: "#635ef6" }}
              />
              <span className="fw-bold " style={{ color: "#635ef6" }}>
                Online Payment
              </span>
            </h5>
          </Card.Header>
          <Card.Body className="ps-4">
            <ol className="ps-4 mb-0">
              <li className="mb-2 text-muted">
                Choose the property you wish to pay for from your list of
                registered properties.
              </li>
              <li className="mb-2 text-muted">
                Click on the “Pay Tax Due” button to view your unpaid and
                pending payments. Select the taxes you want to settle and click
                “Next.”
              </li>
              <li className="mb-2 text-muted">
                Proceed to Payment by clicking on “Pay via Landbank” to be
                redirected to the Link.Biz Portal.
              </li>
              <li className="mb-2 text-muted">
                After successful payment, your receipt will be displayed.
              </li>
              <li className="mb-2 text-muted">
                Your payment status on this website will be updated once the
                Office of the Municipal Treasurer verifies the transaction with
                Landbank.
              </li>
            </ol>
          </Card.Body>
        </Card>

        <Card className="border-0 bg-white">
          <Card.Body className="text-center py-4">
            <HelpCircle
              size={24}
              className=" mb-3"
              style={{ color: "#635ef6" }}
            />
            <p className="mb-1 text-muted">
              For questions or concerns, contact us at:
            </p>
            <strong style={{ color: "#635ef6" }}>support@taxoffice.gov</strong>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="primary btn-sm"
          onClick={handleClose}
          className="px-4 py-2"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { TaxPaymentInstructionsModal };
