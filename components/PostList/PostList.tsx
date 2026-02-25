import React, { useState } from "react";
import { usePosts } from "../../hooks/usePosts";
import { PostListProps } from "./types";

export const PostList: React.FC<PostListProps> = () => {
  const [postCount, setPostCount] = useState(10);
  const { data, isLoading, isFetching } = usePosts(postCount);

  if (isLoading) return <div>Loading</div>;

  return (
    <section className="pb-5">
      <ul className="m-0 p-0">
        {data?.map((post, index) => (
          <li key={post.id} className="mb-2.5 block">
            <div className="flex items-center">
              <span className="mr-1.5 text-sm">{index + 1}. </span>
              <a
                href="#"
                className="mr-2.5 border-0 pb-0 text-sm no-underline"
              >
                {post.title}
              </a>
            </div>
          </li>
        ))}
      </ul>
      {postCount <= 90 && (
        <button
          onClick={() => setPostCount(postCount + 10)}
          disabled={isFetching}
          className="before:mr-1.5 before:inline-block before:h-0 before:w-0 before:self-center before:border-x-[4px] before:border-t-[6px] before:border-x-transparent before:border-t-white before:content-['']"
        >
          {isFetching ? "Loading..." : "Show More"}
        </button>
      )}
    </section>
  );
};
