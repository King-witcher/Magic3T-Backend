import { createFileRoute, Link } from '@tanstack/react-router'
import {
  GiCrossedSwords,
  GiLaurelsTrophy,
  GiPodium,
  GiSwordsPower,
  GiTargeted,
  GiTrophyCup,
} from 'react-icons/gi'
import { IoGameController, IoSchool, IoTime } from 'react-icons/io5'
import { Button } from '@/components/atoms'
import { Panel } from '@/components/ui/panel'
import { DemoBoard, ForkStrategyDemo, RANKS, RankCard, WinningCombinationCard } from './-components'

export const Route = createFileRoute('/tutorial')({
  component: TutorialPage,
})

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gold-4/30 pb-3 mb-6">
      <Icon className="text-gold-3 text-3xl shrink-0" />
      <h2 className="font-serif font-bold text-2xl md:text-3xl text-gold-2 uppercase tracking-wide">
        {children}
      </h2>
    </div>
  )
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif font-semibold text-xl text-gold-3 uppercase tracking-wide mb-3">
      {children}
    </h3>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-grey-1 leading-relaxed mb-4">{children}</p>
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-gold-2 font-semibold">{children}</span>
}

const WINNING_COMBINATIONS = [
  { numbers: [1, 5, 9], description: '1 + 5 + 9 = 15' },
  { numbers: [1, 6, 8], description: '1 + 6 + 8 = 15' },
  { numbers: [2, 4, 9], description: '2 + 4 + 9 = 15' },
  { numbers: [2, 5, 8], description: '2 + 5 + 8 = 15' },
  { numbers: [2, 6, 7], description: '2 + 6 + 7 = 15' },
  { numbers: [3, 4, 8], description: '3 + 4 + 8 = 15' },
  { numbers: [3, 5, 7], description: '3 + 5 + 7 = 15' },
  { numbers: [4, 5, 6], description: '4 + 5 + 6 = 15' },
]

