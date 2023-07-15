import axios from "axios";
import { settings } from "../data/api";
import { ImageData } from "./files";

export async function getAuthorsListing(): Promise<AuthorData[]> {
  const response = await axios.get<AuthorData[]>(
    `${settings.url}/author/listing`
  );

  return response.data;
}

export async function getAuthorImage(request: {
  id: number;
}): Promise<ImageData | null> {
  const response = await axios.get<ImageData>(
    `${settings.url}/files/author/${request.id}/avatar`
  );

  return response.data;
}

export type AuthorData = {
  id: number;
  name: string;
  descriptionPl: string;
  descriptionEn: string;
};
