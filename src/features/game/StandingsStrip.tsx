import {
  bonusRemaining,
  bonusState,
  grandTotal,
  upperSubtotal,
} from '../../domain/game'
import type { GameState, Player, ScoreCard } from '../../domain/game'
import { UPPER_BONUS_THRESHOLD } from '../../domain/scoring'
import styles from './StandingsStrip.module.css'

const BONUS_LABELS = {
  undetermined: `noch ${UPPER_BONUS_THRESHOLD}`,
  reachable: '',
  secured: '+35 sicher',
  missed: 'verpasst',
} as const

interface BonusMeterProps {
  card: ScoreCard
  /** Whoever is about to play is the one the bonus decision matters to. */
  emphasised: boolean
}

/**
 * How close a player is to the +35 bonus. Always present so it can be trusted,
 * but only coloured up once it has something to say.
 */
function BonusMeter({ card, emphasised }: BonusMeterProps) {
  const state = bonusState(card)
  const label =
    state === 'reachable' ? `noch ${bonusRemaining(card)}` : BONUS_LABELS[state]
  const progress = Math.min(
    100,
    (upperSubtotal(card) / UPPER_BONUS_THRESHOLD) * 100,
  )
  const tone = state === 'reachable' && emphasised ? 'live' : state

  return (
    <>
      <div className={`${styles.track} ${styles[tone]}`}>
        {state !== 'secured' && state !== 'missed' && (
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        )}
      </div>
      <div className={`${styles.bonus} ${styles[tone]}`}>{label}</div>
    </>
  )
}

interface StandingsStripProps {
  state: GameState
  leaderId: string | undefined
  onSelect: (index: number) => void
}

/** Live totals for everyone, in turn order. The reason not to use paper. */
export function StandingsStrip({
  state,
  leaderId,
  onSelect,
}: StandingsStripProps) {
  return (
    <div className={styles.strip}>
      {state.players.map((player: Player, index) => {
        const card = state.scores[player.id] ?? {}
        const active = index === state.activePlayerIndex
        return (
          <button
            key={player.id}
            type="button"
            className={`${styles.chip} ${active ? styles.active : ''}`}
            aria-current={active ? 'true' : undefined}
            aria-label={`${player.name}, ${grandTotal(card)} Punkte`}
            onClick={() => onSelect(index)}
          >
            <span className={styles.name}>
              {player.name}
              {player.id === leaderId && (
                <span className={styles.crown} aria-hidden="true">
                  {' '}
                  ●
                </span>
              )}
            </span>
            <span className={styles.total}>{grandTotal(card)}</span>
            <BonusMeter card={card} emphasised={active} />
          </button>
        )
      })}
    </div>
  )
}
