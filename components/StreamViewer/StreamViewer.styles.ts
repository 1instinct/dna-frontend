import styled from "@emotion/styled";
import { VideoJS } from "../VideoJS";

export const StreamViewerWrapper = styled.div`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.9)"};
  backdrop-filter: blur(15px);
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: auto 1fr;
  gap: 20px;
  padding: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    gap: 12px;
    padding: 12px;
  }
`;

export const StreamHeaderFade = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 120px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.9)"};
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${(p) => p.theme.colors.white.primary};
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    background: ${(p) =>
      p.theme.isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 1)"};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
`;

export const StreamerInfo = styled.div`
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
  max-width: 400px;
  align-self: flex-start;
  justify-self: flex-start;
  margin: 20px;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

export const StreamerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

export const StreamerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${(p) => p.theme.colors.brand.primary};
  flex-shrink: 0;
`;

export const StreamerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const StreamerName = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${(p) => p.theme.colors.white.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StreamerLink = styled.a`
  font-size: 13px;
  color: ${(p) => p.theme.colors.brand.primary};
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${(p) => p.theme.colors.brand.light};
  }
`;

export const VideoContainer = styled.div`
  grid-column: 1;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;

export const StreamVideo = styled(VideoJS)`
  width: 100%;
  max-width: 100%;
  height: auto;
  cursor: pointer;
`;

export const ProductSidebar = styled.div`
  grid-column: 2;
  grid-row: 1 / -1;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: 3;
    max-height: 300px;
  }
`;

export const ProductListTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: ${(p) => p.theme.colors.white.primary};
`;

export const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

export const ErrorPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(20, 20, 20, 0.9)"};
  border-radius: 12px;
  padding: 40px;
  text-align: center;
`;

export const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  animation: shake 0.5s;

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translateX(-10px);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translateX(10px);
    }
  }
`;

export const ErrorMessage = styled.p`
  color: ${(p) => p.theme.colors.white.primary};
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
  margin-bottom: 24px;
`;

export const RetryButton = styled.button`
  padding: 12px 24px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: ${(p) => p.theme.colors.white.primary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.brand.dark};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;
