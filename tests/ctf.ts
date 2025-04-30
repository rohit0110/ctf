import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ctf } from "../target/types/ctf";

describe("ctf", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ctf as Program<Ctf>;

  // Keypairs
  const user = anchor.web3.Keypair.generate();

  let gamePda: anchor.web3.PublicKey;
  let playerPda: anchor.web3.PublicKey;

  it("Initializes game and player", async () => {
    gamePda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game")],
      program.programId
    )[0];

    playerPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), user.publicKey.toBuffer()],
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
});
