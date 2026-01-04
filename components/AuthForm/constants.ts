import * as Yup from "yup";

export enum AuthFormType {
  login = "login",
  signup = "signup",
  reset_password = "reset_password",
  update_password = "update_password", // not implemented
  update_email = "update_email" // not implemented
}

export const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short").required("Required"),
  passwordConfirm: Yup.string()
    .min(6, "Too Short")
    .test(
      "passwords-match",
      "Passwords must match",
      function (value: string | undefined) {
        return this.parent.password === value;
      }
    )
    .required("Required"),
  phoneNumber: Yup.string()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number")
    .required("Phone number is required")
});

export const LoginSchema = Yup.object().shape({
  username: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short").required("Required")
});

export const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required")
});

export const loginForm = {
  title: "LOGIN",
  fields: {
    username: "",
    password: ""
  },
  validate: LoginSchema
};

export const signupForm = {
  title: "SIGN UP",
  fields: {
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: ""
  },
  validate: SignupSchema
};

export const resetPasswordForm = {
  title: "RESET PASSWORD",
  fields: {
    email: ""
  },
  validate: ForgotPasswordSchema,
  onSubmit: async (values: { email: string }) => {}
};

export const updatePasswordForm = {
  title: "RESET PASSWORD",
  fields: {
    email: ""
  },
  validate: ForgotPasswordSchema,
  onSubmit: async () => {}
};

export const updateEmailForm = {
  title: "RESET PASSWORD",
  fields: {
    email: ""
  },
  validate: ForgotPasswordSchema,
  onSubmit: async () => {}
};
