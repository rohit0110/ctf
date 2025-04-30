import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ctf } from "../target/types/ctf";

describe("ctf", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ctf as Program<Ctf>;

  it("Initializes the game", async () => {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game")],
      program.programId
    );

    await program.methods
      .initializeGame(new anchor.BN(600), new anchor.BN(15), new anchor.BN(100000))
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const game = await program.account.game.fetch(gamePda);
    console.log("Game state:", game);
  });
  
  it("Starts the game", async () => {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game")],
      program.programId
    );

    await program.methods
      .startGame()
      .accounts({
        game: gamePda,
        admin: provider.wallet.publicKey,
      })
      .rpc();

    const game = await program.account.game.fetch(gamePda);
    console.log("Game state:", game);
  });
});
