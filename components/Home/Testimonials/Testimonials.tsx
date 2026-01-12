import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Autoplay } from "swiper/core";
import Rating from "@material-ui/lab/Rating";
import {
  Container,
  TestimonialCard,
  Avatar,
  TestimonialText,
  CustomerName,
  SwiperWrapper
} from "./Testimonials.styles";

SwiperCore.use([Navigation, Autoplay]);

interface Testimonial {
  name: string;
  rating: number;
  text: string;
  avatar?: string;
}

export interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string | null;
  content?: string;
  displayStyle?: "carousel" | "grid";
}

const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials,
  title,
  content,
  displayStyle = "carousel"
}) => {
  const defaultAvatar = "https://ui-avatars.com/api/?size=80&background=random";

  if (displayStyle === "carousel") {
    return (
      <Container>
        {title && <h2>{title}</h2>}
        {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

        <SwiperWrapper>
          <Swiper
            loop={true}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            navigation
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <TestimonialCard>
                  <Avatar
                    src={
                      testimonial.avatar ||
                      `${defaultAvatar}&name=${encodeURIComponent(
                        testimonial.name
                      )}`
                    }
                    alt={testimonial.name}
                  />
                  <Rating value={testimonial.rating} readOnly size="small" />
                  <TestimonialText>"{testimonial.text}"</TestimonialText>
                  <CustomerName>{testimonial.name}</CustomerName>
                </TestimonialCard>
              </SwiperSlide>
            ))}
          </Swiper>
        </SwiperWrapper>
      </Container>
    );
  }

  // Grid layout
  return (
    <Container>
      {title && <h2>{title}</h2>}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "40px"
        }}
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index}>
            <Avatar
              src={
                testimonial.avatar ||
                `${defaultAvatar}&name=${encodeURIComponent(testimonial.name)}`
              }
              alt={testimonial.name}
            />
            <Rating value={testimonial.rating} readOnly size="small" />
            <TestimonialText>"{testimonial.text}"</TestimonialText>
            <CustomerName>{testimonial.name}</CustomerName>
          </TestimonialCard>
        ))}
      </div>
    </Container>
  );
};

export default Testimonials;
