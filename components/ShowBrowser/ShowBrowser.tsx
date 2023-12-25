import React from "react";
import { CloseOutlined } from "@material-ui/icons";
import { generateKey } from "../../utilities/keys";
import { useShows } from "../../hooks";

import { Loading, LoadingWrapper } from "../";

import { IShow } from "../../typings";

import {
  ShowBrowserWrapper,
  ShowBrowserTitle,
  ShowSnippet,
  ShowSnippetImg,
  MainContent,
  CloseButton
} from "./ShowBrowser.styles";
import { currentSeason } from "../../utilities/dates";

export const ShowBrowser: React.FC<any> = ({
  isBrowsing,
  setIsBrowsing
}) => {
  const {
    data: showsData,
    isLoading: showsLoading,
    isError: showsError
  } = useShows();

  const ShowSnippetUrl = (slug: any) =>
    `https://dna-video-dev.s3.amazonaws.com/posters/${slug}.jpg`;

  const renderShows = () => {
    if (showsLoading || showsError) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else if (Array.isArray(showsData)) {
      return showsData.map((show: IShow) => {
        const uniqKey = generateKey();
        return (
          <ShowSnippet key={uniqKey}>
            <ShowSnippetImg src={ShowSnippetUrl(show.slug)} />
          </ShowSnippet>
        );
      });
    } else {
      // Handle the case where showsData is not an array
      return <div>No shows available.</div>;
    }
  };    

  return (
    <ShowBrowserWrapper>
      <ShowBrowserTitle>Shows On This {currentSeason()}</ShowBrowserTitle>
      <CloseButton onClick={() => setIsBrowsing(!isBrowsing)}>
        <CloseOutlined />
      </CloseButton>
      <MainContent>{renderShows()}</MainContent>
    </ShowBrowserWrapper>
  );
};
