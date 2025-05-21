import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { program, getGamePDA} from "../anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";

type Props = {
  gameId: string;
};

export default function StartGameButton({ gameId }: Props) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const parsedGameId = new BN(gameId);
  const gamePDA = getGamePDA(ADMIN_PUBLIC_KEY, parsedGameId);

  const onClick = async () => {
    if (!publicKey) return;
    setIsLoading(true);

    try {
      const tx = await program.methods
        .startGame(parsedGameId)
        .accounts({
          game: gamePDA,
          admin: publicKey,
        })
        .transaction();

      const txSig = await sendTransaction(tx, connection);
      console.log(
        `Game Started! View transaction: https://solana.fm/tx/${txSig}?cluster=devnet`
      );
    } catch (error) {
      console.error("Error starting game:", error);
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
      {isLoading ? "Starting..." : "Start Game"}
    </button>
  );
}
