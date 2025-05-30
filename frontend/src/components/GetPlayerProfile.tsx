import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  program,
  getPlayerProfilePDA,
  type PlayerProfileAccount
} from "../anchor/setup";
import { useError } from "./ErrorContext";
import { useCurrentGameId } from "./GetActiveGameId";
import { BN } from "@coral-xyz/anchor";

export function usePlayerProfile() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [profile, setProfile] = useState<PlayerProfileAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();
  const { gameId } = useCurrentGameId();

  useEffect(() => {
    if (!publicKey || !gameId) return;

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        console.log("Fetching player profile for:", publicKey.toBase58());
        const profilePDA = getPlayerProfilePDA(publicKey, new BN(gameId));
        console.log("Profile PDA:", profilePDA.toBase58());
        const playerData = await program.account.player.fetch(profilePDA);
        if (isMounted) setProfile(playerData);
      } catch (err) {
        console.error("Failed to fetch player profile:", err);
        if (isMounted) {
          showError(err instanceof Error ? err.message : "Unexpected error occurred");
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    const profilePDA = getPlayerProfilePDA(publicKey, new BN(gameId) );
    const subscriptionId = connection.onAccountChange(
      profilePDA,
      async (accountInfo) => {
        try {
          const decoded = program.coder.accounts.decode("player", accountInfo.data);
          setProfile(decoded);
        } catch (error) {
          console.error("Error decoding player profile:", error);
          showError(
            error instanceof Error ? error.message : "Failed to decode player profile"
          );
        }
      }
    );

    return () => {
      isMounted = false;
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection, gameId]);

  return { profile, loading };
}
