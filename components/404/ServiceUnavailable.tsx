import Head from "next/head";

/** Shown when the API failed, so we can't tell whether the page exists. */
export const ServiceUnavailable = () => (
  <>
    <Head>
      <title>Temporarily unavailable</title>
      <meta name="robots" content="noindex" />
    </Head>
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="mb-4 font-title text-3xl font-black tracking-tight text-brand">
        Temporarily unavailable
      </h1>
      <p className="font-body text-lg text-muted-foreground">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
    </div>
  </>
);
