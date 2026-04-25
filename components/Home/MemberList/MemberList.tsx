import React, { useCallback } from "react";
import SwiperCore, { Navigation } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { Avatar, AvatarImage, AvatarFallback } from "@components/ui";
import { useMediaQuery } from "react-responsive";

export type member = { name: string; avatar: string };
export interface MemberListProps {
  data: member[];
}

SwiperCore.use([Navigation]);

const MemberList: React.FC<MemberListProps> = ({ data }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="my-8 h-36">
      <Swiper loop={true} spaceBetween={1} slidesPerView={isMobile ? 3 : 7}>
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback className="bg-brand/20 text-brand font-title">
                  {item.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="mt-2 whitespace-nowrap text-center font-title text-sm text-foreground">
                {item.name}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
export default MemberList;
