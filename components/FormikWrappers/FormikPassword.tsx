import React, { useState } from "react";
import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";

import { BasicField, Error } from "./FormikInput.styles";

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordField = styled(BasicField)`
  width: 100%;
  padding-right: 40px;
  box-sizing: border-box;
`;

const ToggleButton = styled("button", {
  shouldForwardProp: (prop) => isPropValid(prop)
})`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
    opacity: 1;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export const FormikPassword = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <>
      <PasswordWrapper>
        <PasswordField
          {...props}
          {...fields}
          type={showPassword ? "text" : "password"}
          placeholder={props.label}
          styles={errors.length > 0 && { border: "solid 1px red" }}
          invalid={Boolean(touched[fields.name] && errors[fields.name])}
        />
        <ToggleButton
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </ToggleButton>
      </PasswordWrapper>
      {touched[fields.name] && errors[fields.name] ? (
        <Error>{errors[fields.name]}</Error>
      ) : null}
    </>
  );
};
