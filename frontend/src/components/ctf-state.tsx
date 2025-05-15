import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, getGamePDA, type GameAccount } from "../anchor/setup";
import { Buffer } from "buffer";

export default function GameStateViewer() {
  const { connection } = useConnection();
  const [gameData, setGameData] = useState<GameAccount | null>(null);

  const gamePDA = getGamePDA();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await program.account.game.fetch(gamePDA);
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
            accountInfo.data,
          );
          setGameData(decoded);
        } catch (error) {
          console.error("Error decoding game data:", error);
        }
      },
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, gamePDA]);

  return (
    <div className="text-lg">
      {gameData ? (
        <>
          <p>State: {gameData?.state ? Object.keys(gameData.state)[0] : "Unknown"}</p>

          <p>Prize Pool: {gameData.prizePool.toString()} lamports</p>
          <p>Current Holder: {gameData.currentFlagHolder.toBase58()}</p>
        </>
      ) : (
        <p>Loading game state...</p>
      )}
    </div>
  );
}
