import React from "react";
import { TextField } from "@material-ui/core";
import MaskedInput from "react-text-mask";

import { BasicField, Error } from "./FormikInput.styles";

export const FormikIncome = ({
  field,
  field: { ...fields },
  form: { touched, errors, name },
  ...props
}: any) => (
  <>
    <MaskedInput
      placeholder="Yearly Income"
      mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
      id="yearly-income"
      render={(ref: any, props: any) => (
        <BasicField
          {...props}
          innerRef={ref}
          id="income"
          variant="outlined"
          input="number"
          selectedTheme="dark"
          placeholder="Yearly Income"
          {...props}
          {...fields}
          invalid={touched[fields.name] && errors[fields.name] ? 1 : 0}
        />
      )}
    />
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
  </>
);
