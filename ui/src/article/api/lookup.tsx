import axios from "axios";
import { settings } from "../../api";

export type LookupData = {
  id: number;
  name: string;
};

export type Lookups = {
  articleTypes: LookupData[];
  platforms: LookupData[];
};

export async function getLookup(request: {
  lookupName: string;
}): Promise<LookupData[]> {
  const response = await axios.get<LookupData[]>(
    `${settings.url}/${request.lookupName}`
  );

  return response.data;
}
