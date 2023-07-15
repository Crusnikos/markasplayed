import axios from "axios";
import { settings } from "../data/api";

export async function getFrontImage(request: {
  id: number;
  size?: string;
}): Promise<ImageData> {
  const response = await axios.get<ImageData>(
    `${settings.url}/files/article/${request.id}/front`,
    {
      params: { Size: request.size },
    }
  );

  return response.data;
}

export async function getSliderImages(): Promise<SliderData[]> {
  const response = await axios.get<SliderData[]>(
    `${settings.url}/files/slider`
  );
  return response.data;
}

export async function getGallery(request: {
  id: number;
}): Promise<ImageData[]> {
  const response = await axios.get<ImageData[]>(
    `${settings.url}/files/article/${request.id}/gallery`
  );
  return response.data;
}

export async function updateFrontImage(
  request: {
    id: number;
    file: File;
  },
  token: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", request.file);
  await axios.post<MainImageCreationRequest>(
    `${settings.url}/files/article/${request.id}/front`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function updateGallery(
  articleId: number,
  galleryId: number,
  token: string
): Promise<void> {
  await axios.put(
    `${settings.url}/files/article/${articleId}/gallery`,
    { Id: galleryId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function addToGallery(
  articleId: number,
  file: File,
  token: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await axios.post(
    `${settings.url}/files/article/${articleId}/gallery`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export type SliderData = {
  articleTitle: string;
} & ImageData;

export type ImageData = {
  id: number;
  imageFileName: string;
  imagePathName: string;
};

export type MainImageCreationRequest = {
  id: number;
  file: File;
};
