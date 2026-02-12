import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Carousel } from "react-responsive-carousel";
import {
  QuizContainer,
  QuizWrapper,
  QuizInfo,
  QuizTitleWrapper,
  QuizTitle,
  QuizText,
  QuizImageWrapper,
  QuizImage,
  RowOfOptions,
  CentralControl,
  CategoryWrapper,
  CategoryName,
  BackButton,
  YesButton,
  NoButton,
  Logo,
  ApiErrorText
} from "./Quiz.styles";
import { useQuestion } from "../../hooks/useQuiz";
import {
  ArrowBack,
  Close,
  VolumeUp,
  VolumeOffRounded
} from "@material-ui/icons";
import { LegalLink } from "../LegalLinks/LegalLinks.styles";

interface QuizImage {
  id: number;
  lawsuit_id: number;
  url: string;
  description: string;
  created_at: string;
  updated_at: string;
  prompt_id: number;
}

type RulingResult = "win" | "loss" | undefined;

const nativeAds = [
  {
    id: 1,
    lawfirm: "Law Firm 1",
    url: "https://allrise-api-production.s3.amazonaws.com/ads/ad-1.jpg"
  },
  {
    id: 2,
    lawfirm: "Law Firm 2",
    url: "https://allrise-api-production.s3.amazonaws.com/ads/ad-2.jpg"
  },
  {
    id: 3,
    lawfirm: "Law Firm 3",
    url: "https://allrise-api-production.s3.amazonaws.com/ads/ad-3.jpg"
  }
];

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "\u{1F1FA}\u{1F1F8}",
  es: "\u{1F1EA}\u{1F1F8}",
  fr: "\u{1F1EB}\u{1F1F7}",
  de: "\u{1F1E9}\u{1F1EA}",
  pt: "\u{1F1E7}\u{1F1F7}",
  it: "\u{1F1EE}\u{1F1F9}",
  ja: "\u{1F1EF}\u{1F1F5}",
  zh: "\u{1F1E8}\u{1F1F3}",
  ko: "\u{1F1F0}\u{1F1F7}",
  ar: "\u{1F1F8}\u{1F1E6}",
  hi: "\u{1F1EE}\u{1F1F3}",
  ru: "\u{1F1F7}\u{1F1FA}"
};

// --- Language Toggle Styles ---

const LanguageToggleContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  backdrop-filter: blur(8px);
`;

interface LanguageToggleSliderProps {
  activeIndex: number;
}

const LanguageToggleSlider = styled.div<LanguageToggleSliderProps>`
  position: absolute;
  top: 4px;
  left: ${(props) => 4 + props.activeIndex * 36}px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #ffda17, #f7be56);
  border-radius: 18px;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
`;

const LanguageFlagButton = styled.button<{ isActive: boolean }>`
  position: relative;
  z-index: 1;
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, opacity 0.2s ease;
  padding: 0;
  opacity: 1;
  color: ${(props) => (props.isActive ? "black" : "#555")};
  filter: ${(props) => (props.isActive ? "none" : "grayscale(100%)")};

  &:hover {
    transform: scale(1.15);
    filter: none;
  }
`;

// --- Ruling Popup Styles ---

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const popupSlideUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.85) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const RulingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: ${overlayFadeIn} 0.25s ease-out;
  backdrop-filter: blur(4px);
`;

const RulingCard = styled.div<{ result: RulingResult }>`
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${popupSlideUp} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
`;

const RulingHeader = styled.div<{ result: RulingResult }>`
  background: ${(props) =>
    props.result === "win"
      ? "linear-gradient(135deg, #4CAF50, #66BB6A)"
      : "linear-gradient(135deg, #F44336, #EF5350)"};
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RulingResultText = styled.h3`
  color: white;
  font-family: "Hitchcock", sans-serif;
  font-size: 24px;
  letter-spacing: 2px;
  margin: 0;
`;

const RulingCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const RulingBody = styled.div`
  padding: 24px;
`;

const RulingSummaryText = styled.div`
  color: #333;
  font-family: "Special", sans-serif;
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 0.5px;
  margin: 0 0 20px 0;

  span {
    font-weight: bold;
    color: black;
  }
