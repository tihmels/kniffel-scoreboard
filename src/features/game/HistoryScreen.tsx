import { useState } from 'react'
import {
  fromGameRecord,
  grandTotal,
  standings,
  winners,
} from '../../domain/game'
import type { GameRecord } from '../../domain/game'
import { loadHistory } from '../../services/storage'
import { AppBar } from './AppBar'
import { OverviewScreen } from './OverviewScreen'
import styles from './HistoryScreen.module.css'

const PLAYED_ON = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function playedOn(record: GameRecord): string {
  return PLAYED_ON.format(new Date(record.finishedAt))
}

interface HistoryScreenProps {
  onClose: () => void
}

/**
 * Games played to the end, newest first. Read-only by design: an archived card
 * is a result, and the live game is the only thing still worth editing.
 */
export function HistoryScreen({ onClose }: HistoryScreenProps) {
  const [records] = useState(loadHistory)
  const [selected, setSelected] = useState<GameRecord | null>(null)

  // A past game is the same 13 × N sheet, so it reuses the overview screen
  // rather than growing a second grid that could drift from it.
  if (selected) {
    return (
      <OverviewScreen
        state={fromGameRecord(selected)}
        title={playedOn(selected)}
        onClose={() => setSelected(null)}
      />
    )
  }

  return (
    <div className={styles.screen}>
      <AppBar
        title="Letzte Spiele"
        actions={
          <button type="button" className={styles.done} onClick={onClose}>
            Fertig
          </button>
        }
      />

      <div className={styles.body}>
        {records.length === 0 ? (
          <p className={styles.empty}>
            Noch keine beendeten Spiele. Eine Partie zählt, sobald die letzte
            Kategorie eingetragen ist.
          </p>
        ) : (
          <ul className={styles.list}>
            {records.map((record) => {
              const state = fromGameRecord(record)
              const won = winners(state)
              const champion = won.length === 1 ? won[0] : undefined

              return (
                <li key={record.id}>
                  <button
                    type="button"
                    className={styles.entry}
                    onClick={() => setSelected(record)}
                  >
                    <span className={styles.head}>
                      <span className={styles.date}>{playedOn(record)}</span>
                      <span className={styles.outcome}>
                        {champion
                          ? `${champion.name} gewinnt`
                          : 'Unentschieden'}
                      </span>
                    </span>

                    <span className={styles.totals}>
                      {standings(state).map((player) => (
                        <span key={player.id} className={styles.player}>
                          {player.name}
                          <span className={styles.score}>
                            {grandTotal(state.scores[player.id] ?? {})}
                          </span>
                        </span>
                      ))}
                    </span>

                    <span className={styles.chevron} aria-hidden="true">
                      ›
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
