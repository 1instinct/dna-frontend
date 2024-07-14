import ky from "ky-universal";
import { useQuery } from "react-query";

const fetchPosts = async (limit = 10) => {
  const parsed: any[] = await ky(
    "https://jsonplaceholder.typicode.com/posts"
  ).json();
  const result = parsed.filter((x) => x.id <= limit);
  return result;
};

const usePosts = (limit: number) => {
  return useQuery(["posts", limit], () => fetchPosts(limit));
};

export { usePosts, fetchPosts };
