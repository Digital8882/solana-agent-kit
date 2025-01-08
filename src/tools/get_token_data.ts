import { PublicKey } from "@solana/web3.js";
import { JupiterTokenData } from "../types";

export async function getTokenDataByAddress(
  mint: PublicKey,
): Promise<JupiterTokenData | undefined> {
  try {
    if (!mint) {
      throw new Error("Mint address is required");
    }

    const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as JupiterTokenData[];
    const token = data.find((token: JupiterTokenData) => {
      return token.address === mint.toBase58();
    });
    return token;
  } catch (error: any) {
    throw new Error(`Error fetching token data: ${error.message}`);
  }
}

export async function getTokenAddressFromTicker(
  ticker: string,
): Promise<{ address: string | null; marketCap: string | null; volume24h: string | null }> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${ticker}`,
    );
    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return { address: null, marketCap: null, volume24h: null };
    }

    // Filter for Solana pairs only and sort by FDV
    let solanaPairs = data.pairs
      .filter((pair: any) => pair.chainId === "solana")
      .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0));

    solanaPairs = solanaPairs.filter(
      (pair: any) =>
        pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase(),
    );

    if (solanaPairs.length === 0) {
      return { address: null, marketCap: null, volume24h: null };
    }

    const topPair = solanaPairs[0];
    return {
      address: topPair.baseToken.address,
      marketCap: topPair.fdv ? `$${topPair.fdv.toLocaleString()}` : null,
      volume24h: topPair.volume ? `$${topPair.volume.h24.toLocaleString()}` : null
    };
  } catch (error) {
    console.error("Error fetching token data from DexScreener:", error);
    return { address: null, marketCap: null, volume24h: null };
  }
}

export async function getTokenDataByTicker(
  ticker: string,
): Promise<{ tokenData: JupiterTokenData | undefined; marketCap: string | null; volume24h: string | null }> {
  const { address, marketCap, volume24h } = await getTokenAddressFromTicker(ticker);
  if (!address) {
    throw new Error(`Token address not found for ticker: ${ticker}`);
  }
  const tokenData = await getTokenDataByAddress(new PublicKey(address));
  return { tokenData, marketCap, volume24h };
}
