import styled from "@emotion/styled";

export const CheckoutWrapper = styled.div<{ isExpanded: boolean }>`
  position: absolute;
  bottom: 60px;
  left: 20px;
  width: ${(p) => (p.isExpanded ? "380px" : "60px")};
  max-height: ${(p) => (p.isExpanded ? "85vh" : "60px")};
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.95)" : "rgba(255, 255, 255, 0.98)"};
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;

  ${(p) =>
    p.isExpanded &&
    `
    border-radius: 12px;
    border: 1px solid ${
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    };
  `}
`;

export const ToggleButton = styled.button<{ isExpanded?: boolean }>`
  width: 60px;
  height: 60px;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  border: none;
  border-radius: ${(p) => (p.isExpanded ? "12px 12px 0 0" : "50%")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: 24px;
  flex-shrink: 0;

  ${(p) =>
    !p.isExpanded &&
    `
    &:hover {
      background: ${
        p.theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
      };
    }
  `}
`;

export const CartBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${(p) => p.theme.colors.red.primary};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
`;

export const CheckoutContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 8px;
`;

export const StepDot = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${(p) =>
    p.isCompleted
      ? p.theme.colors.brand.primary
      : p.isActive
      ? p.theme.colors.brand.light
      : "rgba(255, 255, 255, 0.2)"};
  transition: all 0.3s;
`;

export const CheckoutTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const CartItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
`;

export const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ItemPrice = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.brand.primary};
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${(p) => p.theme.colors.red.primary};
  cursor: pointer;
  font-size: 18px;
  padding: 4px;

  &:hover {
    opacity: 0.7;
  }
`;

export const FormField = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
  margin-bottom: 6px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const ErrorText = styled.div`
  color: ${(p) => p.theme.colors.red.primary};
  font-size: 12px;
  margin-top: 4px;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 12px;
`;

export const TotalLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
`;

export const TotalValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const StepActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

export const StepButton = styled.button<{ variant?: "primary" | "secondary" }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) =>
    p.variant === "primary"
      ? p.theme.colors.brand.primary
      : "rgba(255, 255, 255, 0.1)"};
  color: ${(p) => p.theme.colors.white.primary};

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const CardElementWrapper = styled.div`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
`;

export const SuccessMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

export const SuccessIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const SuccessText = styled.div`
  font-size: 16px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-bottom: 8px;
`;

export const OrderNumber = styled.div`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
`;

export const ShippingMethodOption = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 2px solid
    ${(p) =>
      p.selected ? p.theme.colors.brand.primary : "rgba(255, 255, 255, 0.1)"};
  background: ${(p) =>
    p.selected ? "rgba(255, 255, 255, 0.05)" : "transparent"};
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.brand.light};
  }

  input[type="radio"] {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
  }
`;

export const ShippingMethodName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const ShippingMethodCost = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.brand.primary};
  margin-top: 4px;
`;

export const LoginPrompt = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

export const LoginIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const LoginText = styled.div`
  font-size: 16px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-bottom: 8px;
`;

export const LoginSubtext = styled.div`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
  margin-bottom: 24px;
`;

export const AddressOption = styled.label<{ selected: boolean }>`
  display: block;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid
    ${(p) =>
      p.selected ? p.theme.colors.brand.primary : "rgba(255, 255, 255, 0.1)"};
  background: ${(p) =>
    p.selected ? "rgba(255, 255, 255, 0.05)" : "transparent"};
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.brand.light};
  }
`;

export const AddressOptionContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const AddressRadio = styled.div<{ selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid
    ${(p) =>
      p.selected ? p.theme.colors.brand.primary : "rgba(255, 255, 255, 0.3)"};
  background: ${(p) =>
    p.selected ? p.theme.colors.brand.primary : "transparent"};
  flex-shrink: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    opacity: ${(p) => (p.selected ? 1 : 0)};
  }
`;

export const AddressDetails = styled.div`
  flex: 1;
`;

export const AddressName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-bottom: 4px;
`;

export const AddressLine = styled.div`
  font-size: 13px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
  line-height: 1.4;
`;

export const NewAddressButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: transparent;
  color: ${(p) => p.theme.colors.brand.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;

  &:hover {
    border-color: ${(p) => p.theme.colors.brand.primary};
    background: rgba(255, 255, 255, 0.05);
  }
`;
