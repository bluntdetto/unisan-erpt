import React, { useCallback, useState } from "react";
import { Button, Form, Modal, InputGroup } from "react-bootstrap";
import { PropertyClass } from "@prisma/client";
import { useFieldArray, useForm } from "react-hook-form";
import { update } from "@actions/user";

const locations = [
    "ALMACEN",
    "BALAGTAS",
    "BALANACAN",
    "BONIFACIO",
    "IBA. BULO",
    "ILA. BULO",
    "BURGOS",
    "IBA. CABULIHAN",
    "ILA. CABULIHAN",
    "CAIGDAL",
    "F. DE JESUS",
    "GEN. LUNA",
    "IBA. KALILAYAN",
    "ILA. KALILAYAN",
    "MABINI",
    "IBA. MAIROK",
    "ILA. MAIROK",
    "MALVAR",
    "MAPUTAT",
    "MULIGUIN",
    "PAG-AGUASAN",
    "IBA. PANAON",
    "ILA. PANAON",
    "PLARIDEL",
    "POCTOL",
    "PUNTA",
    "R. LAPU-LAPU",
    "R. MAGSAYSAY",
    "R. SOLIMAN",
    "IBA. RIZAL",
    "ILA. RIZAL",
    "SAN ROQUE",
    "SOCORRO",
    "TAGUMPAY",
    "TUBAS",
    "TUBIGAN",
].sort();

const EditUser = ({ user, onSave }) => {
    const [open, setOpen] = useState(false);
    const { handleSubmit, register, reset, control } = useForm({
        defaultValues: user,
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "properties",
    });
    const [removed, setRemoved] = useState([]);

    const removeProperty = useCallback(
        (index) => {
            setRemoved((prev) => [...prev, fields[index]]);
            remove(index);
        },
        [fields, remove]
    );

    const submit = useCallback(
        async (values) => {
            const user = await update(values.id, values);
            onSave(user);
            setOpen(false);
            reset();
        },
        [onSave, reset]
    );

    return (
      <>
        <Modal
          show={open}
          onHide={() => {
            setOpen(false);
            const timer = setTimeout(() => {
              reset();
              clearTimeout(timer);
            }, 500);
          }}
          size="md"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit(submit)}>
              <Form.Group controlId="formName">
                <Form.Label>Taxpayer</Form.Label>
                <Form.Control {...register("name")} type="text" required />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control {...register("email")} type="email" required />
              </Form.Group>

              {/* Property Information */}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-secondary rounded p-3 mt-3"
                >
                  <h5>Property {index + 1}</h5>

                  <Form.Group
                    controlId={`formTaxDeclaration${index}`}
                    className="mt-3"
                  >
                    <Form.Label>Tax Declaration No.</Form.Label>
                    <Form.Control
                      {...register(`properties.${index}.taxDeclarationNumber`)}
                      type="text"
                      required
                      placeholder="01-1234-12345"
                    />
                  </Form.Group>
                  <Form.Group controlId={`formPin${index}`} className="mt-3">
                    <Form.Label>PIN</Form.Label>
                    <Form.Control
                      {...register(`properties.${index}.pin`)}
                      type="text"
                      required
                      placeholder="012-12-123-12-123"
                    />
                  </Form.Group>
                  <Form.Group
                    controlId={`formPropertyLocation${index}`}
                    className="mt-3"
                  >
                    <Form.Label>Property Location</Form.Label>
                    <Form.Select
                      {...register(`properties.${index}.location`, {
                        required: true,
                      })}
                    >
                      <option value="" disabled>
                        Select Location
                      </option>
                      {locations.map((location, i) => (
                        <option
                          className="fs-property"
                          key={i}
                          value={location}
                        >
                          {location}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group
                    controlId={`formClassification${index}`}
                    className="mt-3"
                  >
                    <Form.Label>Classification</Form.Label>
                    <Form.Select
                      {...register(`properties.${index}.class`, {
                        required: true,
                      })}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value={PropertyClass.RESIDENTIAL}>
                        Residential
                      </option>
                      <option value={PropertyClass.AGRICULTURAL}>
                        Agricultural
                      </option>
                      <option value={PropertyClass.COMMERCIAL}>
                        Commercial
                      </option>
                      <option value={PropertyClass.INDUSTRIAL}>
                        Industrial
                      </option>
                      <option value={PropertyClass.MINERAL}>Mineral</option>
                      <option value={PropertyClass.SPECIAL}>Special</option>
                    </Form.Select>
                  </Form.Group>

                  {/*<Form.Group*/}
                  {/*    controlId={ `formLastPayment${ index }` }*/}
                  {/*    className='mt-3'*/}
                  {/*>*/}
                  {/*    <Form.Label>Date of Last Payment</Form.Label>*/}
                  {/*    <Form.Control type='date' />*/}
                  {/*</Form.Group>*/}

                  <Form.Group
                    controlId={`formAssessedValue${index}`}
                    className="mt-3"
                  >
                    <Form.Label>Assessed Value</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>₱</InputGroup.Text>{" "}
                      <Form.Control
                        {...register(`properties.${index}.assessedValue`, {
                          required: true,
                          pattern: /^\d+(\.\d{1,2})?$/,
                        })}
                        type="text"
                        className="form-control"
                        id={`assessedValue_${index}`}
                      />
                    </InputGroup>
                  </Form.Group>

                  {index !== 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-3"
                      onClick={() => removeProperty(index)}
                    >
                      Remove Property
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() =>
                  append({
                    taxDeclarationNumber: "",
                    location: "",
                    class: "",
                    assessedValue: "",
                  })
                }
              >
                Add Another Property
              </Button>
              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  type="submit"
                  className="mt-3 d-block"
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        <Button variant="link" onClick={() => setOpen(true)}>
          <i className="bi bi-pencil"></i>
        </Button>
      </>
    );
};

export { EditUser };
