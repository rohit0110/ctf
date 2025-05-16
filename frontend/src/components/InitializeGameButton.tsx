import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, getGamePDA, getVaultPDA } from "../anchor/setup";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";

export default function InitializeGameButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  // Example fixed args, change as needed
  const gameDuration = new BN(2 * 60 * 60); // 2 hours in seconds (or whatever unit your program expects)
  const baseCaptureCost = new BN(1_000_000); // e.g. 0.001 SOL
  const baseFeeLamports = new BN(10_000); // fee in lamports
  const gameId = new BN(1);

  const gamePDA = getGamePDA(ADMIN_PUBLIC_KEY, gameId);  
  const vaultPDA = getVaultPDA(gamePDA);

  const onClick = async () => {
    if (!publicKey) return;
    setIsLoading(true);

    try {
      const tx = await program.methods
        .initializeGame(gameId, gameDuration, baseCaptureCost, baseFeeLamports)
        .accounts({
          game: gamePDA,
          vault: vaultPDA,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const txSig = await sendTransaction(tx, connection);

      console.log(
        `Game initialized! View transaction: https://solana.fm/tx/${txSig}?cluster=devnet`,
      );
    } catch (error) {
      console.error("Error initializing game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button className="w-32" onClick={onClick} disabled={!publicKey || isLoading}>
      {isLoading ? "Initializing..." : "Initialize Game"}
    </button>
  );
}
