"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { EditUser } from '@forms/edit-user';
import { DeleteUser } from '@modals/delete-user';
import { CreateUser } from '@forms/create-user';
import { all } from '@actions/user';
import { upperFirst } from '@utils/string';

const UserManagement = () => {
    const [ sort, setSort ] = useState("All");
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ showSortModal, setShowSortModal ] = useState(false);
    const [ sortOrder, setSortOrder ] = useState("asc");
    const [ selectedColumn, setSelectedColumn ] = useState("Name");
    const [ users, setUsers ] = useState([]);

    useEffect(() => {
        all().then(setUsers);
    }, []);

    const sortedData = users
        .filter((user) => {
            if (sort === "All") return true;
            return user.status === sort;
        })
        .filter((user) => {
            return (
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

    const handleSort = () => setShowSortModal(true);

    const sortUsers = useCallback(() => {
        setUsers(prev => prev.sort((a, b) => {
            let columnA = a[selectedColumn.toLowerCase()];
            let columnB = b[selectedColumn.toLowerCase()];

            if (selectedColumn === "AssessedValue") {
                columnA = parseFloat(columnA.replace(/,/g, ""));
                columnB = parseFloat(columnB.replace(/,/g, ""));
            }

            if (sortOrder === "asc") {
                return columnA > columnB ? 1 : -1;
            } else {
                return columnA < columnB ? 1 : -1;
            }
        }));
    }, [ selectedColumn, sortOrder ])

    useEffect(() => sortUsers(), [ users ]);

    const handleSaveSort = () => {
        sortUsers();
        setShowSortModal(false); // Close modal
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const rowsPerPage = 9;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);

    return (
      <div className="container-fluid px-4 mr-0">
        <div className="row pt-3">
          <div className="col-12">
            <div className="row m-0">
              <div className="col-md-12 pb-2">
                <h4>
                  <strong>Real Property Owners</strong>
                </h4>
              </div>
            </div>
            <div className="card p-4 mb-4" style={{ backgroundColor: "white" }}>
              <h5 className="card-title mb-4">
                <strong>Create Real Property Owner Account</strong>
              </h5>

              <CreateUser
                onSubmit={(value) => setUsers((prev) => [...prev, value])}
              />
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-end align-items-center mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Search"
                        className="ms-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button
                        variant="outline-secondary"
                        className="ms-2 btn-sm"
                        onClick={handleSort}
                      >
                        Sort
                      </Button>
                    </div>
                    <div className="table-container">
                      <Table hover responsive striped>
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Properties</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <React.Fragment key={user.id}>
                              <tr>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                  <div
                                    className="properties-list"
                                    style={{
                                      maxHeight: "160px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {user.properties.map((property, i) => (
                                      <div
                                        key={property.id}
                                        className="property-item"
                                      >
                                        <ul>
                                          <li>
                                            Tax Declaration:{" "}
                                            {property.taxDeclarationNumber}
                                          </li>
                                          <li>
                                            PIN:{" "}
                                            {property.pin}
                                          </li>
                                          <li>
                                            Property Location:{" "}
                                            {property.location}
                                          </li>
                                          <li>
                                            Classification:{" "}
                                            {upperFirst(property.class)}
                                          </li>
                                          {/*<li>*/}
                                          {/*    Last*/}
                                          {/*    Payment: { property.lastPayment }*/}
                                          {/*</li>*/}
                                          <li>
                                            Assessed Value:{" "}
                                            {property.assessedValue}
                                          </li>
                                        </ul>
                                        {i < user.properties.length - 1 && (
                                          <hr />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <EditUser
                                    user={user}
                                    onSave={(user) =>
                                      setUsers((prev) => [
                                        ...prev.filter((u) => u.id !== user.id),
                                        user,
                                      ])
                                    }
                                  />
                                  <DeleteUser
                                    email={user.email}
                                    onDelete={(email) =>
                                      setUsers((prev) =>
                                        prev.filter((u) => u.email !== email)
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    <div className="d-flex mt-2 ">
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
                        disabled={currentPage === totalPages}
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

        {/* Sort Modal */}
        <Modal show={showSortModal} onHide={() => setShowSortModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Sort</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formColumn">
                <Form.Label>Column</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="Name">Name</option>
                  <option value="Email">Email</option>
                  <option value="TaxDeclaration">Tax Declaration</option>
                  <option value="AssessedValue">Assessed Value</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formOrder">
                <Form.Label>Sort Order</Form.Label>
                <Form.Control
                  as="select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSortModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSort}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
};

export { UserManagement };
