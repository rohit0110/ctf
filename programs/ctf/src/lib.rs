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

        game.state = GameState::Pending;
        game.start_time = clock.unix_timestamp;
        game.duration = game_duration;
        game.base_capture_cost = base_capture_cost;
        game.base_fee_lamports = base_fee_lamports;
        game.global_captures = 0;
        game.current_flag_holder = Pubkey::default();

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
    

    pub fn end_game(ctx: Context<UpdateGameState>) -> Result<()> {
        let game = &mut ctx.accounts.game;
    
        require!(
            game.state != GameState::Completed,
            CustomError::AlreadyCompleted
        );
    
        game.state = GameState::Completed;
    
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
    
        // Ensure player has enough health
        require!(
            player.health >= game.base_capture_cost,
            CustomError::NotEnoughHealth
        );
        // Deduct health
        player.health -= game.base_capture_cost;

        // Charge lamports from player
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &user.key(),
            &ctx.accounts.admin.key(),
            game.base_fee_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                user.to_account_info(),
                ctx.accounts.admin.to_account_info(),
            ],
        )?;
    
        // Update game state
        game.current_flag_holder = user.key();
        game.global_captures += 1;
    
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
}

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub health: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum GameState {
    Pending,
    Active,
    FinalPhase,
    Completed,
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

