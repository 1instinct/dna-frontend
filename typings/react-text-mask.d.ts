declare module "react-text-mask" {
  import { ComponentType, Ref } from "react";

  interface MaskedInputProps {
    mask: (RegExp | string)[];
    guide?: boolean;
    placeholderChar?: string;
    keepCharPositions?: boolean;
    pipe?: (value: string, config: any) => string | false;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    render: (ref: Ref<HTMLInputElement>, props: any) => React.ReactNode;
    [key: string]: any;
  }

  const MaskedInput: ComponentType<MaskedInputProps>;
  export default MaskedInput;
}
