import { useInfiniteQuery, useMutation } from "react-query";
import { dnaFetch, DnaAuthMode, isDnaApiError } from "@lib/api/dnaFetch";
import { QUESTIONS_PER_PAGE, REVIEWS_ENABLED } from "@lib/reviews";
import type {
  AskQuestionInput,
  AskQuestionResponse,
  ProductQuestionsResponse
} from "../../types/reviews";
import { QueryKeys } from "../queryKeys";

/**
 * Product Q&A (M6). Only answered questions are public, newest answer first.
 * Every endpoint answers 503 `not_enabled` while reviews or questions are
 * switched off; the PDP hides its Questions tab then.
 */

const questionsPath = (productId: string | number) =>
  `/products/${encodeURIComponent(String(productId))}/questions`;

export interface QuestionFetchOptions {
  auth?: DnaAuthMode;
  signal?: AbortSignal;
  perPage?: number;
}

export const fetchQuestions = (
  productId: string | number,
  page = 1,
  {
    auth = "none",
    signal,
    perPage = QUESTIONS_PER_PAGE
  }: QuestionFetchOptions = {}
): Promise<ProductQuestionsResponse> =>
  dnaFetch<ProductQuestionsResponse>(questionsPath(productId), {
    query: { page, per_page: perPage },
    auth,
    signal
  });

export const questionsKey = (
  productId: string | number,
  perPage: number = QUESTIONS_PER_PAGE
) => [QueryKeys.QUESTIONS, String(productId), perPage] as const;

export const getNextQuestionsPage = (last: ProductQuestionsResponse) =>
  last?.meta && last.meta.page < last.meta.total_pages
    ? last.meta.page + 1
    : undefined;

const retryQuestions = (failureCount: number, error: unknown) => {
  if (
    isDnaApiError(error) &&
    ((error.status >= 400 && error.status < 500) || error.status === 503)
  ) {
    return false;
  }
  return failureCount < 1;
};

/** `GET /products/:id/questions` as an infinite list ("Show more"). */
export const useQuestions = (
  productId: string | number | undefined,
  { enabled = true, perPage = QUESTIONS_PER_PAGE } = {}
) =>
  useInfiniteQuery<ProductQuestionsResponse, unknown>(
    questionsKey(productId || "", perPage),
    ({ pageParam = 1, signal }) =>
      fetchQuestions(productId as string, pageParam, { signal, perPage }),
    {
      enabled: REVIEWS_ENABLED && enabled && !!productId,
      getNextPageParam: getNextQuestionsPage,
      staleTime: 60_000,
      retry: retryQuestions,
      refetchOnWindowFocus: false
    }
  );

/**
 * `POST /products/:id/questions` (Bearer). The question stays pending until
 * staff answer it, so the public list doesn't change; nothing to invalidate.
 */
export const useAskQuestion = (productId: string | number | undefined) =>
  useMutation<AskQuestionResponse, unknown, AskQuestionInput>((input) =>
    dnaFetch<AskQuestionResponse>(questionsPath(productId as string), {
      method: "POST",
      body: {
        body: input.body.trim(),
        display_name: input.display_name?.trim() || undefined
      },
      auth: "required"
    })
  );
