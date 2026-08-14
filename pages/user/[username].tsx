import { GetServerSideProps } from "next";

// Redirect /user/:username to /:username (vanity URLs)
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const username = params?.username as string;
  return {
    redirect: {
      destination: `/${username}`,
      permanent: true
    }
  };
};

export default function UserRedirect() {
  return null;
}
