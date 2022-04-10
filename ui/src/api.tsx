if (!process.env.REACT_APP_API_URL) {
  throw new Error("REACT_APP_API_URL environmental variable is missing");
}

export const settings = {
  url: process.env.REACT_APP_API_URL,
};

export type Paged<Data> = {
  data: Data;
  totalCount: number;
  page: number;
};
