import React from "react";

import { TermsCheckbox } from "./FormikInput.styles";

/**
 * A terms checkbox. Its id is `id` or the field name; name it with a
 * `<label htmlFor>` next to it.
 */
export const FormikCheckbox = ({
  field,
  form: { setFieldValue, touched, errors },
  accepted,
  handleTermCheckbox,
  nextTerm,
  id,
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
        id={id || field.name}
        accepted={accepted}
        // isAccepted={isAccepted}
        onChange={nextParent}
        boxClassName="checkbox-style"
        labelClassName="checkbox-label"
      />
    </>
  );
};
