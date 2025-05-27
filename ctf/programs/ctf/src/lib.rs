use anchor_lang::prelude::*;

// Declare the program ID
declare_id!("F2qzfimMATGDD797Wf6pszDPW4J9tL4TvFixokMKkdiu");

#[program]
pub mod ctf {
    use super::*;

    /// Initializes the game registry account with the given game_id.
    /// Only the admin who owns the registry can update it.
    pub fn initialize_game_registry(ctx: Context<InitializeGameRegistry>, game_id: u64) -> Result<()> {
        let game_registry = &mut ctx.accounts.game_registry;
        require_keys_eq!(game_registry.admin, ctx.accounts.admin.key(), CustomError::InvalidAuthToUpdateGameRegistry);
        game_registry.current_game_id = game_id;
        Ok(())
    }

    /// Updates the current game_id in the game registry.
    pub fn update_game_registry(ctx: Context<UpdateGameRegistry>, game_id: u64) -> Result<()> {
        let game_registry = &mut ctx.accounts.game_registry;
        game_registry.current_game_id = game_id;
        Ok(())
    }

    /// Initializes a new game account and its associated vault.
    /// Sets up the game parameters and creates a rent-exempt vault PDA.
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        _game_id: u64,
        game_duration: i64,       // in seconds
        base_capture_cost: u64,   // cost in health points
        base_fee_lamports: u64,   // fee in lamports
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let clock = Clock::get()?;

        // Calculate the rent-exempt minimum for the vault
        let rent_exemption = Rent::get()?.minimum_balance(0);

        // Create the vault account using a CPI to the system program
        let create_vault_ix = anchor_lang::solana_program::system_instruction::create_account(
            &ctx.accounts.admin.key(),
            &ctx.accounts.vault.key(),
            rent_exemption,
            0,
            &anchor_lang::solana_program::system_program::ID,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &create_vault_ix,
            &[
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[
                b"vault",
                game.key().as_ref(),
                &[ctx.bumps.vault],
            ]],
        )?;

        // Initialize game state
        game.state = GameState::Pending;
        game.start_time = clock.unix_timestamp;
        game.duration = game_duration;
        game.base_capture_cost = base_capture_cost;
        game.base_fee_lamports = base_fee_lamports;
        game.global_captures = 0;
        game.current_flag_holder = Pubkey::default();
        game.bump = ctx.bumps.game;
        game.vault = ctx.accounts.vault.key();
        game.vault_bump = ctx.bumps.vault;

        Ok(())
    }

    /// Initializes a new player account with default health.
    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.health = 100; // Default health
        Ok(())
    }

    /// Starts the game, transitioning its state from Pending to Active.
    pub fn start_game(ctx: Context<UpdateGameState>, _game_id: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(
            game.state == GameState::Pending,
            CustomError::InvalidStateTransition
        );
        game.state = GameState::Active;
        Ok(())
    }

    /// Starts the final phase of the game, transitioning from Active to FinalPhase.
    pub fn start_final_phase(ctx: Context<UpdateGameState>, _game_id: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(
            game.state == GameState::Active,
            CustomError::InvalidStateTransition
        );
        game.state = GameState::FinalPhase;
        Ok(())
    }

    /// Ends the game, distributes the prize pool, and marks the game as Completed.
    pub fn end_game(ctx: Context<EndGame>, _game_id: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let game_key = game.key();

        // Ensure the game is not already completed
        require!(
            game.state != GameState::Completed,
            CustomError::AlreadyCompleted
        );

        game.state = GameState::Completed;

        let winner = game.current_flag_holder;
        let winner_share = game.prize_pool * 80 / 100;
        let protocol_share = game.prize_pool * 20 / 100;
        msg!("Winner share: {}", winner_share);

        let vault_seeds = &[
            b"vault".as_ref(),
            game_key.as_ref(),
            &[game.vault_bump],
        ];

        // Transfer 80% of the prize pool to the winner
        let winner_transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(),
            &winner,
            winner_share,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &winner_transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.winner.to_account_info(),
            ],
            &[vault_seeds],
        )?;

        // Transfer 20% of the prize pool to the admin (protocol fee)
        let protocol_transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(),
            &ctx.accounts.admin.key(),
            protocol_share,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &protocol_transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.admin.to_account_info(),
            ],
            &[vault_seeds]
        )?;

        game.prize_pool = 0;

        Ok(())
    }

    /// Allows a player to capture the flag if the game is active.
    /// Deducts health, charges a fee, updates the game state, and extends the game if needed.
    pub fn capture_flag(ctx: Context<CaptureFlag>, _game_id: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let user = &mut ctx.accounts.user;
        let player = &mut ctx.accounts.player;
        let clock = Clock::get()?;

        // Ensure the game is Active
        require!(game.state == GameState::Active, CustomError::GameNotActive);

        // Check time bounds
        let now = clock.unix_timestamp;
        require!(now < game.start_time + game.duration, CustomError::GameOver);

        // If in the last 5 minutes, extend the game by 5 minutes
        if game.duration - (now - game.start_time) <= 300 {
            game.duration += 300;
        }
        game.last_capture_time = now;

        // Calculate dynamic health cost and check player health
        let dynamic_cost = std::cmp::min(
            game.base_capture_cost + 5 * (game.global_captures / 10),
            30,
        );
        require!(player.health >= dynamic_cost, CustomError::NotEnoughHealth);
        player.health -= dynamic_cost;

        // Update player state based on health
        if player.health < 15 {
            player.state = PlayerState::Eliminated;
        } else if player.health < 25 {
            player.state = PlayerState::Critical;
        } else {
            player.state = PlayerState::Active;
        }

        // Charge lamports from player to vault
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &user.key(),
            &ctx.accounts.vault.key(),
            game.base_fee_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[user.to_account_info(), ctx.accounts.vault.to_account_info()],
        )?;

        // Update game state
        game.current_flag_holder = user.key();
        game.global_captures += 1;
        game.prize_pool += game.base_fee_lamports;

        Ok(())
    }
}

