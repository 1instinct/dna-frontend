import { useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";
import { Formik, Form, Field, ErrorMessage, FormikProps } from "formik";
import FormikWizard from "formik-wizard";
import { useFormikContext } from "formik";
import { withWizard } from "react-albus";
import { AuthFormType, signupForm } from "../AuthForm/constants";
import { useAuth } from "../../config/auth";
import { SlideInLeft, SlideOutLeft } from "../Animations";
import { Questions } from "./Questions";
// import { Questions } from "./POLQuestions";
import { Alert } from "../Alerts";

import FormikWizardStepType from "formik-wizard";

import {
  MainWrapper,
  InitialTitle,
  Title,
  Subtitle,
  ContentWrapper,
  LeftHalf,
  RightHalf,
  WizardForm,
  WizardActions,
  PreviousButton,
  NextButton,
  SkipAction,
  LoginAction,
  Disclaimer,
  CongratsWrapper
} from "./SignupWizard.styles";
import constants from "@utilities/constants";
import { Loading } from "../Loading";

const ThreeViewer = dynamic(
  () => import("@components/shared/ThreeViewer").then((mod) => mod.ThreeViewer),
  {
    loading: () => <Loading />,
    ssr: false
  }
);

const FormWrapper: React.FC<any> = ({
  steps,
  children,
  // onEachStepSubmit,
  // onSubmit,
  // onNext,
  wizard,
  isLastStep,
  status,
  goToPreviousStep,
  // getErrorMessage,
  canGoBack,
  // onFinalSubmit,
  hasError,
  isDirty,
  showNextStep,
  actionLabel
}: any) => {
  const isMobile = useMediaQuery({
    // query: `(min-device-width: ${props => props.theme.breakpoints.values.lg}px)`
    query: `(max-device-width: 768px)`
  });

  // const { values, Formik, Form, Field } = useFormikContext();
  const { values }: any = useFormikContext();

  // const { step } = this.props;
  const termsAccepted = !!(
    (values.acceptSignatureTerms && values.acceptPrivacyTerms)
    // values.acceptReportingTerms &&
    // values.acceptAuthorizeTerms
  );

  const keyboardListener = (e: any) => {
    if (e.keyCode === 13) {
      wizard.next();
      return true;
    }
    return false;
  };

  useEffect(() => {
    window.addEventListener("keydown", keyboardListener);
    return () => {
      window.removeEventListener("keydown", keyboardListener);
    };
  });

  // We assume this method cannot be called on the first step
  // const goToNextStep = () => {
  //   console.log('next step: ', steps[stepNumber + 1]);
  //   const nextStepId = steps[stepNumber + 1].id;
  //   // setState({step: { id: "personal-info" }});
  //   setState(prevState => ({ ...prevState, stepNumber: prevState.stepNumber + 1, step: { id: nextStepId} }));
  // };

  switch (status ? status.code : status) {
    case 200:
      window.scrollTo(0, 0);
      return (
        <CongratsWrapper>
          <Title>{status.message}</Title>
          <Subtitle>{status.subtitle}</Subtitle>

          {/* <p>Need to fix something?</p>
          <PreviousButton onClick={goToPreviousStep} disabled={!canGoBack}>← Go Back</PreviousButton> */}
        </CongratsWrapper>
      );
    default:
      return (
        <WizardForm canGoBack={canGoBack}>
          {/* {isMobile && !canGoBack && (
            <InitialTitle>Welcome! Let's get you started..</InitialTitle>
          )} */}
          {children}
          <WizardActions>
            {canGoBack && (
              <PreviousButton
                variant="outline"
                onClick={goToPreviousStep}
                disabled={!canGoBack}
                width={20}
              >
                <i className="bts bt-angles-left" />
              </PreviousButton>
            )}
            {/* <NextButton type="submit" onClick={() => console.log(wizard, wizard.step, wizard.next)} disabled={isLastStep && !termsAccepted}>{actionLabel || (isLastStep ? 'Submit' : 'Next step')}</NextButton> */}
            {/* <NextButton type={isLastStep ? "submit" : "button"} onClick={() => { */}
            {isLastStep ? (
              <NextButton
                variant="solid"
                // type={isLastStep ? "submit" : "button"}
                onClick={() => {
                  console.log("next: ", values, wizard, isLastStep);
                  // console.log("next: ", wizard, isLastStep);
                  wizard.next();
                }}
                disabled={isLastStep && !termsAccepted}
              >
                {actionLabel || (isLastStep ? "Submit" : "Next")}
              </NextButton>
            ) : (
              <NextButton
                variant="solid"
                // type={isLastStep ? "submit" : "button"}
                onClick={() => {
                  constants.IS_DEBUG &&
                    console.log("next: ", values, wizard, isLastStep);
                  // console.log("next: ", wizard, isLastStep);
                  wizard.next();
                }}
                disabled={
                  (isLastStep && !termsAccepted) || hasError || !isDirty
                }
              >
                {actionLabel || (isLastStep ? "Submit" : "Next")}
              </NextButton>
            )}
          </WizardActions>
          {!canGoBack && (
            <Disclaimer>
              <Link href="/login">Already have an account?</Link>
            </Disclaimer>
          )}
          {/* {<div><pre>VALUE: {JSON.stringify(values, null, 2)}</pre></div>} */}
          {canGoBack && (
            <Disclaimer>
              Don’t worry your information is safe{" "}
              <span role="img" aria-label="lock">
                🔐
              </span>{" "}
              and we never share your information without your consent.
              {/* <Subtitle>– or –</Subtitle> */}
              <LoginAction>
                {/* <Link href="/login" target="_blank" rel="noopener noreferrer">
                  Already have an account?
                </Link> */}
                <Link href="/login">Already have an account?</Link>
              </LoginAction>
            </Disclaimer>
          )}
        </WizardForm>
      );
  }
};

export const SignupWizard = () => {
  const isLargeDevice = useMediaQuery({
    // query: `(min-device-width: ${props => props.theme.breakpoints.values.}px)`
    query: `(min-device-width: 768px)`
  });

  const { register } = useAuth();

  const handleSubmit = useCallback((values: any) => {
    new Promise((resolve, reject) => {
      register({ user: values })
        .then((res) => {
          console.log("yup: ", res);
          // setSubmitting(false);
          // router.push("/");
        })
        .catch((err) => {
          console.log("nope: ", err);
          // setSubmitting(false);
        });

      console.log("new Promise");
      return Promise.resolve({
        code: 200,
        status: 200,
        message: "Congrats!",
        subtitle: `Your new User ID is: ###`
      });
    })
      .then((res) => {
        console.log("handleSubmit res: ", res);
      })
      .catch((err) => {
        console.log("handleSubmit error: ", err);
        // toggleErrorModal();
        // setErrorMessage(err);
        Alert.fire({ icon: "error", title: "Uh oh!", text: err });
        // return Promise.resolve({
        //   message: 'Uh oh.',
        //   subtitle: err
        // })
      });
  }, []);

  return (
    <MainWrapper>
      <ContentWrapper>
        <LeftHalf show={isLargeDevice ? "flex" : "flex"}>
          {/* <ThreeViewer /> */}
          <Title>
            Enjoy The Journey{" "}
            <span role="img" aria-label="sunglasses">
              😎
            </span>
          </Title>
        </LeftHalf>
        <RightHalf isLargeDevice={isLargeDevice}>
          <SlideInLeft>
            <FormikWizard
              steps={Questions}
              // onSubmit={(values: any, { formikProps: { isSubmitting } }: any) => handleSubmit(values, isSubmitting)}
              onSubmit={(values) => handleSubmit(values)}
              render={FormWrapper}
            />
          </SlideInLeft>
        </RightHalf>
      </ContentWrapper>
    </MainWrapper>
  );
};
