import { getTokenDataByTicker } from "./get_token_data";
import { FetchPriceResponse } from "../types";

export async function fetchPrice(ticker: string): Promise<FetchPriceResponse> {
  try {
    const { tokenData, marketCap, volume24h } = await getTokenDataByTicker(ticker);

    if (!tokenData) {
      return {
        status: "error",
        message: `Token data not found for ${ticker}`,
      };
    }

    return {
      status: "success",
      tokenData,
      marketCap,
      volume24h,
      message: `${tokenData.name} (${tokenData.symbol}):\nMarket Cap: ${marketCap || 'N/A'}\n24h Volume: ${volume24h || 'N/A'}\nDaily Volume (Jupiter): $${tokenData.daily_volume.toLocaleString()}`
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
    };
  }
}
