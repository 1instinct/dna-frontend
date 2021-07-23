import React from "react";
import styled from "@emotion/styled";
import Link from "next/link";

const ProductRecommendation = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media screen and (max-width: 800px) {
    justify-content: space-between;
  }
`;

const Card = styled.div`
  transition: 0.3s;
  max-width: 250px;
  max-height: 600px;
  display: block;
  margin-right: 20px;
  cursor: pointer;
  @media screen and (max-width: 800px) {
    max-width: 48%;
    max-height: auto;
    margin: 0px;
  }
`;

const CardImg = styled.img`
  @media screen and (max-width: 800px) {
    width: 100%;
    height: auto;
  }
`;

const CardTitle = styled.h4`
  margin: 3px;
`;

const CardDetails = styled.p`
  margin: 3px;
  font-size: 15px;
`;

const StarChecked = styled.span`
  color: orange;
`;

export const ProductCard = () => {
  return (
    <ProductRecommendation>
      <Link href="/">
        <Card>
          <CardImg src="https://via.placeholder.com/250x400" />
          <div className="card-container">
            <CardTitle>"stuff"</CardTitle>
            <CardDetails>{"Online Exclusive".toUpperCase()}</CardDetails>
            <div>
              <StarChecked className="fa fa-star"></StarChecked>
              <StarChecked className="fa fa-star"></StarChecked>
              <StarChecked className="fa fa-star"></StarChecked>
              <span className="fa fa-star"></span>
              <span className="fa fa-star"></span>
            </div>
            <h4>$34.55</h4>
          </div>
        </Card>
      </Link>
    </ProductRecommendation>
  );
};
