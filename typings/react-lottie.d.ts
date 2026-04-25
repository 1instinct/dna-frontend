declare module "react-lottie" {
  import { CSSProperties, Component } from "react";

  export interface Options {
    loop?: boolean;
    autoplay?: boolean;
    animationData: any;
    rendererSettings?: {
      preserveAspectRatio?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface LottieProps {
    options: Options;
    height?: number | string;
    width?: number | string;
    isStopped?: boolean;
    isPaused?: boolean;
    speed?: number;
    segments?: number[];
    direction?: number;
    ariaRole?: string;
    ariaLabel?: string;
    isClickToPauseDisabled?: boolean;
    title?: string;
    style?: CSSProperties;
    eventListeners?: Array<{
      eventName: string;
      callback: () => void;
    }>;
  }

  export default class Lottie extends Component<LottieProps> {}
}
