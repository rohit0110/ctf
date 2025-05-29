import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { program, getGamePDA, getVaultPDA } from "../anchor/setup";
import { useCurrentGameId } from "./GetActiveGameId";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import { useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useError } from "./ErrorContext";

export default function EndGameButton() {
  const { gameId } = useCurrentGameId();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [currentFlagHolder, setCurrentFlagHolder] = useState<PublicKey | null>(null);

  const { showError } = useError();

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) return;

      try {
        const parsedGameId = new BN(gameId);
        const gamePda = getGamePDA(ADMIN_PUBLIC_KEY, parsedGameId);
        const gameAccount = await program.account.game.fetch(gamePda);
        setCurrentFlagHolder(gameAccount.currentFlagHolder);
      } catch (err) {
        console.error("Failed to fetch game data:", err);
      }
    };

    fetchGame();
  }, [gameId]);

  const handleEndGame = async () => {
    try {
      if (!publicKey || !gameId || !currentFlagHolder) {
        alert("Missing required data");
        return;
      }
      const parsedGameId = new BN(gameId);
      const gamePda = getGamePDA(ADMIN_PUBLIC_KEY, parsedGameId);
      const vaultPda = getVaultPDA(gamePda);

      const tx = await program.methods
        .endGame(parsedGameId)
        .accounts({
          game: gamePda,
          admin: publicKey,
          winner: currentFlagHolder,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
        const txSig = await sendTransaction(tx, connection);
      console.log(
        `Game ended! View transaction: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`
      );

      alert("Game ended and prize distributed!");
    } catch (err) {
      console.error("Failed to end game:", err);
      showError((err instanceof Error ? err.message : "Unexpected error occurred"));
    }
  };

  return (
    <button
      onClick={handleEndGame}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      End Game
    </button>
  );
}
