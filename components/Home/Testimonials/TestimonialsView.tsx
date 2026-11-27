import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Autoplay } from "swiper/core";
import { Rating } from "@components/ui";

SwiperCore.use([Navigation, Autoplay]);

export interface Testimonial {
  name: string;
  rating: number;
  text: string;
  /**
   * Image URL. `undefined` (CMS rows) falls back to a generated avatar;
   * `null` draws local initials instead (store reviews: no third-party
   * request carrying a customer's name).
   */
  avatar?: string | null;
}

/** Where the rows come from: the CMS section settings (default) or store reviews. */
export type TestimonialsSource = "cms" | "store_reviews";

export interface TestimonialsProps {
  /** CMS rows; ignored when `source` is `"store_reviews"`. */
  testimonials?: Testimonial[];
  title?: string | null;
  content?: string;
  displayStyle?: "carousel" | "grid";
  source?: TestimonialsSource;
  /** How many store reviews to show (store_reviews only). Default 9. */
  limit?: number;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const defaultAvatar = "https://ui-avatars.com/api/?size=80&background=random";
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-card p-8 text-center shadow-sm">
      {testimonial.avatar === null ? (
        <span
          aria-hidden="true"
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-secondary font-title text-xl uppercase tracking-widest text-foreground"
        >
          {initials(testimonial.name)}
        </span>
      ) : (
        <img
          src={
            testimonial.avatar ||
            `${defaultAvatar}&name=${encodeURIComponent(testimonial.name)}`
          }
          alt={testimonial.name}
          className="mb-4 h-20 w-20 rounded-full object-cover"
        />
      )}
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

interface TestimonialsViewProps {
  testimonials: Testimonial[];
  title?: string | null;
  content?: string;
  displayStyle?: "carousel" | "grid";
  /** Shown under the cards (e.g. the link to all store reviews). */
  footer?: React.ReactNode;
}

export const TestimonialsView: React.FC<TestimonialsViewProps> = ({
  testimonials,
  title,
  content,
  displayStyle = "carousel",
  footer
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
        {footer}
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
      {footer}
    </div>
  );
};

export default TestimonialsView;
