// src/pages/Home.tsx
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ADMIN_PUBLIC_KEY } from "../constant/constant";

export default function Home() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (publicKey) {
      if (publicKey.equals(ADMIN_PUBLIC_KEY)) {
        navigate("/admin");
      } else {
        navigate("/player");
      }
    }
  }, [publicKey, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">Capture The Flag</h1>
      <WalletMultiButton />
      <p>Connect your wallet to continue</p>
    </div>
  );
}
