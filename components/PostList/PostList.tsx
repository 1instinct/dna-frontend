import React, { useState } from "react";
import { usePosts } from "../../hooks/usePosts";
import styled from "@emotion/styled";
import { PostListProps } from "./types";

const Section = styled.section`
  padding-bottom: 20px;
`;
const Li = styled.li`
  display: block;
  margin-bottom: 10px;
`;
const MyDiv = styled.div`
  align-items: center;
  display: flex;
`;
const MyLink = styled.a`
  font-size: 14px;
  margin-right: 10px;
  text-decoration: none;
  padding-bottom: 0;
  border: 0;
`;
const MySpan = styled.span`
  font-size: 14px;
  margin-right: 5px;
`;
const MyUl = styled.ul`
  margin: 0;
  padding: 0;
`;
const MyButton = styled.button`
  &:before {
    align-self: center;
    border-style: solid;
    border-width: 6px 4px 0 4px;
    border-color: #ffffff transparent transparent transparent;
    content: "";
    height: 0;
    margin-right: 5px;
    width: 0;
  }
`;
export const PostList: React.FC<PostListProps> = () => {
  const [postCount, setPostCount] = useState(10);
  const { data, isLoading, isFetching } = usePosts(postCount);

  if (isLoading) return <div>Loading</div>;

  return (
    <Section>
      <MyUl>
        {data?.map((post, index) => (
          <Li key={post.id}>
            <MyDiv>
              <MySpan>{index + 1}. </MySpan>
              <MyLink href="#">{post.title}</MyLink>
            </MyDiv>
          </Li>
        ))}
      </MyUl>
      {postCount <= 90 && (
        <MyButton
          onClick={() => setPostCount(postCount + 10)}
          disabled={isFetching}
        >
          {isFetching ? "Loading..." : "Show More"}
        </MyButton>
      )}
    </Section>
  );
};
