import React from "react";
import moment from "moment";
import { Swiper, SwiperSlide } from "swiper/react";
import { StreamCard } from "../StreamCard";
import SwiperCore, { Navigation, Thumbs } from "swiper/core";
import { useMediaQuery } from "react-responsive";
import { IStream } from "../../typings/stream";

export interface StreamListProps {
  data: IStream[];
  title: string;
}

SwiperCore.use([Navigation, Thumbs]);

export const StreamList: React.FC<StreamListProps> = (props) => {
  const { data, title } = props;
  const isMobile = useMediaQuery({ maxWidth: 767 });

  if (!data) {
    return null;
  }

  return (
    <div className="mt-8 overflow-hidden">
      <h2 className="mb-8 font-title text-4xl leading-tight text-foreground">
        {title}
      </h2>
      <Swiper
        loop={true}
        spaceBetween={0}
        slidesPerView={isMobile ? 2 : 7}
        watchSlidesVisibility={true}
        watchSlidesProgress={true}
      >
        {data &&
          data.map((item, index) => {
            const startDate = moment(item.start_date);
            const today = moment();
            const isPast = today.isAfter(startDate);
            return (
              <SwiperSlide key={index}>
                <StreamCard item={item} isPast={isPast} />
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};
