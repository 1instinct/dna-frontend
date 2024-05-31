import styled from "@emotion/styled";

export const FeaturedSnippetWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    /* position: absolute; */
    z-index: 10;
    overflow: hidden;
    @media (max-width: 768px) {
        padding: 20px 15px;
    }
    @media (max-width: 375px) {
        padding: 20px 15px;
    }
`;

export const FeaturedSnippetBadge = styled.div`
    background: ${(p: any) => p.theme.colors.brand.primary};
    color: ${(p: any) => p.theme.colors.white.primary};
    padding: 6px 12px 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
`;

export const FeaturedSnippetTitle = styled.h2`
    margin: 0;
    font-family: "Rubik Bubbles", sans-serif;
    font-size: 42px;
    line-height: 44px;
`;
export const FeaturedSnippetSubtitle = styled.h4`
    margin: 0;
    font-family: "Rubik Bubbles", sans-serif;
    font-size: 24px;
    line-height: 26px;
`;
export const FeaturedSnippetImageLink = styled.a`
    transform: rotate(-2deg);
    box-shadow: 5px 10px 22px rgba(0, 0, 0, 1);
    padding: 0;
    width: 300px;
    height: 300px;
    margin: 20px 0;
`;
export const FeaturedSnippetImage = styled.img`
    width: 100%;
    height: 100%;
`;
export const FeaturedSnippetText = styled.p`
    margin: 0px auto;
    font-family: "Gaegu", cursive;
`;
export const FeaturedSnippetButton = styled.button``;
export const FeaturedSnippetLink = styled.div``;