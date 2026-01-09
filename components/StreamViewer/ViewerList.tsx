import React, { useState } from "react";
import styled from "@emotion/styled";
import Image from "next/image";

const ViewerWrapper = styled.div<{ isExpanded: boolean }>`
  position: relative;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"};
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${(p) =>
      p.theme.isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.85)"};
  }
`;

const ViewerCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.theme.colors.red.primary};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const AvatarStack = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  margin-left: -4px;
  max-width: ${(p) => (p.isExpanded ? "200px" : "120px")};
  transition: max-width 0.3s;
  overflow: hidden;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.black.primary
        : p.theme.colors.white.primary};
  overflow: hidden;
  margin-left: -8px;
  position: relative;
  background: ${(p) => p.theme.colors.gray.light};

  &:first-of-type {
    margin-left: 0;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ExpandedList = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.95)"};
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

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
  }
`;

const ViewerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: ${(p) =>
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"};
  }
`;

const ViewerName = styled.span`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

interface Viewer {
  id: string;
  name: string;
  avatar?: string;
}

interface ViewerListProps {
  viewers: Viewer[];
  isLive?: boolean;
}

export const ViewerList: React.FC<ViewerListProps> = ({
  viewers = [],
  isLive = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleAvatars = viewers.slice(0, 3);
  const remainingCount = Math.max(0, viewers.length - 3);

  return (
    <>
      <ViewerWrapper
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isLive && <LiveDot />}
        <ViewerCount>👁️ {viewers.length}</ViewerCount>
        <AvatarStack isExpanded={isExpanded}>
          {visibleAvatars.map((viewer) => (
            <Avatar key={viewer.id}>
              {viewer.avatar ? (
                <Image
                  src={viewer.avatar}
                  alt={viewer.name}
                  width={32}
                  height={32}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `hsl(${
                      viewer.id.charCodeAt(0) * 10
                    }, 70%, 60%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white"
                  }}
                >
                  {viewer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <Avatar>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "white"
                }}
              >
                +{remainingCount}
              </div>
            </Avatar>
          )}
        </AvatarStack>
      </ViewerWrapper>

      {isExpanded && (
        <ExpandedList>
          {viewers.map((viewer) => (
            <ViewerItem key={viewer.id}>
              <Avatar>
                {viewer.avatar ? (
                  <Image
                    src={viewer.avatar}
                    alt={viewer.name}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `hsl(${
                        viewer.id.charCodeAt(0) * 10
                      }, 70%, 60%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "white"
                    }}
                  >
                    {viewer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>
              <ViewerName>{viewer.name}</ViewerName>
            </ViewerItem>
          ))}
        </ExpandedList>
      )}
    </>
  );
};
