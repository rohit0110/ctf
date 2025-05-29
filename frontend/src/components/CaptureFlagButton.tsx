import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram} from "@solana/web3.js";
import {
  program,
  getGamePDA,
  getVaultPDA,
  getPlayerProfilePDA,
  getGameRegistryPDA,
} from "../anchor/setup";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import { BN } from "@coral-xyz/anchor";
import { useError } from "./ErrorContext";

export default function CaptureFlagButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [isHolder, setIsHolder] = useState(false);
  const [gameId, setGameId] = useState<BN | null>(null);
  const { showError } = useError();

  useEffect(() => {
    const fetchGameInfo = async () => {
      if (!publicKey) return;

      try {
        const gameRegistryPDA = getGameRegistryPDA(ADMIN_PUBLIC_KEY);
        const registry = await program.account.gameRegistry.fetch(gameRegistryPDA);
        const currentGameId = new BN(registry.currentGameId);
        setGameId(currentGameId);

        const gamePDA = getGamePDA(ADMIN_PUBLIC_KEY, currentGameId);
        const game = await program.account.game.fetch(gamePDA);

        setIsHolder(game.currentFlagHolder.equals(publicKey));
      } catch (err) {
        console.error("Failed to fetch game state:", err);
        showError(
          err instanceof Error ? err.message : "Unexpected error occurred"
        );
      }
    };

    fetchGameInfo();
  }, [publicKey]);

  const onClick = async () => {
    if (!publicKey || !gameId) return;
    setIsLoading(true);

    try {
      const gamePDA = getGamePDA(ADMIN_PUBLIC_KEY, gameId);
      const vaultPDA = getVaultPDA(gamePDA);
      const playerProfilePDA = getPlayerProfilePDA(publicKey);

      console.log("Game ID:", gameId.toString());
        console.log("Game PDA:", gamePDA.toBase58());
        console.log("Vault PDA:", vaultPDA.toBase58());
        console.log("Player Profile PDA:", playerProfilePDA.toBase58());
        console.log("Public Key:", publicKey.toBase58());
        console.log("Admin Key:", ADMIN_PUBLIC_KEY.toBase58());


      const tx = await program.methods
        .captureFlag(gameId)
        .accounts({
          game: gamePDA,
          vault: vaultPDA,
          admin: ADMIN_PUBLIC_KEY,
          user: publicKey,
          player: playerProfilePDA,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

        try {
            tx.feePayer = publicKey;

            const { value } = await connection.simulateTransaction(tx);
            console.log("Simulation logs:", value.logs);
        } catch (simulationErr) {
            console.error("Simulation failed:", simulationErr);
        }

      const txSig = await sendTransaction(tx, connection);
      console.log(`Flag captured! https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);
    } catch (err) {
      console.error("Error capturing flag:", err);
        showError(
            err instanceof Error ? err.message : "Unexpected error occurred"
        );
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !publicKey || isLoading || isHolder;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full text-white rounded py-2 ${
        isDisabled ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
      } disabled:opacity-50`}
    >
      {isLoading
        ? "Capturing..."
        : isHolder
        ? "You already hold the flag"
        : "Capture Flag"}
    </button>
  );
}
