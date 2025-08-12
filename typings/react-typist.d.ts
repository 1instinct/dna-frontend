declare module "react-typist" {
  import { ComponentType, ReactNode } from "react";

  interface TypistProps {
    children?: ReactNode;
    className?: string;
    avgTypingDelay?: number;
    stdTypingDelay?: number;
    startDelay?: number;
    cursor?: {
      show?: boolean;
      blink?: boolean;
      element?: string;
      hideWhenDone?: boolean;
      hideWhenDoneDelay?: number;
    };
    onTypingDone?: () => void;
    onLineTyped?: (line: string, lineIdx: number) => void;
    onCharacterTyped?: (char: string, charIdx: number) => void;
    delayGenerator?: (
      mean: number,
      std: number,
      options: { current: string; last: string }
    ) => number;
  }

  interface TypistComponent extends ComponentType<TypistProps> {
    Backspace: ComponentType<{
      count?: number;
      delay?: number;
    }>;
    Delay: ComponentType<{
      ms: number;
    }>;
  }

  const Typist: TypistComponent;
  export default Typist;
}