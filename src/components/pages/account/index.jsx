"use client";

import React, { useEffect, useState } from "react";
import classes from "./page.module.css";
import { get } from "@actions/auth/account";
import { signOut } from "next-auth/react";

const Account = () => {
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ properties, setProperties ] = useState([]);
    const [ user, setUser ] = useState({});
    const rowsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            const data = await get();
            setUser(data);
            setProperties(data.properties);
        };

        fetchData().then();
    }, []);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = properties.slice(indexOfFirstRow, indexOfLastRow);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(properties.length / rowsPerPage);

    return (
      <div>
        <div className={`container-fluid px-4 ${classes.marginRight}`}>
          <div className="row pt-3">
            <div className="col-12">
              <div className="row m-0">
                <div className="col-md-12 pb-2">
                  <h4>
                    <strong>Account</strong>
                  </h4>
                </div>
              </div>
              <div className="row pb-2">
                <div className="col-md-12">
                  <div className="card mb-3">
                    <div className="card-body p-4">
                      <h5 className="card-title">
                        <strong>Personal Information</strong>
                      </h5>
                      <div className="row pt-3">
                        <div className="col">
                          <p className="card-text title mb-0">Taxpayer</p>
                          <p className="info">{user.name}</p>
                        </div>
                        <div className="col">
                          <p className="card-text title mb-0">Email Address</p>
                          <p className="card-text info">{user.email}</p>
                        </div>
                      </div>

                      <div className="d-flex pt-3"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body p-4">
                      <h5 className="card-title pb-3">
                        <strong>List of Properties</strong>
                      </h5>
                      <div className="table-container">
                        <div className={`table-responsive `}>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>No.</th>
                                <th>Tax Declartion No.</th>
                                <th>PIN</th>
                                <th>Location of Property</th>
                                <th>Classification</th>
                                <th>Assessed Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRows.map((row, index) => (
                                <tr key={index}>
                                  <td>{row.id}</td>
                                  <td>{row.taxDeclarationNumber}</td>
                                  <td>{row.pin}</td>
                                  <td>{row.location}</td>
                                  <td>{row.class}</td>
                                  <td>{row.assessedValue}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="d-flex">
                        <button
                          className="btn btn-outline-secondary btn-sm mx-2"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          disabled={
                            currentPage === totalPages || totalPages === 0
                          }
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      className="btn btn-secondary btn-sm mx-2"
                      onClick={async () => await signOut()}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export { Account };
