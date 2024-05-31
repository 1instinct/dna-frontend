// Reference:
// https://leerob.io/blog/mailchimp-next-js

import React, { useEffect, useState } from "react";

import {
  NotifyFormContainer,
  NotifyText,
  FormWrapper,
  QuestionWrapper,
  EmailInput,
  Button,
  MailTo
} from "./NotifyForm.styles";

const notifyQuestions = [
  {
    id: "email",
    question: "🎧 Get music in your inbox 🎧",
    placeholder: "Email",
    buttonText: "Signup"
  },
  {
    id: "firstName",
    question: "Thanks! Btw, what's your name? 🤔",
    placeholder: "First Name",
    buttonText: "Save Name"
  },
  {
    id: "lastName",
    question: "Sweet, and your last name? 🤔",
    placeholder: "Last Name",
    buttonText: "Save Name"
  },
  {
    id: "phone",
    question: "Amazing, want texts from us? 📱",
    placeholder: "Phone",
    buttonText: "Sure"
  }
];

export const NotifyForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const switchQuestionSetter = (id: string, val: string) => {
    switch (id) {
      case "email":
        return setEmail(val);
      case "firstName":
        return setFirstName(val);
      case "lastName":
        return setLastName(val);
      case "phone":
        return setPhone(val);
      default:
        return setValue(val);
    }
  };

  const switchQuestionValue = (id: string) => {
    switch (id) {
      case "email":
        return email;
      case "firstName":
        return firstName;
      case "lastName":
        return lastName;
      case "phone":
        return phone;
      default:
        return value;
    }
  };

  const renderQuestions = (questionIndex: number) => {
    const isCurrent = questionIndex === currentQuestion;
    const isFirst = currentQuestion < 1;
    const isLast = currentQuestion >= notifyQuestions.length;
    return notifyQuestions.map((question, i) => {
      return (
        <QuestionWrapper key={`question-${i}`} isVisible={isCurrent}>
          {!isLast && (
            <>
              <NotifyText>{question.question}</NotifyText>
              <EmailInput
                id={question.id}
                type="text"
                placeholder={question.placeholder}
                value={switchQuestionValue(question.id)}
                name="text"
                onChange={(e: any) =>
                  switchQuestionSetter(question.id, e.target.value)
                }
              />
              <Button id="signup-button" type="submit">
                {question.buttonText}
              </Button>
            </>
          )}
        </QuestionWrapper>
      );
    });
  };

  const handleSubmit = async (e: any, newContact: boolean) => {
    e.preventDefault();
    console.log("Submitting!");

    const res = await fetch("/api/subscribe", {
      body: JSON.stringify({
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        newContact: newContact
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const resBody = await res.json();
    console.log("Response: ", resBody);
    setStatus("sending");

    if (resBody.error) {
      setStatus("error");
      setMessage(resBody.error);
      return;
    } else {
      const nextQuestionIndex =
        currentQuestion < notifyQuestions.length
          ? currentQuestion + 1
          : currentQuestion;
      setStatus("success");
      setMessage("Thanks so much! We'll keep you posted.");
      setCurrentQuestion(nextQuestionIndex);
    }
  };

  const clearFields = () => {
    setEmail("");
    // setFirstName('');
    // setLastName('');
  };

  useEffect(() => {
    // if (status === "success") clearFields();
    // if(modalOpen && status === "success") clearFields();
  }, [status]);

  return (
    <>
      <defs>
        <rect id="rect" x="25%" y="25%" width="50%" height="50%" rx="15" />
        <clipPath id="clip">
          <use xlinkHref="#rect" />
        </clipPath>
      </defs>
      <NotifyFormContainer>
        <FormWrapper index={currentQuestion}>
          <form
            onSubmit={(e: any) =>
              currentQuestion < 1
                ? handleSubmit(e, true)
                : handleSubmit(e, false)
            }
          >
            {currentQuestion < notifyQuestions.length
              ? renderQuestions(currentQuestion)
              : null}
            {/* MailChimp anti-spam fields, real people should not fill this in and expect good things - do not remove this or risk form bot signups */}

            <div
              style={{ position: "absolute", left: "-5000px" }}
              aria-hidden="true"
            >
              <input
                type="text"
                name="b_eb05e4f830c2a04be30171b01_8281a64779"
                tabIndex={-1}
                onChange={(e: any) => null}
                value=""
              />
            </div>
          </form>
          {/* MailChimp Status */}
          {status === "sending" && (
            <NotifyText className="mc__alert mc__alert--sending">
              sending...
            </NotifyText>
          )}
          {status === "error" && (
            <NotifyText>
              {message === "Bad Request"
                ? `${message} or Email already exists`
                : message}
            </NotifyText>
          )}
          {status === "success" &&
            currentQuestion >= notifyQuestions.length && (
              <NotifyText>{message}</NotifyText>
            )}
        </FormWrapper>
        <MailTo id="mailto" href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`}>
          {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </MailTo>
      </NotifyFormContainer>
    </>
  );
};
