import React from "react";
import moment from "moment";
import { useRouter } from "next/router";
import Rating from "@material-ui/lab/Rating";

import {
  StreamCardWrapper,
  InfluencerAvatar,
  InfluencerBox,
  InfluencerName,
  StreamCardTitle,
  StreamImg,
  StreamImgWrapper,
  StreamMask,
  StreamStatusWrapper,
  StreamStatus,
  StreamCardDesc,
  StreamChecked
} from "./StreamCard.styles";

export const StreamCard = ({ isPast, item }: any) => {
  const router = useRouter();
  return (
    <StreamCardWrapper
      key={`${item}-card`}
      // href={`/tv/${item.playback_ids[0]}`}
      onClick={() => router.push(`/tv/${item.playback_ids[0]}`)}
      // as={`/tv/${item.playback_ids[0]}`}
      // title={`Link to ${item.title} Live Stream`}
    >
      <>
        <StreamImgWrapper>
          {!isPast ? <StreamMask /> : null}
          {!isPast ? (
            <StreamChecked>
              {"Streaming " + moment(item.start_date).fromNow()}
            </StreamChecked>
          ) : null}
          {isPast ? (
            <StreamStatusWrapper>
              <StreamStatus>Stream Ended Watch Replay</StreamStatus>
            </StreamStatusWrapper>
          ) : null}
          <StreamImg src="/3.png" alt={""} />
          <InfluencerBox>
            <InfluencerAvatar src="/1.png" />
            <InfluencerName as={"span"}>Jane Doe</InfluencerName>
          </InfluencerBox>
        </StreamImgWrapper>
        <StreamCardTitle>{item.title}</StreamCardTitle>
        <StreamCardDesc>{item.description}</StreamCardDesc>
      </>
    </StreamCardWrapper>
  );
};
