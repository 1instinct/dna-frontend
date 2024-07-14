import mailchimp from "@mailchimp/mailchimp_marketing";
import { NextApiRequest, NextApiResponse } from "next";
import fetch, { FormData } from "node-fetch";

const isDebug = process.env.NEXT_PUBLIC_IS_DEBUG_MODE === "true";

const mailchimpAudienceId =
  process.env.NEXT_PUBLIC_MAILCHIMP_AUDIENCE_ID ||
  process.env.MAILCHIMP_AUDIENCE_ID ||
  "";
const mailchimpApiKey =
  process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY ||
  process.env.MAILCHIMP_API_KEY ||
  "";
const mailchimpUser =
  process.env.NEXT_PUBLIC_MAILCHIMP_USER || process.env.MAILCHIMP_USER || "";

mailchimp.setConfig({
  apiKey: mailchimpApiKey,
  server: mailchimpUser
});

const ghlApiUrl =
  process.env.NEXT_PUBLIC_GOHIGHLEVEL_API_URL ||
  "https://rest.gohighlevel.com/v1";
const ghlApiKey = process.env.NEXT_PUBLIC_GOHIGHLEVEL_API_KEY || "";
const ghlLocation = process.env.NEXT_PUBLIC_GOHIGHLEVEL_LOCATION_ID || "";
const ghlForm = process.env.NEXT_PUBLIC_GOHIGHLEVEL_FORM_ID || "";

const mailerService = process.env.NEXT_PUBLIC_MAILER;

async function handleGoHighLevel({
  email,
  firstName,
  lastName,
  phone,
  res
}: any) {
  isDebug && console.log("Handling GoHighLevel contact: ", email);
  if (!ghlLocation || !ghlForm) {
    return res.status(500).json({ error: "Missing GoHighLevel Details" });
  }

  try {
    const searchResponse = await fetch(
      `${ghlApiUrl}/contacts/lookup?email=${email}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    const searchData: any = await searchResponse.json();

    isDebug && console.log("Search Data:", searchData);

    if (searchData && searchData.contacts && searchData.contacts.length > 0) {
      isDebug && console.log("Contact found, updating...");
      const contactId = searchData.contacts[0].id;

      const updateResponse = await fetch(`${ghlApiUrl}/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          source: "newsletter-signup"
        })
      });

      if (updateResponse.ok) {
        isDebug && console.log("Contact updated successfully");
        const updateData = await updateResponse.json();
        return res.status(200).json(updateData);
      } else {
        throw new Error("Failed to update contact");
      }
    } else {
      // Create a new contact if not found
      let formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("formId", ghlForm);
      formData.append("location_id", ghlLocation);
      formData.append("eventData[source]", "direct");

      const createResponse = await fetch(
        "https://services.leadconnectorhq.com/forms/submit",
        {
          method: "POST",
          body: formData
        }
      );

      if (createResponse.ok) {
        isDebug && console.log("Contact created successfully");
        const createData = await createResponse.json();
        return res.status(201).json(createData);
      } else {
        throw new Error("Failed to create contact");
      }
    }
  } catch (error: any) {
    console.error("Error handling GoHighLevel contact:", error);
    return res.status(500).json({ error: error.message || error.toString() });
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, firstName, lastName, phone, newContact } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (mailerService !== "mailchimp" && mailerService !== "gohighlevel") {
    return res.status(400).json({ error: "Invalid mailer service" });
  }

  if (mailerService === "mailchimp") {
    if (!mailchimpApiKey || !mailchimpAudienceId) {
      return res.status(500).json({ error: "Missing MailChimp Details" });
    }
    const mailchimpId = `${mailchimpAudienceId}`;

    if (newContact) {
      try {
        await mailchimp.lists.addListMember(mailchimpId, {
          email_address: email,
          status: "subscribed"
        } as any);

        return res.status(201).json({ error: "" });
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || error.toString() });
      }
    }

    try {
      await mailchimp.lists.updateListMember(mailchimpId, email, {
        email_address: email,
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          PHONE: phone
        }
      } as any);

      return res.status(201).json({ error: "" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || error.toString() });
    }
  }

  if (mailerService === "gohighlevel") {
    return handleGoHighLevel({ email, firstName, lastName, phone, res });
  }

  return res.status(500).json({ error: "Invalid mailer service" });
};
