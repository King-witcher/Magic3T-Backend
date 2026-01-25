import { Team } from '@magic3t/common-types'
import { useEffect } from 'react'
import { GiCrossedSwords } from 'react-icons/gi'
import { Button } from '@/components/atoms'
import { useGame } from '@/contexts/game-context'
import { useDialogStore } from '@/contexts/modal-store'
import { GameBoard } from './components/game-board'
// import { GameChat } from './components/game-chat'
import { GameResultModal } from './components/game-result-modal'
import { PlayerPanel } from './components/player-panel'
import { SurrenderModal } from './components/surrender-modal'

export function GameTemplate() {
  const gameCtx = useGame()
  const showDialog = useDialogStore((state) => state.showDialog)
  // const chatInputRef = useRef<HTMLInputElement>(null)

  // Current player's team and opponent's team
  const myTeam = gameCtx.currentTeam || Team.Order
  const enemyTeam = (1 - myTeam) as Team
  const myPlayer = gameCtx.teams[myTeam]
  const enemyPlayer = gameCtx.teams[enemyTeam]

  // Is it my turn?
  const isMyTurn = gameCtx.turn !== null && gameCtx.turn === gameCtx.currentTeam

  // Show result modal when game ends
  useEffect(() => {
    return gameCtx.onMatchReport(() => {
      setTimeout(() => {
        showDialog(<GameResultModal />, { closeOnOutsideClick: true })
      }, 500)
    })
  }, [gameCtx, showDialog])

  const handleSurrender = () => {
    showDialog(<SurrenderModal onClose={() => {}} />, {
      closeOnOutsideClick: true,
    })
  }

  if (!gameCtx.isActive) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-4">
        {/* Main game area */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6">
          {/* Left side - Players and Board */}
          <div className="flex flex-col items-center gap-4 flex-1">
            {/* Enemy Player Panel */}
            <PlayerPanel
              profile={enemyPlayer.profile}
              timer={enemyPlayer.timer}
              isPaused={gameCtx.turn === null}
              isActive={gameCtx.turn === enemyTeam}
              position="top"
              lpGain={enemyPlayer.gain}
            />

            {/* VS Divider */}
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold-5/50 to-gold-5/50" />
              <GiCrossedSwords className="text-gold-4 text-2xl" />
              <div className="flex-1 h-px bg-linear-to-l from-transparent via-gold-5/50 to-gold-5/50" />
            </div>

            {/* Game Board */}
            <GameBoard
              allyChoices={myPlayer.choices}
              enemyChoices={enemyPlayer.choices}
              isMyTurn={isMyTurn}
              isGameOver={gameCtx.finished}
              onSelect={gameCtx.pick}
            />

            {/* VS Divider */}
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold-5/50 to-gold-5/50" />
              <GiCrossedSwords className="text-gold-4 text-2xl" />
              <div className="flex-1 h-px bg-linear-to-l from-transparent via-gold-5/50 to-gold-5/50" />
            </div>

            {/* My Player Panel */}
            <PlayerPanel
              profile={myPlayer.profile}
              timer={myPlayer.timer}
              isPaused={gameCtx.turn === null}
              isActive={gameCtx.turn === myTeam}
              position="bottom"
              lpGain={myPlayer.gain}
              showSurrender={!gameCtx.finished}
              onSurrender={handleSurrender}
            />
          </div>

          {/* Right side - Chat */}
          {/* <div className="lg:w-96 h-100 lg:h-auto">
            <GameChat inputRef={chatInputRef} className="h-full" />
          </div> */}
        </div>

        {/* Leave button when game is finished */}
        {gameCtx.finished && (
          <div className="flex justify-center">
            <Button variant="secondary" size="lg" onClick={gameCtx.disconnect}>
              Leave Room
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
