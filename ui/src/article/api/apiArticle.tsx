import axios from "axios";
import { Paged, settings } from "../../api";
import { tryParseInt } from "../../parsing";
import firebase from "../../user/firebase";
import { LookupData } from "./apiLookup";

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
  const response = await axios.get<FullArticleData>(`${settings.url}/article`, {
    params: request,
  });

  return response.data;
}

export async function createOrUpdateArticle(
  data: ArticleCreationRequest,
  genre: GenreTypes
): Promise<number> {
  let request;
  const token = await firebase.auth().currentUser?.getIdToken();
  switch (genre) {
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

  const response = await axios.post<number>(
    `${settings.url}/article`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export type GenreTypes = "review" | "news" | "other" | undefined;

export type FullArticleData = {
  id: number;
  title: string;
  playedOn: LookupData;
  availableOn: [LookupData];
  producer: string;
  playTime: number;
  createdAt: string;
  shortDescription: string;
  longDescription: string;
  genre: LookupData;
  createdBy: LookupData;
};

export type DashboardArticleData = {
  id: number;
  title: string;
  playedOn: LookupData;
  availableOn: [LookupData];
  producer: string;
  createdAt: string;
  shortDescription: string;
  genre: LookupData;
};

export type ArticleCreationRequest = {
  id: number | null;
  title: string;
  playedOn: number | null;
  availableOn: number[];
  producer: string | null;
  playTime: number | null;
  shortDescription: string;
  longDescription: string;
  genre: number;
};

export type ArticleDataRequest = {
  page: number;
};

export type ArticleDataResponse = [
  DashboardArticleData[] | Error | undefined,
  number,
  number
];
