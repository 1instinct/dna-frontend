import React, { useState, useEffect, useCallback } from "react";
import { NotifyForm } from "../NotifyForm";
import { ProductTeaser } from "../ProductTeaser";
import { SocialLinks } from "../SocialLinks";
import { AppCallout } from "../AppCallout";
import { LegalLinks } from "../LegalLinks";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { useMutation, useQueryClient } from "react-query";
import { fetchProducts, useProducts } from "../../hooks";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  CarouselProvider,
  Slider,
  Slide,
  ImageWithZoom
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { ButtonBack, ButtonNext } from "pure-react-carousel";

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || "";
const siteDesc = process.env.NEXT_PUBLIC_SITE_DESC || "";
const logoPath = process.env.NEXT_PUBLIC_LOGO_PATH;
const previewMode =
  process.env.NEXT_PUBLIC_IS_PREVIEW_MODE === "true" ? true : false;
const comingSoonText = process.env.NEXT_PUBLIC_COMING_SOON_TEXT || "";
const mailerUrl = process.env.NEXT_PUBLIC_MAILCHIMP_URL || "";
const mailerId = process.env.NEXT_PUBLIC_MAILCHIMP_ID || "";
const mailerUser = process.env.NEXT_PUBLIC_MAILCHIMP_U || "";
const spreeApiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL || "";

interface ProductImage {
  id: string;
  type: string;
  attributes: {
    styles: Array<{ url: string }>;
  };
}

interface Product {
  id: string;
  attributes?: { name?: string };
  relationships?: {
    images?: {
      data: Array<{ id: string }>;
    };
  };
}

interface ProductsData {
  data: Product[];
  included?: ProductImage[];
}

export const ComingSoon = () => {
  const mailChimpUrl = `${mailerUrl}?u=${mailerId}&id=${mailerUser}`;
  const [isSlideshow, setIsSlideshow] = useState(false);

  const queryClient = useQueryClient();
  const {
    error: productsError,
    status: productsStatus,
    data: productsData,
    isLoading: productsAreLoading,
    isSuccess: productsSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useProducts(1);

  const renderProductSlides = useCallback(() => {
    return productsData.data.flatMap((i: any) => {
      const productImg = i.relationships?.images?.data[0]?.id;
      const allImages = productsData
        ? productsData?.included?.filter((e: any) => e.type == "image")
        : [];
      const foundImg = allImages
        ? allImages.filter((e: any) => e["id"] == productImg)
        : undefined;
      const imgUrl =
        foundImg !== undefined ? foundImg[0]?.attributes?.styles[4]?.url : "";
      const imgSrc = productImg ? `${spreeApiUrl}${imgUrl}` : "";
      return allImages?.map((image: any, index: any) => {
        const imgSrc = image?.attributes?.styles[9]?.url || "";
        const imgUrl = `${spreeApiUrl}${imgSrc}`;
        return (
          <Slide
            key={`image-${index}`}
            index={index}
            className="h-screen"
            onClick={() => setIsSlideshow(false)}
          >
            <ImageWithZoom src={imgUrl} />
          </Slide>
        );
      });
    });
  }, [productsData]);

  const renderProductThumbnails = useCallback(
    (
      productsData: ProductsData | undefined,
      setIsSlideshow: (value: boolean) => void
    ) => {
      return productsData?.data.map((i: Product) => {
        const productImg = i.relationships?.images?.data[0]?.id;
        const allImages =
          productsData?.included?.filter((e) => e.type === "image") || [];
        const foundImg = allImages.filter((e) => e.id === productImg);
        const imgUrl =
          foundImg.length > 0 ? foundImg[0]?.attributes?.styles[3]?.url : "";
        const imgSrc = productImg ? `${spreeApiUrl}${imgUrl}` : "";
        return (
          <button
            type="button"
            key={`image-${i.id}`}
            onClick={() => setIsSlideshow(true)}
            aria-haspopup="dialog"
            className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img src={imgSrc} alt={i.attributes?.name || `Product ${i.id}`} />
          </button>
        );
      });
    },
    [spreeApiUrl]
  );

  useEffect(() => {
    if (productsSuccess) {
      queryClient.setQueryData(["products", 1], productsData);
    }
  }, [productsSuccess]);

  return (
    <>
      <div className="relative flex min-h-screen flex-col bg-background">
        {logoPath ? (
          <img
            src={logoPath}
            className="h-60 w-auto sm:h-auto sm:w-[90%]"
            alt="Logo"
          />
        ) : siteTitle ? (
          <div className="mx-0 my-10 font-title text-4xl font-bold text-foreground">
            {siteTitle}
          </div>
        ) : null}
        {siteDesc && (
          <div className="w-[425px] text-center font-title text-base text-foreground">
            {siteDesc}
          </div>
        )}
        {previewMode && (
          <div className="my-8 grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {
              renderProductThumbnails(
                productsData,
                setIsSlideshow
              ) as React.ReactNode
            }
          </div>
        )}
        {comingSoonText !== "" && (
          <div className="w-[425px] text-center font-title text-base text-foreground">
            {comingSoonText}
          </div>
        )}
        <NotifyForm />
        <AppCallout variant="section" />
        <SocialLinks />
        {/* A Radix dialog: focus moves into the slideshow, Escape and outside clicks close it,
            and focus returns to the thumbnail that opened it. */}
        <DialogPrimitive.Root open={isSlideshow} onOpenChange={setIsSlideshow}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 h-full w-full bg-black/95" />
            <DialogPrimitive.Content
              aria-describedby={undefined}
              className="fixed inset-0 h-full w-full focus:outline-none"
            >
              <DialogPrimitive.Title className="sr-only">
                Product slideshow
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close slideshow"
                className="fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </DialogPrimitive.Close>
              <CarouselProvider
                naturalSlideWidth={600}
                naturalSlideHeight={600}
                totalSlides={productsData.data ? productsData.data.length : 1}
                touchEnabled
                infinite={productsData.data ? true : false}
              >
                <Slider className="slider h-screen bg-black/95">
                  {renderProductSlides()}
                </Slider>

                <div className="fixed left-0 top-1/2 flex w-full justify-between">
                  <ButtonBack
                    aria-label="Previous product"
                    className="ml-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-full opacity-[0.11] transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </ButtonBack>
                  <ButtonNext
                    aria-label="Next product"
                    className="mr-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-full opacity-[0.11] transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </ButtonNext>
                </div>
              </CarouselProvider>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
        <LegalLinks />
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["products", 1], () => fetchProducts(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}
