/* eslint-disable no-console */

// Vendor
// import { object, shape, number, integer, string } from 'yup';
import { ref, addMethod, mixed, object, string, bool, date } from "yup";

// Local
import Static from "../../../utilities/staticData";
import constants from "../../../utilities/constants";
import { Alert } from "../../Alerts";
import { Welcome } from "./Welcome";
import { PersonalInfo } from "./PersonalInfo";
import { CompanyAddress } from "./CompanyAddress";
import { Account } from "./Account";
import { CompanyDetails } from "./CompanyDetails";

import { toShortDateZeroFill } from "../../../utilities/DateHelpers";

// const SignupSchema = Yup.object().shape({
//   firstName: Yup.string()
//     .min(2, "Too Short!")
//     .max(50, "Too Long!")
//     .defined("Required"),
//   address: Yup.object().shape({
//     line1: Yup.string().defined("Required")
//   }),
//   dob: Yup.object().shape({
//     day: Yup.number()
//       .positive()
//       .integer()
//       .min(1, "Invalid.")
//       .max(31, "Invalid.")
//   })
// });

const today = new Date();

// const equalTo = ({reference, msg}: any) => {
//   return mixed().test({
//     name: "equalTo",
//     exclusive: false,
//     message: msg || `Password must be the same as ${reference}`,
//     params: {
//       reference: reference.path
//     },
//     test(value) {
//       return value === this.resolve(reference);
//     }
//   });
// };

// addMethod(string, "equalTo", equalTo);

export declare type FormikErrors<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object
      ? FormikErrors<Values[K][number]>[] | string | string[]
      : string | string[]
    : Values[K] extends object
    ? FormikErrors<Values[K]>
    : string;
};

interface QuestionsType {
  id: string;
  component: any;
  validationSchema?: any;
  validate?: (values: any) => void | object | Promise<FormikErrors<any>>;
  initialValues?: any;
  actionLabel?: string;
  onAction?: any;
  keepValuesOnPrevious?: boolean;
}

export const Questions: QuestionsType[] = [
  {
    id: "welcome",
    component: Welcome,
    actionLabel: "Start Signup"
  },
  {
    id: "personal-info",
    component: PersonalInfo,
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      dateOfBirth: "",
      email: ""
    },
    validationSchema: object().shape({
      firstName: string()
        .defined(Static.errors.isRequired)
        .required(Static.errors.isRequired),
      middleName: string(),
      lastName: string()
        .defined(Static.errors.isRequired)
        .required(Static.errors.isRequired),
      suffix: string(),
      dateOfBirth: date()
        .transform((currentValue, originalValue) =>
          toShortDateZeroFill(currentValue) === originalValue ||
          toShortDateZeroFill(currentValue) ===
            toShortDateZeroFill(originalValue)
            ? currentValue
            : new Date("")
        )
        .defined(Static.errors.isRequired)
        .typeError("Invalid date")
        .min(new Date("1/1/1900"), Static.errors.minDateOfBirth)
        .max(
          new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()),
          Static.errors.maxDateOfBirth
        ),
      email: string().defined(Static.errors.isRequired)
    }),
    actionLabel: "Next"
    // onAction: () => {
    //   // window.scrollTo(0,0);
    //   console.log("action taken");
    // }
  },
  {
    id: "company-details",
    component: CompanyDetails
  },
  {
    id: "home-address",
    component: CompanyAddress,
    initialValues: {
      homeAddress: "",
      unitNumber: ""
    },
    validationSchema: object().shape({
      homeAddress: string().defined(Static.errors.isRequired),
      unitNumber: string()
    }),
    actionLabel: "Next"
    // onAction: (sectionValues: any) => {
    //   window.scrollTo(0, 0);
    //   // console.log('ADDRESS ACTION VALS: ', sectionValues);
    //   if (sectionValues.homeAddress === "1 infinite loop") {
    //     throw new Error("Please reformat address");
    //   }
    // }
  },
  {
    id: "account-details",
    component: Account,
    initialValues: {
      phoneNumber: "",
      email: "",
      password: "",
      passwordConfirm: "",
      acceptSignatureTerms: false,
      acceptPrivacyTerms: false,
      acceptReportingTerms: false,
      acceptAuthorizeTerms: false
    },
    validationSchema: object().shape({
      phoneNumber: string()
        .defined(Static.errors.isRequired)
        .min(constants.PHONE_LENGTH, Static.errors.phoneNumberValid)
        .max(constants.PHONE_LENGTH, Static.errors.phoneNumberValid)
        .matches(constants.PHONE_REGEX, Static.errors.phoneNumberValid),
      email: string().defined(Static.errors.isRequired),
      password: string()
        .defined(Static.errors.isRequired)
        .matches(constants.PASSWORD_REGEX, Static.errors.passwordValid),
      passwordConfirm: string()
        .required(Static.errors.isRequired)
        .oneOf([ref("password"), null], "Passwords must match"),
      acceptSignatureTerms: bool().oneOf(
        [true],
        "Accept Terms & Conditions is required"
      ),
      acceptPrivacyTerms: bool().oneOf(
        [true],
        "Accept Terms & Conditions is required"
      ),
      acceptReportingTerms: bool().oneOf(
        [true],
        "Accept Terms & Conditions is required"
      ),
      acceptAuthorizeTerms: bool().oneOf(
        [true],
        "Accept Terms & Conditions is required"
      )
    }),
    actionLabel: "Signup",
    onAction: (sectionValues: any) => {
      window.scrollTo(0, 0);
      const phone = parseFloat(sectionValues.phoneNumber.replace(/\$|,/g, ""));
      // console.log("PHONE: ", phone);
      if (phone < 15000) {
        throw new Error("Something is wrong with your account details.");
      }
    }
  }
];
