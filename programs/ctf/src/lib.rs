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
}

