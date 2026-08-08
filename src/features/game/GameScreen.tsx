import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import {
  TOTAL_ROUNDS,
  bonusRemaining,
  bonusState,
  countSecuringBonus,
  currentRound,
  leader,
  lowerSubtotal,
  upperSubtotal,
} from '../../domain/game'
import type { GameAction, GameState, ScoreEntry } from '../../domain/game'
import {
  LOWER_CATEGORIES,
  UPPER_BONUS,
  UPPER_CATEGORIES,
  inputKind,
} from '../../domain/scoring'
import type { ScoreCategory, UpperCategory } from '../../domain/scoring'
import { AppBar } from './AppBar'
import { CategoryRow } from './CategoryRow'
import { CATEGORY_LABELS } from './labels'
import { OverviewScreen } from './OverviewScreen'
import { SectionCard } from './SectionCard'
import { StandingsStrip } from './StandingsStrip'
import { SumSheet } from './SumSheet'
import { TurnHeader } from './TurnHeader'
import { UndoToast } from './UndoToast'
import styles from './GameScreen.module.css'

interface GameScreenProps {
  state: GameState
  dispatch: Dispatch<GameAction>
}

function upperSummary(
  subtotal: number,
  state: ReturnType<typeof bonusState>,
  remaining: number,
) {
  if (state === 'secured') return `${subtotal} · +${UPPER_BONUS} gesichert`
  if (state === 'missed') return `${subtotal} · Bonus verpasst`
  return `${subtotal} · noch ${remaining} zum Bonus`
}

export function GameScreen({ state, dispatch }: GameScreenProps) {
  const [editing, setEditing] = useState<ScoreCategory | null>(null)
  const [sheetCategory, setSheetCategory] = useState<ScoreCategory | null>(null)
  const [showOverview, setShowOverview] = useState(false)
  const [dismissed, setDismissed] = useState<ScoreEntry | null>(null)

  const player = state.players[state.activePlayerIndex]
  const card = player ? (state.scores[player.id] ?? {}) : {}

  // After an entry the turn moves on, but the eye is still at the row that was
  // just filled — well below the name of whoever is up next.
  const previousPlayerIndex = useRef(state.activePlayerIndex)
  useEffect(() => {
    if (previousPlayerIndex.current === state.activePlayerIndex) return
    previousPlayerIndex.current = state.activePlayerIndex
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.activePlayerIndex])

  if (showOverview) {
    return (
      <OverviewScreen state={state} onClose={() => setShowOverview(false)} />
    )
  }

  if (!player) return null

  function moveActive(offset: number) {
    const count = state.players.length
    dispatch({
      type: 'setActivePlayer',
      index: (state.activePlayerIndex + offset + count) % count,
    })
    setEditing(null)
  }

  function record(category: ScoreCategory, value: number) {
    if (!player) return
    dispatch({ type: 'recordScore', playerId: player.id, category, value })
    setEditing(null)
    setSheetCategory(null)
  }

  function clear(category: ScoreCategory) {
    if (!player) return
    dispatch({ type: 'clearScore', playerId: player.id, category })
    setEditing(null)
  }

  function openRow(category: ScoreCategory) {
    // A free-sum category has nothing to show inline, so tapping it goes
    // straight to the sheet rather than expanding into a dead row.
    if (inputKind(category) === 'sum' && card[category] === undefined) {
      setSheetCategory(category)
      return
    }
    setEditing(category)
  }

  const upper = upperSubtotal(card)
  const bonus = bonusState(card)
  const toast =
    state.lastEntry && state.lastEntry !== dismissed ? state.lastEntry : null
  const toastPlayer = toast
    ? state.players.find((p) => p.id === toast.playerId)
    : undefined

  function renderRow(category: ScoreCategory) {
    const securing =
      inputKind(category) === 'count'
        ? countSecuringBonus(card, category as UpperCategory)
        : undefined

    return (
      <CategoryRow
        key={category}
        category={category}
        value={card[category]}
        editing={editing === category}
        hint={
          securing !== undefined
            ? `${securing} ${CATEGORY_LABELS[category]} sichern den Bonus`
            : undefined
        }
        onPick={(value) => record(category, value)}
        onOpenSheet={() => setSheetCategory(category)}
        onStartEdit={() => openRow(category)}
        onCancelEdit={() => setEditing(null)}
        onClear={() => clear(category)}
      />
    )
  }

  return (
    <div className={styles.screen}>
      <AppBar
        title={`Runde ${currentRound(state)}`}
        detail={`von ${TOTAL_ROUNDS}`}
        onUndo={state.lastEntry ? () => dispatch({ type: 'undo' }) : undefined}
      />

      <StandingsStrip
        state={state}
        leaderId={leader(state)?.id}
        onSelect={(index) => {
          dispatch({ type: 'setActivePlayer', index })
          setEditing(null)
        }}
      />

      <TurnHeader
        key={player.id}
        name={player.name}
        onPrevious={() => moveActive(-1)}
        onNext={() => moveActive(1)}
      />

      <SectionCard
        title="Oberer Teil"
        summary={upperSummary(upper, bonus, bonusRemaining(card))}
        emphasis={bonus === 'reachable' || bonus === 'secured'}
      >
        {UPPER_CATEGORIES.map(renderRow)}
      </SectionCard>

      <SectionCard title="Unterer Teil" summary={String(lowerSubtotal(card))}>
        {LOWER_CATEGORIES.map(renderRow)}
      </SectionCard>

      {toast && toastPlayer && (
        <UndoToast
          entry={toast}
          playerName={toastPlayer.name}
          onUndo={() => dispatch({ type: 'undo' })}
          onDismiss={() => setDismissed(toast)}
        />
      )}

      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.secondary}
          disabled={!state.lastEntry}
          onClick={() => dispatch({ type: 'undo' })}
        >
          ↺ Rückgängig
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => setShowOverview(true)}
        >
          Gesamtübersicht
        </button>
      </div>

      {sheetCategory && (
        <SumSheet
          category={sheetCategory}
          playerName={player.name}
          current={card[sheetCategory]}
          onPick={(value) => record(sheetCategory, value)}
          onClose={() => setSheetCategory(null)}
        />
      )}
    </div>
  )
}
