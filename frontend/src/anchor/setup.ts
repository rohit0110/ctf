import { type IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, type Ctf } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";


// Constants
export const programId = new PublicKey("4TaboyQDfz6ds2qZpCttzZAHzF7i8qNsFYeoBHTUPvzX");
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Program instance
export const program = new Program<Ctf>(IDL, programId, { connection });

// Utility to get Game PDA
export function getGamePDA(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("game")],
    program.programId
  )[0];
}

// Export TypeScript type for the game account
export type GameAccount = IdlAccounts<Ctf>["game"];
