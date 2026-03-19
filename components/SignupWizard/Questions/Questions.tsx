import { ref, object, string, bool, date } from "yup";

import Static from "../../../utilities/staticData";
import constants from "../../../utilities/constants";
import { Alert } from "../../Alerts";
import { Welcome } from "./Welcome";
import { PersonalInfo } from "./PersonalInfo";
import { DateOfBirth } from "./DateOfBirth";
import { HomeAddress } from "./HomeAddress";
import { YearlyIncome } from "./YearlyIncome";
import { Account } from "./Account";

import { toShortDateZeroFill } from "../../../utilities/DateHelpers";

const today = new Date();

export interface WizardStep {
  id: string;
  label: string;
  component: React.ComponentType;
  initialValues?: Record<string, any>;
  validationSchema?: ReturnType<typeof object>;
  actionLabel: string;
  onAction?: (values: any) => void;
}

export const Questions: WizardStep[] = [
  {
    id: "welcome",
    label: "Welcome",
    component: Welcome,
    actionLabel: "Get Started"
  },
  {
    id: "personal-info",
    label: "Personal Info",
    component: PersonalInfo,
    initialValues: {
      firstName: "",
      lastName: ""
    },
    validationSchema: object().shape({
      firstName: string().defined(Static.errors.isRequired),
      lastName: string().defined(Static.errors.isRequired)
    }),
    actionLabel: "Next"
  },
  {
    id: "date-of-birth",
    label: "Date of Birth",
    component: DateOfBirth,
    initialValues: {
      dateOfBirth: ""
    },
    validationSchema: object().shape({
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
        )
    }),
    actionLabel: "Next"
  },
  {
    id: "home-address",
    label: "Home Address",
    component: HomeAddress,
    initialValues: {
      homeAddress: "",
      unitNumber: ""
    },
    validationSchema: object().shape({
      homeAddress: string().defined(Static.errors.isRequired),
      unitNumber: string()
    }),
    actionLabel: "Next"
  },
  {
    id: "yearly-income",
    label: "Yearly Income",
    component: YearlyIncome,
    initialValues: {
      yearlyIncome: ""
    },
    validationSchema: object().shape({
      yearlyIncome: string().defined(Static.errors.isRequired)
    }),
    actionLabel: "Next",
    onAction: (values: any) => {
      const incomeNumber = parseFloat(values.yearlyIncome.replace(/\$|,/g, ""));
      if (incomeNumber < 4000) {
        Alert.fire({
          icon: "info",
          title: "Hold on!",
          text: Static.errors.annualIncomeMin,
          confirmButtonText: "I understand"
        });
        throw new Error(Static.errors.annualIncomeMin);
      } else if (incomeNumber > 9999999) {
        Alert.fire({
          icon: "info",
          title: "Hold on!",
          text: Static.errors.annualIncomeMax,
          confirmButtonText: "I understand"
        });
        throw new Error(Static.errors.annualIncomeMax);
      }
    }
  },
  {
    id: "account-details",
    label: "Account",
    component: Account,
    initialValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      acceptPrivacyTerms: false,
      acceptReportingTerms: false
    },
    validationSchema: object().shape({
      email: string().defined(Static.errors.isRequired),
      password: string()
        .defined(Static.errors.isRequired)
        .matches(constants.PASSWORD_REGEX, Static.errors.passwordValid),
      passwordConfirm: string()
        .required(Static.errors.isRequired)
        .oneOf([ref("password"), null], "Passwords must match"),
      acceptPrivacyTerms: bool().oneOf(
        [true],
        "Accept Terms & Conditions is required"
      ),
      acceptReportingTerms: bool().oneOf(
        [true],
        "Accept Terms & Conditions is required"
      )
    }),
    actionLabel: "Sign Up"
  }
];
