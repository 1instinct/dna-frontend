import styled from "@emotion/styled";

const CartContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const CartTitle = styled.h2`
  margin-bottom: 20px;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

const CartItemDescription = styled.p`
  font-size: 16px;
`;

const CartItemActions = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: blue;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: darkblue;
  }
`;
