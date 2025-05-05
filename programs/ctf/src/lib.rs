use anchor_lang::prelude::*;
declare_id!("vHD8wKXwHGZsryn5VSbRCWTSHzP2vqCD8dh6VRUXq6W");

#[program]
pub mod ctf {
    use super::*;

    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        game_duration: i64,       // in seconds
        base_capture_cost: u64,   // cost in health points
        base_fee_lamports: u64,   // fee in lamports
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let clock = Clock::get()?;

        // Calculate the rent-exempt minimum for the vault
    let rent_exemption = Rent::get()?.minimum_balance(0); // 0 bytes of data

    // Create the vault account
    let create_vault_ix = anchor_lang::solana_program::system_instruction::create_account(
        &ctx.accounts.admin.key(),
        &ctx.accounts.vault.key(),
        rent_exemption,
        0, // No data space required
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

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;

        player.health = 100; // Default health

        Ok(())
    }

    pub fn start_game(ctx: Context<UpdateGameState>) -> Result<()> {
        let game = &mut ctx.accounts.game;
    
        require!(
            game.state == GameState::Pending,
            CustomError::InvalidStateTransition
        );
    
        game.state = GameState::Active;
    
        Ok(())
    }

    pub fn start_final_phase(ctx: Context<UpdateGameState>) -> Result<()> {
        let game = &mut ctx.accounts.game;
    
        require!(
            game.state == GameState::Active,
            CustomError::InvalidStateTransition
        );
    
        game.state = GameState::FinalPhase;
    
        Ok(())
    }
    

    pub fn end_game(ctx: Context<EndGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let game_key = game.key();
    
        require!(
            game.state != GameState::Completed,
            CustomError::AlreadyCompleted
        );
    
        game.state = GameState::Completed; 
    
        let winner = game.current_flag_holder;
        let winner_share = game.prize_pool * 80 / 100;
        let protocol_share = game.prize_pool - winner_share;
    
        let vault_seeds = &[
            b"vault".as_ref(),
            game_key.as_ref(),
            &[game.vault_bump],
        ];
    
        // Transfer 80% to winner
        let winner_transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(), // Use the vault key
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
    
        let protocol_transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(), // Use the vault key
            &ctx.accounts.admin.key(),
            protocol_share,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &protocol_transfer_ix,
            &[
                game.to_account_info(),
                ctx.accounts.admin.to_account_info(),
            ],
            &[vault_seeds]
        )?;
    
        game.prize_pool = 0;
    
        Ok(())
    }
    
    
    // player var is used for player account in game, user var is used for user signing the transaction
    pub fn capture_flag(ctx: Context<CaptureFlag>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let user = &mut ctx.accounts.user;
        let player = &mut ctx.accounts.player;
        let clock = Clock::get()?;
    
        // Ensure the game is Active
        require!(game.state == GameState::Active, CustomError::GameNotActive);
    
        // (Optional) Check time bounds
        let now = clock.unix_timestamp;
        require!(now < game.start_time + game.duration, CustomError::GameOver);

        // Check if the game is in the final phase and extend the duration if needed
        if game.duration - (now - game.start_time) <= 300 {
            game.duration += 300; // extend by 5 minutes
        }
        game.last_capture_time = now;
    
        // Ensure player has enough health
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
        
        

        // Charge lamports from player
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &user.key(),
            &ctx.accounts.vault.key(), // send fee to vault
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

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Game::INIT_SPACE,
        seeds = [b"game"],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGameState<'info> {
    #[account(mut, seeds = [b"game"], bump)]
    pub game: Account<'info, Game>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CaptureFlag<'info> {
    #[account(mut, seeds = [b"game"], bump)]
    pub game: Account<'info, Game>,
    #[account(mut, seeds = [b"vault", game.key().as_ref()], bump = game.vault_bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"player", user.key().as_ref()], bump)]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub admin: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

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

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(mut, seeds = [b"game"], bump = game.bump)]
    pub game: Account<'info, Game>,

    #[account(mut, seeds = [b"vault", game.key().as_ref()], bump = game.vault_bump)]
    pub vault: SystemAccount<'info>,

    #[account(mut, address = game.current_flag_holder)]
    /// CHECK: This account is safe to use as it is the current flag holder.
    pub winner: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}


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

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub health: u64,
    pub state: PlayerState,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum GameState {
    Pending,
    Active,
    FinalPhase,
    Completed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum PlayerState {
    Active,
    Critical,
    Eliminated,
}


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
}

