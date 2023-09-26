import react from "react";
import Link from "next/link";
import styled from "@emotion/styled";

import {
  ShowContainer,
  ShowPic,
  ShowDetails,
  ShowTitle,
  ShowDescription
} from "./ShowSnippet.styles";

export const showsnippet = ({ show, togglepopup }: any) => {
  const params = { slug: show.slug };
  const showlink = `/show/${params.slug}`;

  return (
    <ShowContainer href={showlink} onClick={togglepopup}>
      <ShowPic>
        <img src={show.thumb_smdefault} alt={show.title} />
      </ShowPic>
      {/*
      <showdetails>
        <showtitle>{show.title}</showtitle>
        <showdescription>{show.desc}</showdescription>
      </showdetails>
      */}
    </ShowContainer>
  );
};
