import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, getGamePDA, getVaultPDA, getGameRegistryPDA } from "../anchor/setup";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import { useError } from "./ErrorContext";

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

  const gameRegistry = getGameRegistryPDA(ADMIN_PUBLIC_KEY);

  const { showError } = useError();

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
    console.log(`Game initialized! View: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);

    // 👉 Check if GameRegistry exists
    const accountInfo = await connection.getAccountInfo(gameRegistry);

    let regTx;
    if (!accountInfo) {
      // GameRegistry doesn't exist: initialize
      regTx = await program.methods
        .initializeGameRegistry(parsedGameId)
        .accounts({
          gameRegistry: gameRegistry,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      console.log("Creating new Game Registry...");
    } else {
      // GameRegistry exists: update
      regTx = await program.methods
        .updateGameRegistry(parsedGameId)
        .accounts({
          gameRegistry: gameRegistry,
          admin: publicKey,
        })
        .transaction();
      console.log("Updating existing Game Registry...");
    }

    const regTxSig = await sendTransaction(regTx, connection);
    console.log(`Registry tx: https://solana.fm/tx/${regTxSig}?cluster=devnet-alpha`);
  } catch (error) {
    console.error("Error initializing game or registry:", error);
    showError((error instanceof Error ? error.message : "Unexpected error occurred"));
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
