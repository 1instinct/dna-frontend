import React, { useCallback } from "react";
import SwiperCore, { Navigation, Thumbs } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  MemberName,
  MyAvatar,
  MySwiperContainer,
  MySlideWrap
} from "./MemberList.styles";
import { useMediaQuery } from "react-responsive";
export type member = { name: string; avatar: string };
export interface MemberListProps {
  data: member[];
}
SwiperCore.use([Navigation]);
const MemberList: React.FC<MemberListProps> = (props) => {
  const { data } = props;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const onSwipe = useCallback((swipe: any) => {
    console.log(swipe);
  }, []);
  return (
    <MySwiperContainer>
      <Swiper
        onSwiper={onSwipe}
        loop={true}
        spaceBetween={1}
        slidesPerView={isMobile ? 3 : 7}
      >
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            <MySlideWrap>
              <MyAvatar src={item.avatar} />
              <MemberName>{item.name}</MemberName>
            </MySlideWrap>
          </SwiperSlide>
        ))}
      </Swiper>
    </MySwiperContainer>
  );
};
export default MemberList;
