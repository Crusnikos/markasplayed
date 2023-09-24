import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { AxiosError } from "axios";
import {
  ArticleDataRequest,
  ArticleDataResponse,
  getArticlesListing,
} from "../api/article";

type ArticleDataContextType = [
  ArticleDataResponse,
  number,
  (value: ArticleDataRequest) => Promise<void>
];

export const ArticleDataContext = createContext<ArticleDataContextType>([
  [undefined, 1, 0],
  0,
  () => Promise.resolve(),
]);

export const useArticleData: () => ArticleDataContextType = () =>
  useContext(ArticleDataContext);

export default function ArticleListProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [articles, setArticles] = useState<ArticleDataResponse>([
    undefined,
    0,
    0,
  ]);
  const [syncDate, setSyncDate] = useState<number>(Date.now());

  const sync = useCallback(async (request: ArticleDataRequest) => {
    try {
      if (request.page) {
        const articles = await getArticlesListing({ page: request.page });
        setArticles([articles.data, articles.totalCount, articles.page]);
      }
    } catch (err) {
      const error = err as AxiosError;
      setArticles([error, 0, 1]);
    } finally {
      setSyncDate(Date.now());
    }
  }, []);

  return (
    <ArticleDataContext.Provider value={[articles, syncDate, sync]}>
      {children}
    </ArticleDataContext.Provider>
  );
}
