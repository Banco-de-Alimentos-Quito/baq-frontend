import { HuevoZenPayload } from "../types/huevo-zen";

export class HuevoZenService {
  public static async submitHuevoZen(payload: HuevoZenPayload) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.baq.ec/api/baq";
    const endpoint = `${apiUrl}/donaciones/huevo-zen`;

    console.log("🌐 Enviando solicitud Huevo Zen a:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch {
        errorText = await response.text();
      }
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return response.json();
  }

  public static async submitImage(cedula: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cedula", cedula);

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.baq.ec/api/baq";
    const endpoint = `${apiUrl}/donaciones/huevo-zen`;

    console.log(`📤 Enviando imagen de comprobante a: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch {
        errorText = await response.text();
      }
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return response.json();
  }
}
