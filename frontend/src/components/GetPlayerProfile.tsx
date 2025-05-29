import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, getPlayerProfilePDA, type PlayerProfileAccount } from "../anchor/setup";
import { useError } from "./ErrorContext";

export function usePlayerProfile() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [profile, setProfile] = useState<PlayerProfileAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    if (!publicKey) return;

    const fetchProfile = async () => {
      try {
        console.log("Fetching player profile for:", publicKey.toBase58());
        const profilePDA = getPlayerProfilePDA(publicKey);
        console.log("Profile PDA:", profilePDA.toBase58());
        const playerData = await program.account.player.fetch(profilePDA);
        setProfile(playerData);
      } catch (err) {
        console.error("Failed to fetch player profile:", err);
        showError(err instanceof Error ? err.message : "Unexpected error occurred");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const profilePDA = getPlayerProfilePDA(publicKey);
    const subscriptionId = connection.onAccountChange(
      profilePDA,
      async (accountInfo) => {
        try {
          const decoded = program.coder.accounts.decode("player", accountInfo.data);
          setProfile(decoded);
        } catch (error) {
          console.error("Error decoding player profile:", error);
        }
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  return { profile, loading };
}
