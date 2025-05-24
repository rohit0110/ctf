import { useEffect, useState, useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, getGamePDA, type GameAccount } from "../anchor/setup";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import { useCurrentGameId } from "./GetActiveGameId";
import { BN } from "@coral-xyz/anchor";

export default function GameStateViewer() {
  const { connection } = useConnection();
  const { gameId, loading } = useCurrentGameId();
  const [gameData, setGameData] = useState<GameAccount | null>(null);

  const gamePDA = useMemo(() => {
    return gameId ? getGamePDA(ADMIN_PUBLIC_KEY, new BN(gameId)) : null;
  }, [gameId]);

  useEffect(() => {
    if (!gamePDA) return;

    const fetchGameData = async () => {
      try {
        const data = await program.account.game.fetch(gamePDA);
        console.log("Fetched game data:", data);
        setGameData(data);
      } catch (error) {
        console.error("Error fetching game account data:", error);
      }
    };

    fetchGameData();

    const subscriptionId = connection.onAccountChange(
      gamePDA,
      async (accountInfo) => {
        try {
          const decoded = program.coder.accounts.decode<GameAccount>(
            "game",
            accountInfo.data
          );
          setGameData(decoded);
        } catch (error) {
          console.error("Error decoding game data:", error);
        }
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, gamePDA]);

  return (
    <div className="text-lg">
      {loading ? (
        <p>Loading game state...</p>
      ) : gameData && gameId ? (
        <>
          <p>Game ID: {gameId}</p>
          <p>State: {Object.keys(gameData.state)[0]}</p>
          <p>Prize Pool: {gameData.prizePool.toString()} lamports</p>
          <p>Current Holder: {gameData.currentFlagHolder.toBase58()}</p>
        </>
      ) : (
        <p>No game data found.</p>
      )}
    </div>
  );
}
