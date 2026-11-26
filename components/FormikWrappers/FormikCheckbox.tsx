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
  // Formik's render props: not attributes for the <input>.
  meta: _meta,
  ...props
}: any) => {
  const nextParent = () => {
    handleTermCheckbox();
    setFieldValue(field.name, !accepted, false);
    setTimeout(() => nextTerm(), 333);
  };

  return (
    <>
      <TermsCheckbox
        {...props}
        id={id || field.name}
        name={field.name}
        accepted={accepted}
        // Controlled by `accepted`, so the box shows the real state even when the slide
        // re-renders (it was uncontrolled and could reset after nextTerm moved the carousel).
        checked={Boolean(accepted)}
        onChange={nextParent}
      />
    </>
  );
};
