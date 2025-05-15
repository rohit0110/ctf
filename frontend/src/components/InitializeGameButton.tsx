import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, getGamePDA } from "../anchor/setup";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer";

export default function InitializeGameButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  // Example fixed args, change as needed
  const gameDuration = BigInt(2 * 60 * 60); // 2 hours in seconds (or whatever unit your program expects)
  const baseCaptureCost = BigInt(1_000_000); // e.g. 0.001 SOL
  const baseFeeLamports = BigInt(10_000); // fee in lamports

  const gamePDA = getGamePDA();

  // You also need to derive the vault PDA similarly or get it from your program
  // For this example, I’m showing a dummy vault PDA derivation; adjust as per your program
  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const onClick = async () => {
    if (!publicKey) return;
    setIsLoading(true);

    try {
      const tx = await program.methods
        .initializeGame(gameDuration, baseCaptureCost, baseFeeLamports)
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
