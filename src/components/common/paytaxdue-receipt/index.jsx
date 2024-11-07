"use client";

import { Button, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import { get, update } from "@actions/payments";
import { create } from "@actions/transaction";
import { quarterToString } from "@utils/date";

const quarter = (quarter, year) => `${quarterToString(quarter)} - ${year}`;

const PayTaxDueReceipt = ({
  show,
  handleClose,
  propertyInfo,
  selectedPaymentDues,
  userData,
}) => {
  const [periodCovered, setPeriodCovered] = useState("");
  const [taxData, setTaxData] = useState({
    basicTax: 0,
    educationFund: 0,
    subTotal: 0,
    discount: 0,
    totalAmount: 0,
    interest: 0,
  });

  useEffect(() => {
    let dues = [];
    (async () => {
      const tax = {
        basicTax: 0,
        educationFund: 0,
        subTotal: 0,
        discount: 0,
        totalAmount: 0,
        interest: 0,
      };

      dues = await Promise.all(
        selectedPaymentDues.map(async (due) => await get(due))
      );
      dues.forEach((due) => {
        const { basicQuarterTax, sefTax, discount, interest, subTotal, total } =
          due;

        tax.basicTax += basicQuarterTax;
        tax.educationFund += sefTax;
        tax.discount += discount;
        tax.interest += interest;
        tax.subTotal += subTotal;
        tax.totalAmount += total;
      });
      setTaxData(tax);

      if (dues.length === 0) {
        setPeriodCovered("No dues selected");
        return;
      }

      dues.sort((a, b) => a.createdAt - b.createdAt);

      const latest = dues[0];
      const oldest = dues[dues.length - 1];

      if (latest.id === oldest.id) {
        setPeriodCovered(`${quarter(latest.quarter, latest.year)}`);
        return;
      }

      setPeriodCovered(
        `${quarter(latest.quarter, latest.year)} - ${quarter(
          oldest.quarter,
          oldest.year
        )}`
      );
    })();
  }, [selectedPaymentDues]);



  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header style={{ justifyContent: "space-between" }}>
        <Modal.Title>
          <strong className="ml-2">Pay Tax Due</strong>
        </Modal.Title>

        <Button
          variant="close"
          aria-label="Close"
          onClick={handleClose}
        ></Button>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center mb-4">
              <img
                style={{ height: "100px", width: "auto" }}
                src="/ERPT logo 1.png"
                alt="Logo"
                className="img-fluid"
              />
              <p>
                <strong>Municipality of Unisan, Quezon</strong>
              </p>
            </div>

            <div className="col-md-6 " style={{ fontSize: "15px" }}>
              <p>
                F. De Jesus Brgy. Hall, Resma Rd, Unisan, Quezon 4305
                <br />
                Phone: 0912-123-1234
                <br />
                Email: unisan@gmail.com
                <br />
                Web: erpt-unisan.com
              </p>
            </div>
            <div className="col-md-6 text-end" style={{ fontSize: "15px" }}>
              <p>
                <strong className="fs-5">{userData.name}</strong>
                <br />
                {userData.email}
                <br />
                {userData.address}
                <br />
                {userData.date}
                <br />
                
              </p>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>Real Property Tax</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>
                          TD No: {`${propertyInfo.taxDeclarationNumber}`}{" "}
                        </strong>
                      </td>
                      <td>
                        <strong>PIN: {`${propertyInfo.pin}`}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Period Covered: {periodCovered} </strong>
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Assessed Value - Building</td>
                      <td>{`PHP ${propertyInfo.assessedValue}`}</td>
                    </tr>
                    <tr>
                      <td>Basic Tax 1%</td>
                      <td>{`PHP ${taxData.basicTax}`}</td>
                    </tr>
                    <tr>
                      <td>Special Education Fund 1%</td>
                      <td>{`PHP ${taxData.educationFund}`}</td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sub -
                        Total Amount
                      </td>
                      <td>{`PHP ${taxData.subTotal}`}</td>
                    </tr>
                    <tr>
                      <td>Discount 10%</td>
                      <td>{`- PHP ${taxData.discount}`}</td>
                    </tr>
                    <tr>
                      <td>Penalty</td>
                      <td>{`+ PHP ${taxData.interest} `}</td>
                    </tr>
                    <tr className="fs-6"></tr>

                    <tr className="fs-6">
                      <td>
                        <strong>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total
                        </strong>
                      </td>
                      <td>
                        <strong>{`PHP ${parseFloat(taxData.totalAmount).toFixed(
                          2
                        )}`}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { PayTaxDueReceipt };
