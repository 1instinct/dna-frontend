/* eslint-disable no-console */
import React from "react";

// import { Close } from '@carvana/icons';

export const FinancialPrivacyModal = () => {
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
        Rev May 2018
      </div>
      <div className="fp-modal-content-container">
        <table>
          <tbody>
            <tr className="fp-modal-table-title">
              <td className="left">F A C T S</td>
              <td className="right">
                WHAT DO WE DO WITH YOUR PERSONAL INFORMATION?
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr className="fp-modal-table-content two">
              <td className="left">Why?</td>
              <td className="right">
                Financial companies choose how they share your personal
                information. Federal law gives consumers the right to limit some
                but not all sharing. Federal law also requires us to tell you
                how we collect, share, and protect your personal information.
                Please read this notice carefully to understand what we do.
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr className="fp-modal-table-content two">
              <td className="left">What?</td>
              <td className="right">
                The types of personal information we collect and share depend on
                the product or service you have with us. This information can
                include:
                <ul>
                  <li>Social Security number and income</li>
                  <li>account balances and payment history</li>
                  <li>credit history and employment information</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr className="fp-modal-table-content two">
              <td className="left">How?</td>
              <td className="right">
                All financial companies need to share customers’ personal
                information to run their everyday business. In the section
                below, we list the reasons financial companies can share their
                customers’ personal information; the reasons{" "}
                {process.env.NEXT_PUBLIC_SITE_TITLE} chooses to share; and
                whether you can limit this sharing.
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr className="fp-modal-table-content three title">
              <td className="left">
                Reasons we can share your personal information
              </td>
              <td className="middle">Do we share?</td>
              <td className="right">Can you limit this sharing?</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For our every day business purposes –</b>
                </p>
                such as to process your transactions, maintain your account(s),
                respond to court orders and legal investigations, or report to
                credit bureaus
              </td>
              <td className="middle">Yes</td>
              <td className="right">No</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For our marketing purposes –</b>
                </p>
                to offer our products and services to you
              </td>
              <td className="middle">Yes</td>
              <td className="right">No</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For joint marketing with other financial companies</b>
                </p>
              </td>
              <td className="middle">Yes</td>
              <td className="right">No</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For our affiliates’ everyday business purposes –</b>
                </p>
                information about your transactions and experiences
              </td>
              <td className="middle">Yes</td>
              <td className="right">No</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For our affiliates’ everyday business purposes –</b>
                </p>
                information about your creditworthiness
              </td>
              <td className="middle">Yes</td>
              <td className="right">Yes</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For our affiliates to market to you</b>
                </p>
              </td>
              <td className="middle">Yes</td>
              <td className="right">Yes</td>
            </tr>
            <tr className="fp-modal-table-content three">
              <td className="left">
                <p>
                  <b>For nonaffiliates to market to you</b>
                </p>
              </td>
              <td className="middle">Yes</td>
              <td className="right">Yes</td>
            </tr>
          </tbody>
        </table>
        <table className="tuck-it-top">
          <tbody>
            <tr className="fp-modal-table-content two">
              <td className="left">To limit our sharing</td>
              <td className="right">
                <ul>
                  <li>
                    Call <strong>{process.env.NEXT_PUBLIC_PHONE}</strong>, or
                  </li>
                  <li>
                    Email{" "}
                    <a href="mailto:privacypolicy@company.com">
                      privacypolicy@company.com
                    </a>{" "}
                    and include the words &quot;Opt Out&quot; in the subject
                    line and body of your email.
                  </li>
                </ul>
                <p>
                  <strong>Please note:</strong> If you are a new customer, we
                  can begin sharing your information 30 days from the date we
                  sent this notice. When you are no longer our customer, we
                  continue to share your information as described in this
                  notice.
                </p>
                <p>
                  However, you can contact us at any time to limit our sharing.
                </p>
              </td>
            </tr>
            <tr className="fp-modal-table-content two">
              <td className="left">Questions?</td>
              <td className="right">
                Call <strong>{process.env.NEXT_PUBLIC_PHONE}</strong> or go to{" "}
                <a href={process.env.NEXT_PUBLIC_LEGAL_URL}>
                  www.{process.env.NEXT_PUBLIC_LEGAL_URL}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr className="fp-modal-table-content one-blue">
              <td colSpan={2}>
                <strong>Who we are</strong>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>Who is providing this notice?</strong>
              </td>
              <td>
                <i>{process.env.NEXT_PUBLIC_SITE_TITLE}</i>
              </td>
            </tr>
            <tr className="fp-modal-table-content one-blue">
              <td colSpan={2}>
                <strong>What we do</strong>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>How do we protect your personal information?</strong>
              </td>
              <td>
                To protect your personal information from unauthorized access
                and use, we use security measures that comply with federal law.
                These measures include computer safeguards and secured files and
                buildings.
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>How do we collect your personal information?</strong>
              </td>
              <td>
                We collect your personal information, for example, when you
                <ul>
                  <li>visit our website</li>
                  <li>
                    apply for financing or give us your income information
                  </li>
                  <li>
                    provide employment information or give us your contact
                    information
                  </li>
                  <li>pay your bills</li>
                </ul>
                <p>
                  We also collect your personal information from others, such as
                  credit bureaus, affiliates or other companies.
                </p>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>Why can’t I limit all sharing?</strong>
              </td>
              <td>
                Federal law gives you the right to limit only
                <ul>
                  <li>
                    sharing for affiliates’ everyday business purposes –
                    information about your creditworthiness
                  </li>
                  <li>
                    affiliates from using your information to market to you
                  </li>
                  <li>sharing for nonaffiliates to market to you</li>
                </ul>
                <p>
                  State laws and individual companies may give you additional
                  rights to limit sharing. See below for more on your rights
                  under state law.
                </p>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>
                  What happens when I limit sharing for an account I hold
                  jointly with someone else?
                </strong>
              </td>
              <td>
                <p>Your choices will apply to everyone on your account.</p>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>
                  What happens when I limit sharing for an account I hold
                  jointly with someone else?
                </strong>
              </td>
              <td>Your choices will apply to everyone on your account.</td>
            </tr>
            <tr className="fp-modal-table-content one-blue">
              <td colSpan={2}>
                <strong>Definitions</strong>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>Affiliates</strong>
              </td>
              <td>
                <p>
                  Companies related by common ownership or control. They can be
                  financial and nonfinancial companies.
                </p>
                <ul>
                  <li>
                    <i>
                      Quis nisi nostrud incididunt sunt cillum duis tempor
                      laborum enim cupidatat sunt aliquip esse commodo. Eiusmod
                      aliquip non nisi ipsum irure pariatur eiusmod deserunt in
                      duis pariatur reprehenderit. Pariatur magna irure eiusmod
                      irure anim amet mollit consectetur qui nostrud fugiat
                      excepteur. Elit ipsum in quis anim culpa dolore ex.
                      Laborum dolore veniam non laborum ullamco eu officia
                      voluptate nisi reprehenderit ut ea consequat et. Qui
                      consectetur est reprehenderit ullamco amet cillum sit
                      laboris id qui aliqua. Id occaecat sit est eu.
                    </i>
                  </li>
                </ul>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>Nonaffiliates</strong>
              </td>
              <td>
                <p>
                  Companies not related by common ownership or control. They can
                  be financial and nonfinancial companies.
                </p>
                <ul>
                  <li>
                    <i>
                      Nonaffiliates we share with could include insurance
                      companies, mortgage companies, credit card companies and
                      direct marketing companies.
                    </i>
                  </li>
                </ul>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td>
                <strong>Joint Marketing</strong>
              </td>
              <td>
                A formal agreement between nonaffiliated financial companies
                that together market financial products or services to you.
                <ul>
                  <li>
                    <i>
                      Our joint marketing partners could include insurance
                      companies, automobile dealers and credit card companies.
                    </i>
                  </li>
                </ul>
              </td>
            </tr>
            <tr className="fp-modal-table-content one-blue">
              <td colSpan={2}>
                <strong>Other important information</strong>
              </td>
            </tr>
            <tr className="tr-white tr-col-2">
              <td colSpan={2}>
                <p>
                  <strong>California residents:</strong> We will not share
                  personal information with nonaffiliates to market to you,
                  except with your express consent. We will not share your
                  personal and financial information with affiliates or joint
                  marketing companies, if you instruct us not to do so. To limit
                  our sharing with affiliates and joint marketing companies,
                  please send an email to{" "}
                  <a href="mailto:privacypolicy@company.com">
                    privacypolicy@company.com
                  </a>{" "}
                  and include the words “Opt Out” in the subject line and body
                  of your email, or call us at (555)555-5555.
                </p>
                <p>
                  <strong>Vermont residents:</strong> We will not share personal
                  information with nonaffiliates to market to you, or share
                  consumer report information about you with affiliates or joint
                  marketing companies, except with your express consent.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ElectronicSignaturesModal.propTypes = {
//   handleClose: PropTypes.func.isRequired,
// };
