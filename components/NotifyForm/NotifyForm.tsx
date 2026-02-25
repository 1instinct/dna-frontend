import React, { useEffect, useState } from "react";
import { cn } from "@lib/utils";

const notifyQuestions = [
  {
    id: "email",
    question: "Wanna know when the product becomes available?",
    placeholder: "Email",
    buttonText: "Get Updates"
  },
  {
    id: "firstName",
    question: "Great. Btw, what's your name?",
    placeholder: "First Name",
    buttonText: "Save Name"
  },
  {
    id: "lastName",
    question: "Ok, and your last name?",
    placeholder: "Last Name",
    buttonText: "Save Name"
  },
  {
    id: "phone",
    question: "Perfect, wanna get text updates from us?",
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
    const isLast = currentQuestion >= notifyQuestions.length;
    return notifyQuestions.map((question, i) => {
      const isCurrent = i === currentQuestion;
      return (
        <div
          key={`question-${i}`}
          className={cn(
            "transition-all duration-300",
            isCurrent ? "block" : "hidden"
          )}
        >
          {!isLast && (
            <div className="space-y-3">
              <p className="font-title text-base font-semibold text-foreground">
                {question.question}
              </p>
              <input
                id={question.id}
                type="text"
                placeholder={question.placeholder}
                value={switchQuestionValue(question.id)}
                name="text"
                onChange={(e: any) =>
                  switchQuestionSetter(question.id, e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                id="signup-button"
                type="submit"
                className="w-full cursor-pointer rounded-lg border-none bg-brand px-6 py-3 font-title text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-brand/90 hover:-translate-y-px active:translate-y-0"
              >
                {question.buttonText}
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e: any, newContact: boolean) => {
    e.preventDefault();

    const res = await fetch("/api/subscribe", {
      body: JSON.stringify({
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        newContact: false
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const resBody = await res.json();
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

  return (
    <div className="mx-auto w-full max-w-md px-5 py-8">
      <div>
        <form
          onSubmit={(e: any) =>
            currentQuestion > 0
              ? handleSubmit(e, false)
              : handleSubmit(e, true)
          }
        >
          {currentQuestion < notifyQuestions.length
            ? renderQuestions(currentQuestion)
            : null}
          {/* MailChimp anti-spam fields */}
          <div
            style={{ position: "absolute", left: "-5000px" }}
            aria-hidden="true"
          >
            <input
              type="text"
              name="b_eb05e4f830c2a04be30171b01_8281a64779"
              tabIndex={-1}
              onChange={() => null}
              value=""
            />
          </div>
        </form>

        {status === "sending" && (
          <p className="mt-3 font-body text-sm text-muted-foreground">
            sending...
          </p>
        )}
        {status === "error" && (
          <p className="mt-3 font-body text-sm text-destructive">
            {message === "Bad Request"
              ? `${message} or Email already exists`
              : message}
          </p>
        )}
        {status === "success" &&
          currentQuestion >= notifyQuestions.length && (
            <p className="mt-3 font-body text-sm text-green-600">{message}</p>
          )}
      </div>
      <a
        id="mailto"
        href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
        className="mt-6 block text-center font-body text-sm text-brand transition-colors hover:underline"
      >
        Got Questions? We'd love to hear from you.
      </a>
    </div>
  );
};
