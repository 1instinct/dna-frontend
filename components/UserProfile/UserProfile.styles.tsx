import styled from "@emotion/styled";

export const ProfileWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const ProfileHeader = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
  align-items: flex-start;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: ${(p) => p.theme.colors.brand.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.white.primary};
`;

export const ProfileInfo = styled.div`
  flex: 1;
`;

export const Username = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.white.primary};
`;

export const Bio = styled.p`
  margin: 0 0 16px 0;
  font-size: 16px;
  line-height: 1.6;
  color: ${(p) => p.theme.colors.white.primary};
  opacity: 0.8;
`;

export const Stats = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 24px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    justify-content: center;
  }
`;

export const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.white.primary};
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: ${(p) => p.theme.colors.white.primary};
  opacity: 0.6;
`;

export const ContentSection = styled.div`
  margin-bottom: 48px;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.white.primary};
`;

export const StreamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

export const StreamCard = styled.div`
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const StreamThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${(p) => p.theme.colors.black.primary};
  position: relative;
  overflow: hidden;
`;

export const LiveBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: ${(p) => p.theme.colors.white.primary};
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const StreamInfo = styled.div`
  padding: 16px;
`;

export const StreamTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.white.primary};
`;

export const StreamMeta = styled.div`
  font-size: 14px;
  color: ${(p) => p.theme.colors.white.primary};
  opacity: 0.6;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 64px 20px;
  color: ${(p) => p.theme.colors.white.primary};
  opacity: 0.6;
`;
