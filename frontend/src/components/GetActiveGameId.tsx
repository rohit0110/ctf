import { useEffect, useState } from "react";
import { program } from "../anchor/setup";
import { getGameRegistryPDA } from "../anchor/setup";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import { useError } from "./ErrorContext";

export function useCurrentGameId() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    const fetchGameId = async () => {
      try {
        const registryPDA = getGameRegistryPDA(ADMIN_PUBLIC_KEY);
        const gameRegistryAccount = await program.account.gameRegistry.fetch(registryPDA);
        setGameId(gameRegistryAccount.currentGameId.toString());
      } catch (err) {
        console.error("Failed to fetch GameRegistry:", err);
        showError(err instanceof Error ? err.message : "Unexpected error occurred");
        setGameId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGameId();
  }, []);

  return { gameId, loading };
}
