import axios from "axios";
import { settings } from "../../api";

export type LookupData = {
  id: number;
  name: string;
};

export type Lookups = {
  genres: LookupData[];
  platforms: LookupData[];
};

export async function getLookup(request: {
  lookupName: string;
}): Promise<LookupData[]> {
  const response = await axios.get<LookupData[]>(
    `${settings.url}/article/lookup`,
    {
      params: request,
    }
  );

  return response.data;
}
