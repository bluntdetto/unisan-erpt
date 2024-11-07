import React, {
    experimental_taintObjectReference,
    useCallback,
    useState,
} from "react";
import { Button, Modal } from "react-bootstrap";
import { deleteUser } from "@actions/user";

const DeleteUser = ({ email, onDelete }) => {
    const [open, setOpen] = useState(false);
    const confirmDelete = useCallback(
        (email) => {
            deleteUser(email);
            onDelete(email);
            setOpen(false);
        },
        [onDelete]
    );

    return (
        <>
            <Modal show={open} onHide={() => setOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this user?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => confirmDelete(email)}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Button variant="link" onClick={() => setOpen(true)}>
                <i className="bi bi-trash text-danger"></i>
            </Button>
        </>
    );
};

export { DeleteUser };
