import React from "react";
import { StoreReviewTestimonials } from "./StoreReviewTestimonials";
import { TestimonialsProps, TestimonialsView } from "./TestimonialsView";

export type {
  Testimonial,
  TestimonialsProps,
  TestimonialsSource
} from "./TestimonialsView";

/**
 * Homepage testimonials. `source: "cms"` (default) shows the rows from the
 * CMS section settings; `source: "store_reviews"` reads recent store reviews
 * instead (see `StoreReviewTestimonials`).
 */
const Testimonials: React.FC<TestimonialsProps> = (props) =>
  props.source === "store_reviews" ? (
    <StoreReviewTestimonials
      title={props.title}
      content={props.content}
      displayStyle={props.displayStyle}
      limit={props.limit}
    />
  ) : (
    <TestimonialsView
      testimonials={props.testimonials || []}
      title={props.title}
      content={props.content}
      displayStyle={props.displayStyle}
    />
  );

export default Testimonials;