function TutorialPage() {
  return (
    <div className="w-full min-h-full p-4 sm:p-8 flex justify-center items-start">
      <div className="w-full max-w-5xl">
        <Panel className="flex-col space-y-8">
          {/* Header */}
          <div className="text-center border-b-2 border-gold-5 pb-6">
            <h1 className="font-serif font-bold text-4xl sm:text-5xl text-gold-4 uppercase tracking-wide">
              How to Play
            </h1>
            <p className="text-grey-1 text-sm mt-2 uppercase tracking-wider">
              Master the Art of Magic3T
            </p>
          </div>

          {/* Introduction */}
          <section>
            <SectionTitle icon={IoSchool}>Welcome to Magic3T</SectionTitle>
            <Paragraph>
              <Highlight>Magic3T</Highlight> is a strategic turn-based game where two players both
              players take turns picking numbers from 1 to 9, and once a number is picked, it
              belongs exclusively to that player — your opponent cannot use it.
            </Paragraph>

            <Paragraph>
              Your goal is simple: collect as many numbers you need, but{' '}
              <Highlight>be the first player to have a trio of numbers that add up to 15</Highlight>
              .
            </Paragraph>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-6">
              <div className="flex flex-col items-center gap-3">
                <span className="text-gold-3 font-serif text-lg">Example Board</span>
                <DemoBoard
                  cells={[
                    { value: 1, state: 'available' },
                    { value: 2, state: 'highlight-ally' },
                    { value: 3, state: 'ally' },
                    { value: 4, state: 'highlight-ally' },
                    { value: 5, state: 'enemy' },
                    { value: 6, state: 'available' },
                    { value: 7, state: 'enemy' },
                    { value: 8, state: 'enemy' },
                    { value: 9, state: 'highlight-ally' },
                  ]}
                />
                <span className="text-grey-1 text-sm text-center max-w-48">
                  Blue wins with 2 + 4 + 9 = 15!
                </span>
              </div>

              <div className="flex flex-col gap-2 text-center md:text-left">
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded bg-blue-500/60 border border-blue-400" />
                  <span className="text-grey-1">Your numbers (Blue)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded bg-red-500/60 border border-red-400" />
                  <span className="text-grey-1">Opponent&apos;s numbers (Red)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded bg-hextech-black/40 border border-gold-5/50" />
                  <span className="text-grey-1">Available numbers</span>
                </div>
              </div>
            </div>
          </section>

          <Paragraph>
            Magic3T rewards players who can think ahead and anticipate their opponent&apos;s moves.
          </Paragraph>

          {/* Summarizing */}
          <section>
            <SectionTitle icon={IoGameController}>Summarizing</SectionTitle>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-grey-3/40 border border-gold-5/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center size-8 rounded-full bg-gold-5/30 text-gold-3 font-bold">
                    1
                  </span>
                  <span className="font-serif font-semibold text-gold-2">Take Turns</span>
                </div>
                <p className="text-grey-1 text-sm">
                  Players alternate picking one available number per turn. Once picked, a number
                  cannot be taken by either player again.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-grey-3/40 border border-gold-5/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center size-8 rounded-full bg-gold-5/30 text-gold-3 font-bold">
                    2
                  </span>
                  <span className="font-serif font-semibold text-gold-2">Build Your Set</span>
                </div>
                <p className="text-grey-1 text-sm">
                  Collect numbers strategically. You need exactly three numbers from your collection
                  that sum to exactly 15 to win.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-grey-3/40 border border-gold-5/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center size-8 rounded-full bg-gold-5/30 text-gold-3 font-bold">
                    3
                  </span>
                  <span className="font-serif font-semibold text-gold-2">Win or Block</span>
                </div>
                <p className="text-grey-1 text-sm">
                  Watch both your combinations AND your opponent&apos;s! Sometimes blocking their
                  win is more important than building your own.
                </p>
              </div>
            </div>
          </section>

          {/* Winning Combinations */}
          <section>
            <SectionTitle icon={GiLaurelsTrophy}>Winning Combinations</SectionTitle>
            <Paragraph>
              There are exactly <Highlight>8 different ways to win</Highlight> in Magic3T. Each
              winning combination consists of three numbers that add up to 15. Memorizing these
              combinations will give you a significant advantage:
            </Paragraph>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {WINNING_COMBINATIONS.map((combo) => (
                <WinningCombinationCard
                  key={combo.description}
                  numbers={combo.numbers}
                  description={combo.description}
                />
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
              <p className="text-blue-200 text-sm">
                <Highlight>Pro Tip:</Highlight> Notice that the number{' '}
                <span className="text-gold-2 font-bold">5</span> appears in 4 winning combinations —
                more than any other number! The numbers{' '}
                <span className="text-gold-2 font-bold">2, 4, 6, 8</span> (the even numbers except
                5) each appear in 3 combinations, while{' '}
                <span className="text-gold-2 font-bold">1, 3, 7, 9</span> appear in only 2 each.
              </p>
            </div>
          </section>

          {/* Strategy */}
          <section>
            <SectionTitle icon={GiSwordsPower}>Strategy Guide</SectionTitle>

            <div className="space-y-6">
              <div>
                <SubsectionTitle>The Dual Nature of Every Move</SubsectionTitle>
                <Paragraph>
                  Every number you pick serves two purposes: it brings you closer to a winning
                  combination AND prevents your opponent from using that number. This dual nature
                  makes every choice critical. Sometimes the best move isn&apos;t picking a number
                  you need — it&apos;s taking a number your opponent desperately needs.
                </Paragraph>
              </div>

              <div>
                <SubsectionTitle>Fork Strategies</SubsectionTitle>
                <Paragraph>
                  A <Highlight>fork</Highlight> is the most powerful tactical pattern in Magic3T. It
                  occurs when you position your numbers to threaten two different winning
                  combinations at once. Since your opponent can only block one threat per turn, a
                  successful fork guarantees victory!
                </Paragraph>

                <ForkStrategyDemo />
              </div>

              <div>
                <SubsectionTitle>The Perfect Balance</SubsectionTitle>
                <Paragraph>
                  Magic3T is a perfectly balanced game — there is{' '}
                  <Highlight>no guaranteed winning strategy</Highlight>. With optimal play from both
                  sides, every game would end in a draw. This means victory comes from outthinking
                  your opponent, not from knowing a &quot;secret trick.&quot;
                </Paragraph>
              </div>
            </div>
          </section>

          {/* Draws and Scoring */}
          <section>
            <SectionTitle icon={IoTime}>Draws & Time-Based Scoring</SectionTitle>

            <Paragraph>
              If all nine numbers are picked and neither player has achieved a winning combination,
              the game ends in a <Highlight>draw</Highlight>. However, draws in Magic3T are not
              equal!
            </Paragraph>

            <div className="p-4 rounded-lg bg-grey-3/40 border border-gold-5/20 my-4">
              <SubsectionTitle>Time-Based Scoring</SubsectionTitle>
              <Paragraph>
                When a draw occurs, each player receives a score between{' '}
                <span className="text-red-400 font-bold">-100</span> and{' '}
                <span className="text-blue-400 font-bold">+100</span> based on how much time they
                spent during the match. The player who used less time receives a positive score,
                while the slower player receives a negative score.
              </Paragraph>
              <p className="text-grey-1 text-sm">
                This system rewards efficient decision-making and prevents games from becoming
                tedious time-stalling contests.
              </p>
            </div>
          </section>

          {/* Ranking System */}
          <section>
            <SectionTitle icon={GiPodium}>Ranking System</SectionTitle>

            <Paragraph>
              Magic3T features a competitive ranking system to measure your skill against other
              players. As you win matches, you&apos;ll climb through the ranks and prove your
              mastery!
            </Paragraph>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              {RANKS.map((rank) => (
                <RankCard key={rank.name} rank={rank} />
              ))}
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 rounded-lg bg-grey-3/40 border border-gold-5/20">
                <SubsectionTitle>Divisions</SubsectionTitle>
                <p className="text-grey-1 text-sm">
                  The ranks Bronze, Silver, Gold, and Diamond are divided into{' '}
                  <Highlight>4 divisions each</Highlight> (IV, III, II, I). Division IV is the
                  starting point, and Division I is the highest within that rank. You progress by
                  earning League Points (LP) through victories.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-grey-3/40 border border-gold-5/20">
                <SubsectionTitle>Apex Tiers: Master & Challenger</SubsectionTitle>
                <p className="text-grey-1 text-sm">
                  Master and Challenger are the elite ranks with no divisions. In Master, you
                  compete on LP alone. <Highlight>Challenger is the ultimate rank</Highlight> — and
                  here&apos;s what makes it special:{' '}
                  <span className="text-gold-2 font-bold">only ONE player</span> can hold the
                  Challenger title at any time! To become Challenger, you must have more LP than the
                  current Challenger.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-4">
            <GiTrophyCup className="text-gold-4 text-5xl mx-auto mb-4" />
            <h2 className="font-serif font-bold text-2xl text-gold-2 uppercase tracking-wide mb-4">
              Ready to Play?
            </h2>
            <p className="text-grey-1 mb-6 max-w-md mx-auto">
              You&apos;ve learned the rules and strategies. Now it&apos;s time to put your skills to
              the test against real opponents or practice against bots!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/leaderboard">
                <Button variant="secondary" size="lg">
                  <GiPodium className="size-5" />
                  View Leaderboard
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg">
                  <GiCrossedSwords className="size-5" />
                  Start Playing
                </Button>
              </Link>
            </div>
          </section>
        </Panel>
      </div>
    </div>
  )
}
