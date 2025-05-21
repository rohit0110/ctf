import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, getGamePDA, getVaultPDA } from "../anchor/setup";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";

type Props = {
  gameId: string;
  duration: string;
  captureCost: string;
  baseFee: string;
};

export default function InitializeGameButton({
  gameId,
  duration,
  captureCost,
  baseFee,
}: Props) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const parsedGameId = new BN(gameId);
  const parsedDuration = new BN(duration);
  const parsedCaptureCost = new BN(captureCost);
  const parsedBaseFee = new BN(baseFee);

  const gamePDA = getGamePDA(ADMIN_PUBLIC_KEY, parsedGameId);
  const vaultPDA = getVaultPDA(gamePDA);

  const onClick = async () => {
    if (!publicKey) return;
    setIsLoading(true);

    try {
      const tx = await program.methods
        .initializeGame(parsedGameId, parsedDuration, parsedCaptureCost, parsedBaseFee)
        .accounts({
          game: gamePDA,
          vault: vaultPDA,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const txSig = await sendTransaction(tx, connection);
      console.log(
        `Game initialized! View transaction: https://solana.fm/tx/${txSig}?cluster=devnet`
      );
    } catch (error) {
      console.error("Error initializing game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={!publicKey || isLoading}
      className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? "Initializing..." : "Initialize Game"}
    </button>
  );
}
