"use client";

import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import classes from "./page.module.css";
import { useForm } from "react-hook-form";
import { create, deleteEmployee, get, update } from "@actions/employee";

const EmployeeManagement = () => {
    const { register, reset, handleSubmit } = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const [ employees, setEmployees ] = useState([]);
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ showEditModal, setShowEditModal ] = useState(false);
    const [ showDeleteModal, setShowDeleteModal ] = useState(false);
    const [ selectedUser, setSelectedUser ] = useState(null);
    const [ showPassword, setShowPassword ] = useState(false);
    const [ confirmPassword, setConfirmPassword ] = useState("");

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEdit = (employee) => {
        setSelectedUser(employee);
        setShowEditModal(true);
    };

    const handleDelete = (employee) => {
        setSelectedUser(employee);
        setShowDeleteModal(true);
    };

    const handleSaveEdit = async () => {
        // Implement save logic here
        setShowEditModal(false);

        await update(selectedUser);
    };

    const handleConfirmDelete = async () => {
        // Implement delete logic here
        setEmployees(employees.filter((emp) => emp !== selectedUser));
        setShowDeleteModal(false);

        await deleteEmployee(selectedUser.id);
    };

    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const submit = async (data) => {
        const { name, email, password, confirmPassword } = data;

        // Password validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            alert("Password must contain at least one uppercase letter!");
            return;
        }

        if (!/[a-z]/.test(password)) {
            alert("Password must contain at least one lowercase letter!");
            return;
        }

        if (!/[0-9]/.test(password)) {
            alert("Password must contain at least one number!");
            return;
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            alert("Password must contain at least one special character!");
            return;
        }

        // Check for common patterns or sequences
        if (/123|abc|qwerty/i.test(password)) {
            alert(
                "Password contains a common sequence. Please choose a stronger password!"
            );
            return;
        }

        try {
            const employee = await create({
                name,
                email,
                password
            });

            setEmployees((prev) => [ ...prev, employee ]);
            reset();
            alert("Employee created successfully!");
        } catch (error) {
            console.error("Error creating employee:", error);
            alert("Failed to create employee. Please try again.");
        }
    };

    useEffect(() => {
        get().then(setEmployees);
    }, []);

    return (
        <div className={ `container-fluid p-4 ${ classes.background }` }>
            <div className='row pb-4'>
                <div className=''>
                    <div className='row m-0'>
                        <div className='col-md-12 pb-2'>
                            <h4>
                                <strong>Employee Management</strong>
                            </h4>
                        </div>
                    </div>
                    <div className='card p-4' style={ { backgroundColor: "white" } }>
                        <h5 className='card-title mb-4'>
                            <strong>Create Employee Account</strong>
                        </h5>
                        <form onSubmit={ handleSubmit(submit) }>
                            <div className='row'>
                                <div className='col-md-3 mb-3'>
                                    <div className='form-group info'>
                                        <label htmlFor='formName'>Name</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='formName'
                                            placeholder='Enter name'
                                            { ...register("name") }
                                        />
                                    </div>
                                </div>
                                <div className='col-md-3 mb-3'>
                                    <div className='form-group info'>
                                        <label htmlFor='formEmail'>Email</label>
                                        <input
                                            type='email'
                                            className='form-control'
                                            id='formEmail'
                                            placeholder='Enter email'
                                            { ...register("email") }
                                        />
                                    </div>
                                </div>
                                <div className='col-md-3 mb-3'>
                                    <div className='form-group info'>
                                        <label htmlFor='formPassword'>Password</label>
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            className='form-control'
                                            id='formPassword'
                                            placeholder='Enter password'
                                            onChange={ (e) => setPassword(e.target.value) }
                                            { ...register("password") }
                                        />
                                    </div>
                                </div>
                                <div className='col-md-3 mb-3'>
                                    <div className='form-group info'>
                                        <label htmlFor='formRetypePassword'>Re-Type Password</label>
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            className='form-control'
                                            id='formRetypePassword'
                                            onChange={ (e) => setPassword(e.target.value) }
                                            { ...register("confirmPassword") }
                                        />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <div className=' mb-3'>
                                        <Form.Check
                                            type='checkbox'
                                            label='Show password'
                                            onChange={ () => setShowPassword(!showPassword) }
                                            checked={ showPassword }
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type='submit'
                                className='btn btn-sm btn-primary float-right'
                            >
                                Create
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className=''>
                    <div className='card p-4' style={ { backgroundColor: "white" } }>
                        <h5 className='mb-3 '>
                            <strong>All Employees</strong>
                        </h5>
                        <form className='d-flex mb-3 col-md-4'>
                            <input
                                type='search'
                                className='form-control mr-2'
                                placeholder='Search By Name'
                                aria-label='Search'
                                value={ searchTerm }
                                onChange={ handleSearch }
                            />
                        </form>
                        <div className='table-responsive table-container'>
                            <table className='table table-hover'>
                                <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>Email</th>

                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                { filteredEmployees.map((employee) => (
                                    <tr key={ employee.id }>
                                        <td>{ employee.id }</td>
                                        <td>{ employee.name }</td>
                                        <td>{ employee.email }</td>

                                        <td>
                                            <Button
                                                variant='link'
                                                onClick={ () => handleEdit(employee) }
                                            >
                                                <i className='bi bi-pencil'></i>
                                            </Button>
                                            <Button
                                                variant='link'
                                                onClick={ () => handleDelete(employee) }
                                            >
                                                <i className='bi bi-trash text-danger'></i>
                                            </Button>
                                        </td>
                                    </tr>
                                )) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */ }
            <Modal show={ showEditModal } onHide={ () => setShowEditModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId='formName'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type='text'
                                value={ selectedUser?.name || "" }
                                onChange={ (e) =>
                                    setSelectedUser({ ...selectedUser, name: e.target.value })
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId='formEmail' className='mt-3'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type='email'
                                value={ selectedUser?.email || "" }
                                onChange={ (e) =>
                                    setSelectedUser({ ...selectedUser, email: e.target.value })
                                }
                            />
                        </Form.Group>

                        <Form.Group
                            controlId='formPassword'
                            className='mt-3 position-relative'
                        >
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type={ showPassword ? "text" : "password" }
                                value={ selectedUser?.password || "" }
                                onChange={ (e) =>
                                    setSelectedUser({
                                        ...selectedUser,
                                        password: e.target.value
                                    })
                                }
                            />
                            <i
                                className={ `bi ${
                                    showPassword ? "bi-eye-slash" : "bi-eye"
                                } position-absolute top-50 end-0 me-3` }
                                style={ { cursor: "pointer" } }
                                onClick={ () => setShowPassword(!showPassword) }
                            ></i>
                        </Form.Group>

                        <Form.Group
                            controlId='formConfirmPassword'
                            className='mt-3 position-relative'
                        >
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type={ showPassword ? "text" : "password" }
                                value={ confirmPassword }
                                onChange={ (e) => setConfirmPassword(e.target.value) }
                            />
                            <i
                                className={ `bi ${
                                    showPassword ? "bi-eye-slash" : "bi-eye"
                                } position-absolute top-50 end-0 me-3` }
                                style={ { cursor: "pointer" } }
                                onClick={ () => setShowPassword(!showPassword) }
                            ></i>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={ () => setShowEditModal(false) }>
                        Close
                    </Button>
                    <Button variant='primary' onClick={ handleSaveEdit }>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */ }
            <Modal show={ showDeleteModal } onHide={ () => setShowDeleteModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete { selectedUser?.name }?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={ () => setShowDeleteModal(false) }>
                        Cancel
                    </Button>
                    <Button variant='danger' onClick={ handleConfirmDelete }>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export { EmployeeManagement };
