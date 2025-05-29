// src/pages/Home.tsx
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, getPlayerProfilePDA } from "../anchor/setup";
import { SystemProgram } from "@solana/web3.js";
import { useError } from "../components/ErrorContext";

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const { showError } = useError();

  useEffect(() => {
    const initializePlayerProfile = async () => {
      if (!publicKey) return;

      const playerProfilePDA = getPlayerProfilePDA(publicKey);

      const accountInfo = await connection.getAccountInfo(playerProfilePDA);
      if (accountInfo) {
        console.log("Player profile already exists");
        return;
      }

      try {
        const tx = await program.methods
          .initializePlayer()
          .accounts({
            user: publicKey,
            player: playerProfilePDA,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        const txSig = await sendTransaction(tx, connection);
        console.log(`Player profile created: https://solana.fm/tx/${txSig}?cluster=devnet-alpha`);
      } catch (err) {
        console.error("Failed to create player profile", err);
        showError(
          err instanceof Error ? err.message : "Unexpected error occurred"
        );
      }
    };

    if (publicKey) {
      if (publicKey.equals(ADMIN_PUBLIC_KEY)) {
        navigate("/admin");
      } else {
        initializePlayerProfile().then(() => navigate("/player"));
      }
    }
  }, [publicKey, navigate, connection, sendTransaction]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">Capture The Flag</h1>
      <WalletMultiButton />
      <p>Connect your wallet to continue</p>
    </div>
  );
}
