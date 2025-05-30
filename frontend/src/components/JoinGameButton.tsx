import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { program, getPlayerProfilePDA } from "../anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { useError } from "./ErrorContext";
import { useNavigate } from "react-router-dom";

type Props = {
  gameId: string;
};

export default function JoinGameButton({ gameId }: Props) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useError();
  const navigate = useNavigate();

  const parsedGameId = new BN(gameId);

  const onClick = async () => {
    if (!publicKey) return;
    setIsLoading(true);

    try {
      const playerPDA = getPlayerProfilePDA(publicKey, parsedGameId);

      const accountInfo = await connection.getAccountInfo(playerPDA);
      if (accountInfo) {
        console.log("Player already joined the game.");
        navigate(`/game`);
        return;
      }

      const tx = await program.methods
        .initializePlayer(parsedGameId)
        .accounts({
          player: playerPDA,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const txSig = await sendTransaction(tx, connection);
      console.log(`Game Joined: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);
      await connection.confirmTransaction(txSig, "confirmed");

      navigate(`/game`);
    } catch (error) {
      console.error("Error joining game:", error);
      showError(error instanceof Error ? error.message : "Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={!publicKey || isLoading}
      className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700 disabled:opacity-50 mt-4"
    >
      {isLoading ? "Joining..." : "Join Game"}
    </button>
  );
}
