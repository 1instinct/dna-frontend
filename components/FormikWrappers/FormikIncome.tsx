import React from "react";
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

import { BasicField } from "./FormikInput.styles";
import { fieldA11y, FieldLabel, FieldError } from "./fieldA11y";

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
}: any) => {
  const a11y = fieldA11y({ name: fields.name, id: "income", touched, errors });

  return (
    <>
      <FieldLabel htmlFor={a11y.inputId}>
        {props.label || "Yearly Income"}
      </FieldLabel>
      <MaskedInput
        placeholder="Yearly Income"
        mask={currencyMask}
        id="yearly-income"
        {...fields}
        render={(ref: any, inputProps: any) => (
          <BasicField
            {...inputProps}
            {...a11y.inputProps}
            innerRef={ref}
            placeholder="Yearly Income"
            inputMode="numeric"
            invalid={a11y.isInvalid ? 1 : 0}
          />
        )}
      />
      <FieldError id={a11y.errorId}>{a11y.error}</FieldError>
    </>
  );
};
