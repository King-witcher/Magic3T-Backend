import {
  GiArtificialHive,
  GiArtificialIntelligence,
  GiBrain,
  GiCrossedSwords,
  GiGoose,
  GiRobotGrab,
} from 'react-icons/gi'
import { IoMdPeople } from 'react-icons/io'
import { Panel } from '@/components/atoms/panel'
import { useQueue } from '@/contexts/queue.context'
import { ServerStatus, useServiceStatus } from '@/contexts/service-status.context'
import { QueueMode } from '@/types/queue'
import { GameModeCard } from './game-mode-card'
import { ServerStatusBanner } from './server-status-banner'

export function LobbyTemplate() {
  const { queueUserCount } = useQueue()
  const { serverStatus } = useServiceStatus()

  const serverStatusMap = {
    [ServerStatus.On]: 'on' as const,
    [ServerStatus.Loading]: 'loading' as const,
    [ServerStatus.Off]: 'off' as const,
  }

  return (
    <div className="flex items-center justify-center min-h-full p-4 md:p-8">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <h1 className="font-serif font-bold text-6xl md:text-7xl text-gold-1 uppercase tracking-wider drop-shadow-[0_0_30px_rgba(200,170,110,0.6)]">
              Magic3T
            </h1>
            {/* Glow */}
            <div className="absolute inset-0 font-serif font-bold text-6xl md:text-7xl text-gold-3 uppercase tracking-wider opacity-20 blur-sm animate-pulse">
              Magic3T
            </div>
          </div>

          <p className="text-grey-1 text-md md:text-lg max-w-2xl mx-auto">
            Master the ancient art of numbers. Three numbers that sum to{' '}
            <span className="text-gold-3 font-bold">15</span> claim victory.
          </p>

          {/* Server Status */}
          <div className="max-w-2xl mx-auto">
            <ServerStatusBanner
              status={serverStatusMap[serverStatus]}
              playersOnline={queueUserCount.connected}
            />
          </div>
        </div>

        {/* Game Modes Section */}
        <Panel className="space-y-6">
          {/* VS Bots Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold-4/30 pb-3">
              <GiRobotGrab className="text-gold-3 text-3xl" />
              <h2 className="font-serif font-bold text-2xl text-gold-2 uppercase tracking-wide">
                Train Against Bots
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GameModeCard
                mode={QueueMode.Bot0}
                title="Recruit"
                description="Perfect for learning the basics. The bot makes random moves."
                icon={<GiGoose className="text-green-400" />}
                difficulty="easy"
                variant="bot"
              />

              <GameModeCard
                mode={QueueMode.Bot1}
                title="Soldier"
                description="A moderate challenge. The bot thinks a few moves ahead."
                icon={<GiArtificialIntelligence className="text-yellow-400" />}
                difficulty="medium"
                variant="bot"
              />

              <GameModeCard
                mode={QueueMode.Bot2}
                title="Elite"
                description="A faster opponent. The bot plans multiple moves ahead."
                icon={<GiBrain className="text-orange-400" />}
                difficulty="hard"
                variant="bot"
              />

              <GameModeCard
                mode={QueueMode.Bot3}
                title="Legend"
                description="The ultimate challenge. An invincible strategic mastermind."
                icon={<GiArtificialHive className="text-red-400" />}
                difficulty="unbeatable"
                variant="bot"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gold-5/30" />
            </div>
            <div className="relative flex justify-center">
              <GiCrossedSwords className="bg-grey-2 px-4 text-gold-4 text-5xl" />
            </div>
          </div>

          {/* VS Players Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold-4/30 pb-3">
              <IoMdPeople className="text-gold-3 text-3xl" />
              <h2 className="font-serif font-bold text-2xl text-gold-2 uppercase tracking-wide">
                Face Real Opponents
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <GameModeCard
                mode={QueueMode.Ranked}
                title="PvP Match"
                description="Compete against real players. Prove your mastery and climb the ranks!"
                icon={<IoMdPeople className="text-blue-400" />}
                playersInQueue={queueUserCount.ranked.queue}
                variant="pvp"
              />
            </div>
          </div>
        </Panel>

        {/* Footer tip */}
        <div className="text-center text-grey-1 text-sm">
          <p>Click on any game mode to join the queue</p>
        </div>
      </div>
    </div>
  )
}
