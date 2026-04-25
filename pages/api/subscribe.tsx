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

function buildUtmTags(utmParams: any): string[] {
  if (!utmParams) return [];
  const entries = [
    ["utm_medium", utmParams.utm_medium],
    ["utm_source", utmParams.utm_source],
    ["utm_campaign", utmParams.utm_campaign],
    ["utm_content", utmParams.utm_content],
    ["utm_term", utmParams.utm_term],
    ["ad_id", utmParams.ad_id],
    ["adset_id", utmParams.adset_id],
    ["campaign_id", utmParams.campaign_id],
    ["ad_name", utmParams.ad_name],
    ["adset_name", utmParams.adset_name],
    ["campaign_name", utmParams.campaign_name],
    ["placement", utmParams.placement],
    ["site_source_name", utmParams.site_source_name]
  ];
  return entries
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}:${value}`);
}

async function handleGoHighLevel({
  email,
  firstName,
  lastName,
  phone,
  utmParams,
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
          source: utmParams?.utm_source || "newsletter-signup",
          tags: buildUtmTags(utmParams)
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
      formData.append(
        "eventData[source]",
        utmParams?.utm_source || "direct"
      );
      if (utmParams?.utm_medium)
        formData.append("eventData[medium]", utmParams.utm_medium);
      if (utmParams?.utm_campaign)
        formData.append("eventData[campaign]", utmParams.utm_campaign);
      if (utmParams?.utm_content)
        formData.append("eventData[content]", utmParams.utm_content);
      if (utmParams?.utm_term)
        formData.append("eventData[term]", utmParams.utm_term);
      if (utmParams?.ad_id)
        formData.append("eventData[adSource]", utmParams.ad_id);
      if (utmParams?.ad_name) formData.append("ad_name", utmParams.ad_name);
      if (utmParams?.adset_name)
        formData.append("adset_name", utmParams.adset_name);
      if (utmParams?.adset_id)
        formData.append("adset_id", utmParams.adset_id);
      if (utmParams?.campaign_id)
        formData.append("campaign_id", utmParams.campaign_id);
      if (utmParams?.campaign_name)
        formData.append("campaign_name", utmParams.campaign_name);
      if (utmParams?.placement)
        formData.append("placement", utmParams.placement);
      if (utmParams?.site_source_name)
        formData.append("site_source_name", utmParams.site_source_name);

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
  const { email, firstName, lastName, phone, newContact, utmParams } =
    req.body;

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
    return handleGoHighLevel({ email, firstName, lastName, phone, utmParams, res });
  }

  return res.status(500).json({ error: "Invalid mailer service" });
};