// ---------------------- Account Contexts ----------------------

/// Context for initializing a new game.
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Game::INIT_SPACE,
        seeds = [b"game", admin.key().as_ref(), game_id.to_le_bytes().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump,
    )]
    /// CHECK: This is a PDA owned by the program that holds the funds
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Context for initializing the game registry.
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct InitializeGameRegistry<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GameRegistry::INIT_SPACE,
        seeds = [b"game_registry", admin.key().as_ref()],
        bump
    )]
    pub game_registry: Account<'info, GameRegistry>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Context for updating the game state (start/final phase).
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct UpdateGameState<'info> {
    #[account(mut, seeds = [b"game", admin.key().as_ref(), game_id.to_le_bytes().as_ref()], bump)]
    pub game: Account<'info, Game>,
    pub admin: Signer<'info>,
}

/// Context for updating the game registry.
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct UpdateGameRegistry<'info> {
    #[account(mut, seeds = [b"game_registry", admin.key().as_ref()], bump)]
    pub game_registry: Account<'info, GameRegistry>,
    pub admin: Signer<'info>,
}

/// Context for capturing the flag.
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct CaptureFlag<'info> {
    #[account(mut, seeds = [b"game", admin.key().as_ref(), game_id.to_le_bytes().as_ref()], bump)]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump = game.vault_bump,
    )]
    /// CHECK: This is a PDA owned by the program that holds the funds
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"player", user.key().as_ref()], bump)]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub admin: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

/// Context for initializing a player account.
#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + Player::INIT_SPACE,
        seeds = [b"player", user.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    pub system_program: Program<'info, System>,
}

/// Context for ending the game and distributing rewards.
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct EndGame<'info> {
    #[account(mut, seeds = [b"game", admin.key().as_ref(), game_id.to_le_bytes().as_ref()], bump = game.bump)]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump = game.vault_bump,
    )]
    /// CHECK: This is a PDA owned by the program that holds the funds
    pub vault: SystemAccount<'info>,

    #[account(mut, address = game.current_flag_holder)]
    pub winner: SystemAccount<'info>,

    #[account(mut)]
    pub admin: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

// ---------------------- Account Structures ----------------------

/// Game account storing all game state and configuration.
#[account]
#[derive(InitSpace)]
pub struct Game {
    pub state: GameState,
    pub start_time: i64,
    pub duration: i64,
    pub base_capture_cost: u64,
    pub base_fee_lamports: u64,
    pub global_captures: u64,
    pub current_flag_holder: Pubkey,
    pub winner: Option<Pubkey>,
    pub last_capture_time: i64,
    pub prize_pool: u64,
    pub bump: u8,
    pub vault: Pubkey,
    pub vault_bump: u8,
}

/// Player account storing player-specific state.
#[account]
#[derive(InitSpace)]
pub struct Player {
    pub health: u64,
    pub state: PlayerState,
}

/// Game registry account for tracking the current game.
#[account]
#[derive(InitSpace)]
pub struct GameRegistry {
    pub current_game_id: u64,
    pub admin: Pubkey,
}

// ---------------------- Enums ----------------------

/// Enum representing the state of the game.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum GameState {
    Pending,
    Active,
    FinalPhase,
    Completed,
}

/// Enum representing the state of a player.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum PlayerState {
    Active,
    Critical,
    Eliminated,
}

// ---------------------- Custom Errors ----------------------

#[error_code]
pub enum CustomError {
    #[msg("Game is not active.")]
    GameNotActive,
    #[msg("The game has ended.")]
    GameOver,
    #[msg("Invalid game state transition.")]
    InvalidStateTransition,
    #[msg("Game already completed.")]
    AlreadyCompleted,
    #[msg("Not enough health to capture the flag.")]
    NotEnoughHealth,
    #[msg("Invalid vault owner.")]
    InvalidVaultOwner,
    #[msg("Invalid autth to update game registry.")]
    InvalidAuthToUpdateGameRegistry,
}