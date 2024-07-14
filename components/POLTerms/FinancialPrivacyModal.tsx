/* eslint-disable no-console */
import React from "react";

// import { Close } from '@carvana/icons';

export const PolFinancialPrivacyModal = () => {
  const entityName = process.env.NEXT_PUBLIC_ENTITY_NAME;
  const currYear = new Date().getFullYear();
  return (
    <div className="fp-modal-container">
      <div className="fp-revision-and-print">
        <a
          href={`${window.location}/privacy_policy.pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Click HERE to Print
        </a>
        <br />
        Rev May {currYear}
      </div>
      <div className="fp-modal-content-container">
        <p>
          {entityName} respects the privacy of its website’s users. The
          following company privacy policy is designed to inform you, as a user
          of the website, about the types of information that the company may
          gather from you in connection with your use of the website.
        </p>
        <p>
          BY USING OR ACCESSING THE WEBSITE, YOU ARE ACCEPTING THE PRACTICES
          DESCRIBED IN THIS PRIVACY POLICY.
        </p>
        <p>
          The company may collect a range of personal information from and about
          the website’s users.
        </p>
        <p>
          That information may include each user’s name, address, email
          addresses, telephone number financial information such as your payment
          method (valid credit card number, type, expiration date).
        </p>
        <p>
          The company uses the personal information in the file we maintain
          about you, and other information we obtain from your current and past
          activities on the website.
        </p>
        <p>
          (1) to deliver the products that you have requested; (2) to manage
          your account and provide you with customer support; (3) to communicate
          with you by email, telephone and/or mobile devices about products that
          may be of interest to you; (4) to inform you of updates; (5) to detect
          and protect us against error and fraud. We may use financial
          information or payment method to process payment for any purchases
          made on the website.
        </p>
        <p>
          The company may in its sole discretion, change this Privacy Policy
          from time to time. Any and all changes to the company’s Privacy Policy
          will be reflected on this page.
        </p>
        <p>
          Unless stated otherwise, our current Privacy Policy applies to all
          information that we have about you and your account.
        </p>
        <p>
          Users should regularly check this page for any changes to this Privacy
          Policy. However, company may, as determined in its discretion, decide
          to notify users of changes made to this Privacy Policy via email or
          otherwise.
        </p>
        <p>
          Accordingly, it is important that users always maintain and update
          their contact information.
        </p>
        <p>
          The company recognizes that it must use customer information
          responsibly. Your information is contained behind secured networks and
          is only accessible by a limited number of persons, and they are
          required to keep the information confidential.
        </p>
      </div>
    </div>
  );
};

// ElectronicSignaturesModal.propTypes = {
//   handleClose: PropTypes.func.isRequired,
// };
