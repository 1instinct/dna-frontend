import styled from "@emotion/styled";

export const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
  /* background-color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.dark
      : p.theme.colors.white.light}; */
`;

export const CheckoutTitle = styled.h1`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: ${(p) => p.theme.typography.titleLG.fontSize};
  margin-bottom: 30px;
  text-align: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.md}px) {
    grid-template-columns: 1fr;
  }
`;

export const CheckoutForm = styled.div`
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.medium : "white"};
  padding: 30px;
  border-radius: 8px;
  box-shadow: ${(p) =>
    p.theme.isDarkMode
      ? "0 2px 8px rgba(0, 0, 0, 0.5)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
`;

export const Section = styled.section`
  margin-bottom: 30px;
`;

export const SectionTitle = styled.h2`
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  font-size: ${(p) => p.theme.typography.titleMD.fontSize};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
  border-radius: 4px;
  font-size: 16px;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  transition: border-color 0.2s;
  background-color: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.dark : "white"};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
  }

  &::placeholder {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.primary
        : p.theme.colors.gray.medium};
  }
`;

export const Select = styled.select`
  padding: 12px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
  border-radius: 4px;
  font-size: 16px;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  background-color: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.dark : "white"};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
  }
`;

export const OrderSummary = styled.div`
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.medium : "white"};
  padding: 30px;
  border-radius: 8px;
  box-shadow: ${(p) =>
    p.theme.isDarkMode
      ? "0 2px 8px rgba(0, 0, 0, 0.5)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  height: fit-content;
  position: sticky;
  top: 20px;
`;

export const OrderTitle = styled.h3`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  font-size: ${(p) => p.theme.typography.titleSM.fontSize};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
`;

export const OrderItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

export const OrderItemInfo = styled.div`
  flex: 1;
`;

export const OrderItemName = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const OrderItemDetails = styled.div`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.primary
      : p.theme.colors.gray.medium};
`;

export const OrderItemPrice = styled.div`
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const OrderTotals = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
`;

export const TotalLabel = styled.span`
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.primary
      : p.theme.colors.gray.medium};
`;

export const TotalValue = styled.span`
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const GrandTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
  font-size: 20px;
  font-weight: bold;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const PaymentSection = styled.div`
  margin-top: 20px;
`;

export const CardElement = styled.div`
  padding: 12px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.light};
  border-radius: 4px;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.dark : "white"};
`;

export const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: ${(p) => p.theme.colors.brand.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(p) => p.theme.colors.brand.secondary};
  }

  &:disabled {
    background-color: ${(p) => p.theme.colors.gray};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: ${(p) => p.theme.colors.red?.primary || "#f44336"};
  font-size: 14px;
  margin-top: 10px;
  padding: 10px;
  background: ${(p) => p.theme.colors.red?.light || "#ffebee"};
  border-radius: 4px;
`;

export const Checkbox = styled.input`
  margin-right: 8px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 15px;
  cursor: pointer;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
