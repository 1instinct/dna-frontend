import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Autoplay } from "swiper/core";
import { Rating } from "@components/ui";

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

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const defaultAvatar = "https://ui-avatars.com/api/?size=80&background=random";
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-card p-8 text-center shadow-sm">
      <img
        src={
          testimonial.avatar ||
          `${defaultAvatar}&name=${encodeURIComponent(testimonial.name)}`
        }
        alt={testimonial.name}
        className="mb-4 h-20 w-20 rounded-full object-cover"
      />
      <Rating value={testimonial.rating} readOnly size="sm" />
      <p className="my-4 text-base italic leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">
        {testimonial.name}
      </p>
    </div>
  );
};

const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials,
  title,
  content,
  displayStyle = "carousel"
}) => {
  if (displayStyle === "carousel") {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-16 text-center sm:py-10">
        {title && (
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-2xl">
            {title}
          </h2>
        )}
        {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

        <div className="mt-10 px-10 sm:px-5 [&_.swiper-button-next]:text-brand [&_.swiper-button-prev]:text-brand">
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
                <TestimonialCard testimonial={testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 text-center sm:py-10">
      {title && (
        <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-2xl">
          {title}
        </h2>
      )}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
