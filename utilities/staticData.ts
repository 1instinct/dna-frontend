import constants from "./constants";

const Static = {
  helperMessage: {
    email: "",
    password: "",
    phoneNumber: ""
  },
  questions: {
    account: {
      sebastian: "Thanks so much!",
      title: "Almost done!",
      subtitle: `One more step.`,
      description: `We'll send you a unique code to login.`
    }
  },
  labels: {
    email: "Email",
    password: "Password",
    phoneNumber: "Mobile Phone"
  },
  placeholders: {
    email: "EMAIL",
    password: "PASSWORD",
    phoneNumber: "MOBILE PHONE"
  },
  errors: {
    isRequired: "Required",
    minDateOfBirth: "You cannot have a Date of Birth prior to 1900",
    maxDateOfBirth: "You must be 18 years of age",
    annualIncomeMin: "Annual Income must be at least $4,000",
    annualIncomeMax: "Annual Income cannot be greater than $9,999,999",
    phoneNumberValid: "Please enter a valid Phone Number",
    passwordValid:
      "Password must contain a letter AND a number or special character",
    passwordMin: `Password must be at least ${constants.MIN_PASSWORD_LENGTH} characters`,
    passwordMax: `Password cannot be greater than ${constants.MAX_PASSWORD_LENGTH} characters`,
    passwordMatch: "Passwords do not match",
    emailMax: `Email cannot be greater than ${constants.MAX_EMAIL_LENGTH} characters`,
    emailValid: "Invalid email address"
  },
  submit: "Get My Terms!"
};

export default Static;
