import React, { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PropertyClass } from "@prisma/client";
import { create } from "@actions/user";

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

const CreateUser = ({ onSubmit }) => {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      properties: [
        {
          taxDeclarationNumber: "",
          location: "",
          class: "",
          assessedValue: "",
          // lastPayment: ''
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  const submit = useCallback(
    async (values) => {
      const user = await create(values);

      onSubmit(user);
      reset();
    },
    [onSubmit, reset]
  );

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="row mb-3">
        <div className="col-md-3 mb-3">
          <div className="form-group info">
            <label htmlFor="name">Taxpayer</label>
            <input
              type="text"
              className="form-control"
              id="name"
              {...register("name", { required: true })}
              placeholder="Enter name"
            />
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="form-group info">
            <label htmlFor="email">Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
            />
          </div>
        </div>
      </div>

      <div className="fs-5 mb-3">
        <strong>Property Information</strong>
      </div>

      {fields.map((field, index) => (
        <div className="row" key={field.id}>
          <div className="col-md-2 mb-3">
            <div className="form-group info">
              <label htmlFor={`taxDeclaration_${index}`}>
                Tax Declaration No.
              </label>
              <input
                type="text"
                className="form-control"
                id={`taxDeclaration_${index}`}
                {...register(`properties.${index}.taxDeclarationNumber`, {
                  required: true,
                })}
                placeholder="01-1234-12345"
              />
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="form-group info">
              <label htmlFor={`taxDeclaration_${index}`}>PIN</label>
              <input
                type="text"
                className="form-control"
                id={`pin_${index}`}
                {...register(`properties.${index}.pin`, {
                  required: true,
                })}
                placeholder="012-12-123-12-123"
              />
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="form-group info">
              <label htmlFor={`propertyLocation_${index}`}>
                Property Location
              </label>
              <select
                className="form-control"
                id={`propertyLocation_${index}`}
                {...register(`properties.${index}.location`, {
                  required: true,
                })}
              >
                <option value="" disabled>
                  Select
                </option>
                {locations.map((location, i) => (
                  <option className="fs-property" key={i} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="form-group info">
              <label htmlFor={`classification_${index}`}>Classification</label>
              <select
                className="form-control"
                id={`classification_${index}`}
                {...register(`properties.${index}.class`, {
                  required: true,
                })}
              >
                <option value="" disabled>
                  Select
                </option>
                <option value={PropertyClass.RESIDENTIAL}>Residential</option>
                <option value={PropertyClass.AGRICULTURAL}>Agricultural</option>
                <option value={PropertyClass.COMMERCIAL}>Commercial</option>
                <option value={PropertyClass.INDUSTRIAL}>Industrial</option>
                <option value={PropertyClass.MINERAL}>Mineral</option>
                <option value={PropertyClass.MINERAL}>Special</option>
              </select>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="form-group info">
              <label htmlFor={`assessedValue_${index}`}>Assessed Value</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">₱</span>
                </div>
                <input
                  {...register(`properties.${index}.assessedValue`, {
                    required: true,
                    pattern: /^\d+(\.\d{1,2})?$/,
                  })}
                  type="text"
                  className="form-control"
                  id={`assessedValue_${index}`}
                />
              </div>
            </div>
          </div>
          {/*<div className='col-md-2 mb-3'>*/}
          {/*    <div className='form-group info'>*/}
          {/*        <label htmlFor={ `lastPayment_${ index }` }>*/}
          {/*            Date of Last Payment*/}
          {/*        </label>*/}
          {/*        <input*/}
          {/*            type='date'*/}
          {/*            className='form-control'*/}
          {/*            id={ `lastPayment_${ index }` }*/}
          {/*        />*/}
          {/*    </div>*/}
          {/*</div>*/}

          {index !== 0 && (
            <div className="col-md-1 align-self-center">
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => remove(index)}
              >
                X
              </button>
            </div>
          )}

          <hr className="pb-1" />
        </div>
      ))}

      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={() =>
          append({
            taxDeclarationNumber: "",
            location: "",
            class: "",
            assessedValue: "",
            // lastPayment: ''
          })
        }
      >
        Add Another Property
      </button>
      <button type="submit" className="btn btn-sm btn-primary ms-2">
        Create
      </button>
    </form>
  );
};

export { CreateUser };
