import Head from "next/head";
// import { site, siteTitle } from "../../config";

function strip(html: any) {
  var one = html.replace(/<\/?[^>]+(>|$)/gm, "");
  var two = one.replace(/[\r\n]\s*[\r\n]/gm, "");
  return two;
}

{
  /* <script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Organization",
  "url": "http://smokey.fm",
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+1-718-314-0730",
    "contactType": "General Inquiry"
  }]
}
</script> */
}

const Schema = ({ post }: any) => {
  const {
    title,
    blurb,
    featuredImage,
    date,
    modified,
    slug,
    commentCount,
    author,
    ratingCount,
    ratingAverage,
    citations
  } = post;
  const published = new Date(date);
  const copyrightYear = published.getFullYear();

  let mediaDetails, sourceUrl;

  if (featuredImage) {
    sourceUrl = featuredImage.sourceUrl;
  }

  const citationsList = citations.map(({citation, i}: any) => {
    return `{ "@type": "CreativeWork", "citation": ${JSON.stringify(citation)} }${
      i === citations.length - 1 ? "" : ","
    }\n`;
  });
  const citationsText = citationsList.join("");

  const org = `{ "@id": "${process.env.SITE_URL}#organization", "type": "Organization", "name":"${process.env.SITE_TITLE}", "logo": {
    "@type": "ImageObject",
    "name": "${process.env.SITE_TITLE} Logo",
    "width": "230",
    "height": "67",
    "url": "${process.env.SITE_URL}images/logo.png"
} }`;

  return (
    <Head>
      <script type="application/ld+json">{`
    {
      "@context":"https://schema.org/",
      "@type":"Article",
      "name":"${title}",
      ${
        ratingAverage > 4
          ? `"aggregateRating": {
        "@type":"AggregateRating",
        "ratingValue":${ratingAverage},
        "reviewCount":${ratingCount}
      },`
          : ""
      }
      "about": "${blurb}",
      "author": { "@type": "Person", "@id": "${process.env.SITE_URL}author/${author.slug}", "name": "${
        author.name
      }" },
      ${
        citationsText.length
          ? `"citation": [
        ${citationsText}
      ],`
          : ""
      }
      "commentCount": ${commentCount},
      "copyrightHolder": { "@id": "${process.env.SITE_URL}#organization" },
      "copyrightYear": ${copyrightYear},
      "datePublished": "${date}",
      "dateModified": "${modified}",
      "description": "${blurb}",
      "discussionUrl": "${process.env.SITE_URL}articles/${slug}#comments",
      "editor": { "@id": "${process.env.SITE_URL}author/${author.slug}#author" },
      "headline": "${title}",
      ${sourceUrl ? `"image": "${sourceUrl}",` : ""}
      "inLanguage": "English",
      "mainEntityOfPage": "${process.env.SITE_URL}articles/${slug}",
      "publisher": { "@id": "${process.env.SITE_URL}#organization" },
      "sourceOrganization": ${org},
      "url": "${process.env.SITE_URL}articles/${slug}"

    }
    `}</script>{" "}
    </Head>
  );
};

export default Schema;
