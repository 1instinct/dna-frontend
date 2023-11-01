import React from "react";
import { useQuery } from "react-query";
import { CloseOutlined } from "@material-ui/icons";
import { generateKey } from "../../utilities/keys";
import { fetchShows, useShows } from "../../hooks";

import { QueryKeys } from "../../hooks";
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
  darkMode,
  isBrowsing,
  setIsBrowsing
}) => {
  const {
    data: showsData,
    isLoading: showsLoading,
    isError: showsError
  } = useQuery([QueryKeys.SHOWS, 1], fetchShows);

  const ShowSnippetUrl = (slug: any) =>
    `https://dna-video-dev.s3.amazonaws.com/posters/${slug}.jpg`;

  const renderShows = () => {
    if (showsLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return showsData.map((show: IShow) => {
        const uniqKey = generateKey();
        return (
          <ShowSnippet key={uniqKey}>
            <ShowSnippetImg src={ShowSnippetUrl(show.slug)} />
          </ShowSnippet>
        );
      });
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
