import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ctf } from "../target/types/ctf";
import { assert } from "chai";

describe("ctf", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ctf as Program<Ctf>;
  const user = anchor.web3.Keypair.generate();
  const gameId = new anchor.BN(43); // Example game ID, use any unique number

  let gamePda: anchor.web3.PublicKey;
  let playerPda: anchor.web3.PublicKey;
  let vaultPda: anchor.web3.PublicKey;

  it("Initializes game and player", async () => {
    const gameIdBytes = gameId.toArrayLike(Buffer, "le", 8);
    gamePda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), provider.wallet.publicKey.toBuffer(), gameIdBytes],
      program.programId
    )[0];

    playerPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), user.publicKey.toBuffer(), gameIdBytes],
      program.programId
    )[0];

    vaultPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    )[0];

    // Airdrop SOL to the user
    const sig = await provider.connection.requestAirdrop(user.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig);

    // Initialize Game
    await program.methods
      .initializeGame(
        gameId,
        new anchor.BN(600),
        new anchor.BN(15),
        new anchor.BN(50000)
      )
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Initialize Player
    await program.methods
      .initializePlayer(gameId)
      .accounts({
        user: user.publicKey,
        player: playerPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
  });

  it("Starts the game", async () => {
    await program.methods
      .startGame(gameId)
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Vault balance during init:", await provider.connection.getBalance(vaultPda));
    const vaultInfo = await provider.connection.getAccountInfo(vaultPda);
    console.log("Vault account info:", vaultInfo);
  });

  it("Captures the flag", async () => {
    await program.methods
      .captureFlag(gameId)
      .accounts({
        game: gamePda,
        user: user.publicKey,
        player: playerPda,
        admin: provider.wallet.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const game = await program.account.game.fetch(gamePda);
    const player = await program.account.player.fetch(playerPda);

    console.log("Current flag holder:", game.currentFlagHolder.toBase58());
    console.log("Remaining health:", player.health.toString());
  });

  it("Ends the game and distributes prize", async () => {
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);
    const vaultAccountInfo = await provider.connection.getAccountInfo(vaultPda);
    console.log("Vault owner:", vaultAccountInfo.owner.toBase58());

    const gameBefore = await program.account.game.fetch(gamePda);
    const prizeAmount = gameBefore.prizePool.toNumber();

    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    const adminBalanceBefore = await provider.connection.getBalance(provider.wallet.publicKey);

    await program.methods
      .endGame(gameId)
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
        winner: user.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
    const adminBalanceAfter = await provider.connection.getBalance(provider.wallet.publicKey);

    const game = await program.account.game.fetch(gamePda);

    // Assertions
    assert.ok(vaultBalanceBefore - vaultBalanceAfter === prizeAmount);
    assert.ok(userBalanceAfter - userBalanceBefore >= 0.79 * prizeAmount);
    assert.ok(adminBalanceAfter - adminBalanceBefore + 5000 >= 0.19 * prizeAmount);
  });
});
