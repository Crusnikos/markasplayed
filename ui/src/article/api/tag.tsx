import axios from "axios";
import { settings } from "../../api";

export type LookupTagData = {
  id: number;
  name: string;
  groupName: string;
};

export async function getTagLookup(): Promise<LookupTagData[]> {
  const response = await axios.get<LookupTagData[]>(`${settings.url}/tags`);

  return response.data;
}

export async function getArticleTags(request: {
  id: number;
}): Promise<LookupTagData[]> {
  const response = await axios.get<LookupTagData[]>(
    `${settings.url}/tags/article/${request.id}`
  );

  return response.data;
}

export async function createTag(
  addRequest: {
    ArticleId: number;
    TagId: number;
  },
  token: string
): Promise<void> {
  await axios.post(`${settings.url}/tags`, addRequest, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deactivateTag(
  deactivateRequest: {
    ArticleId: number;
    TagId: number;
  },
  token: string
): Promise<void> {
  await axios.put(`${settings.url}/tags`, deactivateRequest, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
