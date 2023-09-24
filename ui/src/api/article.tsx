import axios from "axios";
import { Paged, settings } from "../data/api";
import { tryParseInt } from "../utils/parsing";
import { LookupData } from "./lookup";

export async function getArticlesListing(
  request: ArticleDataRequest
): Promise<Paged<DashboardArticleData[]>> {
  const response = await axios.get<DashboardArticleData[]>(
    `${settings.url}/article/listing`,
    {
      params: request,
    }
  );

  const totalCountHeader = (
    response.headers as Record<string, string | undefined>
  )["articles-count"];
  const pageHeader = (response.headers as Record<string, string | undefined>)[
    "display-page"
  ];

  const parsedTotalCount = tryParseInt(totalCountHeader);
  const parsedPage = tryParseInt(pageHeader);

  return {
    data: response.data,
    totalCount: parsedTotalCount ?? 0,
    page: parsedPage ?? 0,
  };
}

export async function getArticle(request: {
  id: number;
}): Promise<FullArticleData> {
  const response = await axios.get<FullArticleData>(
    `${settings.url}/article/${request.id}`
  );

  return response.data;
}

function createRequestFromFormData(
  data: ArticleFormData,
  articleType: ArticleTypes
) {
  let request;
  switch (articleType) {
    case "news":
      request = {
        ...data,
        playedOn: null,
        producer: null,
        playTime: null,
      };
      break;
    case "other":
      request = {
        ...data,
        playedOn: null,
        availableOn: null,
        producer: null,
        playTime: null,
      };
      break;
    default:
      request = data;
      break;
  }
  return request;
}

export async function createArticle(
  data: ArticleFormData,
  articleType: ArticleTypes,
  transactionId: string,
  token: string
): Promise<number> {
  const { id, ...newRequest } = createRequestFromFormData(data, articleType);

  const response = await axios.post<number>(
    `${settings.url}/article`,
    newRequest,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        transactionId: transactionId,
      },
    }
  );

  return response.data;
}

export async function updateArticle(
  data: ArticleFormData,
  articleType: ArticleTypes,
  transactionId: string,
  token: string
): Promise<number> {
  const { id, ...newRequest } = createRequestFromFormData(data, articleType);
  const response = await axios.put<number>(
    `${settings.url}/article/${id}`,
    newRequest,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        transactionId: transactionId,
      },
    }
  );

  return response.data;
}

export type ArticleTypes = "review" | "news" | "other" | undefined;

export type FullArticleData = {
  playTime: number;
  longDescription: string;
  createdBy: LookupData;
} & DashboardArticleData;

export type DashboardArticleData = {
  id: number;
  title: string;
  playedOn: LookupData;
  availableOn: [LookupData];
  producer: string;
  createdAt: string;
  shortDescription: string;
  articleType: LookupData;
};

export type ArticleFormData = {
  id: number | null;
  title: string;
  playedOn: number | null;
  availableOn: number[];
  producer: string | null;
  playTime: number | null;
  shortDescription: string;
  longDescription: string;
  articleType: number;
};

export type ArticleDataRequest = {
  page?: number;
};

export type ArticleDataResponse = [
  DashboardArticleData[] | Error | undefined,
  number,
  number
];