`;

const RulingAudioButton = styled.button<{ isPlaying: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: ${(props) =>
    props.isPlaying
      ? "linear-gradient(135deg, #333, #555)"
      : "linear-gradient(135deg, #ffda17, #f7be56)"};
  color: ${(props) => (props.isPlaying ? "white" : "black")};
  border: none;
  border-radius: 10px;
  font-family: "Hitchcock", sans-serif;
  font-size: 16px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Quiz = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log("QUIZ ID: ", id);
  const {
    data: caseData,
    isLoading,
    isError
  } = useQuestion((id as string) || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [rulingResult, setRulingResult] = useState<RulingResult>(undefined);
  const [showRuling, setShowRuling] = useState(false);
  const [isRulingPlaying, setIsRulingPlaying] = useState(false);
  const rulingAudioRef = useRef<HTMLAudioElement | null>(null);

  const defaultQuizImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * nativeAds.length);
    return nativeAds[randomIndex].url;
  }, [nativeAds]);

  const availableLanguages = useMemo(() => {
    if (!caseData?.narrations) return [];
    return Array.from(
      new Set(caseData.narrations.map((n: any) => n.language))
    ) as string[];
  }, [caseData?.narrations]);

  useEffect(() => {
    if (
      availableLanguages.length > 0 &&
      !availableLanguages.includes(selectedLanguage)
    ) {
      setSelectedLanguage(availableLanguages[0]);
    }
  }, [availableLanguages]);

  const playSummary = () => {
    const narration =
      caseData?.narrations?.find(
        (n: any) =>
          n.narration_type === "summary" && n.language === selectedLanguage
      ) || caseData?.narrations[0];
    if (!narration) return;

    const audio = new Audio(narration.url);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audio.play().then(() => {
        audio.addEventListener("ended", () => {
          setIsPlaying(false);
        });
      });
    }
  };

  const answer = (guess: string) => {
    if (!caseData || rulingResult !== undefined) return;

    const correct = caseData.verdict.toLowerCase() === guess.toLowerCase();
    setRulingResult(correct ? "win" : "loss");
    setShowRuling(true);
  };

  const playRuling = () => {
    if (isRulingPlaying && rulingAudioRef.current) {
      rulingAudioRef.current.pause();
      setIsRulingPlaying(false);
      return;
    }

    const narration =
      caseData?.narrations?.find(
        (n: any) =>
          n.narration_type === "ruling" && n.language === selectedLanguage
      ) ||
      caseData?.narrations?.find((n: any) => n.narration_type === "ruling");
    if (!narration) return;

    const audio = new Audio(narration.url);
    rulingAudioRef.current = audio;
    setIsRulingPlaying(true);
    audio.play().then(() => {
      audio.addEventListener("ended", () => {
        setIsRulingPlaying(false);
        rulingAudioRef.current = null;
      });
    });
  };

  const closeRuling = () => {
    if (rulingAudioRef.current) {
      rulingAudioRef.current.pause();
      rulingAudioRef.current = null;
    }
    setIsRulingPlaying(false);
    setShowRuling(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !caseData)
    return (
      <QuizContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px",
            gap: "10px"
          }}
        >
          <Logo src="/images/allrise/logo-shadow.png" alt="AllRise Logo" />
          <ApiErrorText style={{ fontFamily: "Special, sans-serif" }}>
            Case not available right now. Please try again later.
          </ApiErrorText>
          <LegalLink href={`/ios-case/${id}`}>
            Open case in the All Rise! App
          </LegalLink>
        </div>
      </QuizContainer>
    );

  return (
    <QuizContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 0",
          gap: "10px"
        }}
      >
        <Logo src="/images/allrise/logo-shadow.png" alt="AllRise Logo" />
        <LegalLink href={`/ios-case/${id}`}>
          Open case in the All Rise! App
        </LegalLink>
      </div>
      <QuizWrapper>
        {availableLanguages.length >= 1 && (
          <LanguageToggleContainer>
            <LanguageToggleSlider
              activeIndex={availableLanguages.indexOf(selectedLanguage)}
            />
            {availableLanguages.map((lang: string) => (
              <LanguageFlagButton
                key={lang}
                isActive={lang === selectedLanguage}
                onClick={() => setSelectedLanguage(lang)}
              >
                {LANGUAGE_FLAGS[lang] || lang.toUpperCase()}
              </LanguageFlagButton>
            ))}
          </LanguageToggleContainer>
        )}
        <QuizImageWrapper>
          {caseData?.sketches?.length ? (
            <Carousel
              autoPlay
              swipeable
              infiniteLoop
              interval={3000}
              showArrows={false}
              showStatus={false}
              showThumbs={false}
              showIndicators={false}
            >
              {caseData?.sketches.map((sketch: QuizImage) => (
                <div key={sketch.id}>
                  <img src={sketch.url} alt={caseData?.title} />
                </div>
              ))}
            </Carousel>
          ) : (
            <QuizImage src={defaultQuizImage} alt={caseData?.title} />
          )}
          <BackButton onClick={() => router.push("/")}>
            <ArrowBack style={{ color: "black" }} />
          </BackButton>
        </QuizImageWrapper>
        <QuizInfo>
          <QuizTitleWrapper onClick={playSummary}>
            <QuizTitle>{caseData?.title}</QuizTitle>
            <VolumeOffRounded style={{ color: "white" }} />
          </QuizTitleWrapper>
          <QuizText>{caseData?.caseSummary}</QuizText>
          <RowOfOptions>
            <YesButton
              onClick={() => answer("FOR")}
              disabled={rulingResult !== undefined}
              style={{ opacity: rulingResult !== undefined ? 0.5 : 1 }}
            >
              FOR
            </YesButton>
            <NoButton
              onClick={() => answer("AGAINST")}
              disabled={rulingResult !== undefined}
              style={{ opacity: rulingResult !== undefined ? 0.5 : 1 }}
            >
              AGAINST
            </NoButton>
          </RowOfOptions>
        </QuizInfo>
      </QuizWrapper>

      {showRuling && (
        <RulingOverlay onClick={closeRuling}>
          <RulingCard
            result={rulingResult}
            onClick={(e) => e.stopPropagation()}
          >
            <RulingHeader result={rulingResult}>
              <RulingResultText>
                {rulingResult === "win" ? "CORRECT!" : "INCORRECT"}
              </RulingResultText>
              <RulingCloseButton onClick={closeRuling}>
                <Close style={{ color: "white", fontSize: 20 }} />
              </RulingCloseButton>
            </RulingHeader>
            <RulingBody>
              <RulingSummaryText
                dangerouslySetInnerHTML={{
                  __html: caseData?.rulingSummary || ""
                }}
              />
              {caseData?.narrations?.some(
                (n: any) => n.narration_type === "ruling"
              ) && (
                <RulingAudioButton
                  isPlaying={isRulingPlaying}
                  onClick={playRuling}
                >
                  <VolumeUp style={{ fontSize: 22 }} />
                  {isRulingPlaying ? "PAUSE RULING" : "PLAY RULING"}
                </RulingAudioButton>
              )}
            </RulingBody>
          </RulingCard>
        </RulingOverlay>
      )}
    </QuizContainer>
  );
};
