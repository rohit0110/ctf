import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ctf } from "../target/types/ctf";
import { assert } from "chai";

describe("ctf", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ctf as Program<Ctf>;

  // Keypairs
  const user = anchor.web3.Keypair.generate();

  let gamePda: anchor.web3.PublicKey;
  let playerPda: anchor.web3.PublicKey;
  let vaultPda: anchor.web3.PublicKey;

  it("Initializes game and player", async () => {
    gamePda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game")],
      program.programId
    )[0];

    playerPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), user.publicKey.toBuffer()],
      program.programId
    )[0];

    vaultPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    )[0];

    // Airdrop some SOL to user
    const sig = await provider.connection.requestAirdrop(user.publicKey, 2e9); // 2 SOL
    await provider.connection.confirmTransaction(sig);

    // Initialize game
    const tx = await program.methods
      .initializeGame(
        new anchor.BN(600), // duration
        new anchor.BN(15), // base capture cost (health)
        new anchor.BN(100000) // base fee (lamports)
      )
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Game initialized with tx:", tx);
    // Initialize player
    await program.methods
      .initializePlayer() // starting health
      .accounts({
        user: user.publicKey,
        player: playerPda,
        game: gamePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
  });

  it("Starts the game", async () => {
    const tx = await program.methods
      .startGame()
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
      })
      .rpc();
    console.log("Game started with tx:", tx);
  });

  it("Captures the flag", async () => {
    const tx = await program.methods
      .captureFlag()
      .accounts({
        game: gamePda,
        user: user.publicKey,
        player: playerPda,
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const game = await program.account.game.fetch(gamePda);
    const player = await program.account.player.fetch(playerPda);
    console.log("Flag captured with tx:", tx);
    console.log("Current flag holder:", game.currentFlagHolder.toBase58());
    console.log("Remaining health:", player.health.toString());
  });

  it("Ends the game and distributes prize", async () => {
    vaultPda = new anchor.web3.PublicKey("GX8QWQQPXU5qZAvBGL8fYTLv1698bB6z4SZCZ4r3tpuR");

    // Fetch vault balance before game ends
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);
    console.log("Vault balance before:", vaultBalanceBefore);

    // Fetch the current prize pool in the game state
    const gameBefore = await program.account.game.fetch(gamePda);
    const prizeAmount = gameBefore.prizePool.toNumber(); // Assuming `prizePool` holds the total prize pool amount

    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    const adminBalanceBefore = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("Vault PDA:", vaultPda.toBase58());
    console.log("Winner pubkey:", user.publicKey.toBase58());
    console.log("Admin pubkey:", provider.wallet.publicKey.toBase58());

    const tx = await program.methods
      .endGame()
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
        winner: user.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Game ended with tx:", tx);

    // Fetch balances after game ends
    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
    const adminBalanceAfter = await provider.connection.getBalance(provider.wallet.publicKey);

    console.log("User balance before:", userBalanceBefore);
    console.log("User balance after :", userBalanceAfter);
    console.log("Admin balance before:", adminBalanceBefore);
    console.log("Admin balance after :", adminBalanceAfter);
    console.log("Vault balance before:", vaultBalanceBefore);
    console.log("Vault balance after :", vaultBalanceAfter);

    const game = await program.account.game.fetch(gamePda);
    console.log("Game state:", game.state);
    console.log("Prize pool after end:", game.prizePool.toNumber());

    // Assert that the vault balance has decreased by the prize amount
    assert.ok(vaultBalanceBefore - vaultBalanceAfter === prizeAmount);

    // Assert that the winner received the prize
    assert.ok(userBalanceAfter - userBalanceBefore === prizeAmount);
  });
});
