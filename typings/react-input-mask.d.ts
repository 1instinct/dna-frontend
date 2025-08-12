declare module "react-input-mask" {
  import { ComponentType, ReactNode, Ref } from "react";

  interface InputMaskProps {
    mask: string;
    maskChar?: string | null;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    alwaysShowMask?: boolean;
    inputRef?: Ref<HTMLInputElement>;
    children?: (inputProps: any) => ReactNode;
    [key: string]: any;
  }

  const InputMask: ComponentType<InputMaskProps>;
  export default InputMask;
}
