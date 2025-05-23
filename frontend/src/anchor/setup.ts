import { type IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, type Ctf } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { BN } from "@coral-xyz/anchor";
import { PROGRAM_ID } from "../constant/constant";


// Constants
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Program instance
export const program = new Program<Ctf>(IDL, PROGRAM_ID, { connection });

// Utility to get Game PDA
function getGamePDA(admin: PublicKey, gameId: BN): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("game"),
      admin.toBuffer(),
      gameId.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  )[0];
}

//Utility to get Vault PDA
function getVaultPDA(gamePDA: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gamePDA.toBuffer()],
    PROGRAM_ID,
  )[0];
}

// Utility to get Game Registry PDA
function getGameRegistryPDA(admin: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("game_registry"), admin.toBuffer()],
    PROGRAM_ID
  )[0];
}

// Utility to get Player Profile PDA
function getPlayerProfilePDA(user: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("player"),
      user.toBuffer()
    ],
      PROGRAM_ID
  )[0];
}

// Export TypeScript type for the game account
export type GameAccount = IdlAccounts<Ctf>["game"];
export { getGamePDA, getVaultPDA, getGameRegistryPDA, getPlayerProfilePDA };
