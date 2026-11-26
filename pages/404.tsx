import Head from "next/head";
import { FourOhFour } from "@components/404/FourOhFour";

// FourOhFour renders its own Layout.
export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page not found</title>
      </Head>
      <FourOhFour />
    </>
  );
}
