import React from "react";
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

import { BasicField, Error } from "./FormikInput.styles";

const currencyMask = createNumberMask({
  prefix: "$",
  suffix: "",
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ",",
  allowDecimal: false,
  decimalSymbol: ".",
  decimalLimit: 0,
  integerLimit: 10,
  allowNegative: false,
  allowLeadingZeroes: false
});

export const FormikIncome = ({
  field,
  field: { ...fields },
  form: { touched, errors, name },
  ...props
}: any) => (
  <>
    <MaskedInput
      placeholder="Yearly Income"
      mask={currencyMask}
      id="yearly-income"
      {...fields}
      render={(ref: any, inputProps: any) => (
        <BasicField
          {...inputProps}
          innerRef={ref}
          id="income"
          placeholder="Yearly Income"
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
