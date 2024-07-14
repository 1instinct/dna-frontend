import React from "react";

import { TermsCheckbox } from "./FormikInput.styles";

export const FormikCheckbox = ({
  field,
  fields: { ...fields },
  form: { setFieldValue, touched, errors },
  accepted,
  handleTermCheckbox,
  nextTerm,
  ...props
}: any) => {
  const nextParent = () => {
    console.log("TERM CHECKED: ", field.name, field.value);
    handleTermCheckbox();
    setFieldValue(field.name, !accepted, false);
    setTimeout(() => nextTerm(), 333);
  };

  return (
    <>
      <TermsCheckbox
        {...props}
        id={field.name}
        label=""
        accepted={accepted}
        // isAccepted={isAccepted}
        onChange={nextParent}
        boxClassName="checkbox-style"
        labelClassName="checkbox-label"
      />
    </>
  );
};
