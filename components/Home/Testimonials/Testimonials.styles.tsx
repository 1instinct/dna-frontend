import styled from "@emotion/styled";

export const Container = styled.div`
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    padding: 40px 20px;

    h2 {
      font-size: 1.5rem;
    }
  }
`;

export const SwiperWrapper = styled.div`
  margin-top: 40px;
  padding: 0 40px;

  .swiper-button-next,
  .swiper-button-prev {
    color: ${(p) => p.theme.colors.brand.primary};
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    padding: 0 20px;
  }
`;

export const TestimonialCard = styled.div`
  padding: 30px;
  border-radius: 8px;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.medium
      : p.theme.colors.white.primary};
  box-shadow: ${(p) =>
    p.theme.isDarkMode
      ? "0 2px 8px rgba(255, 255, 255, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  text-align: center;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
`;

export const TestimonialText = styled.p`
  font-size: 1rem;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
  line-height: 1.6;
  margin: 1rem 0;
  font-style: italic;
`;

export const CustomerName = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-top: 0.5rem;
`;
