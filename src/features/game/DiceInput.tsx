import type { DiceRoll, DieValue } from '../../domain/scoring'
import styles from './DiceInput.module.css'

const FACES: DieValue[] = [1, 2, 3, 4, 5, 6]

interface DiceInputProps {
  dice: DiceRoll
  onChange: (dice: DiceRoll) => void
}

export function DiceInput({ dice, onChange }: DiceInputProps) {
  function setDie(index: number, value: DieValue) {
    const next = [...dice] as [DieValue, DieValue, DieValue, DieValue, DieValue]
    next[index] = value
    onChange(next)
  }

  return (
    <div className={styles.row} role="group" aria-label="Dice you rolled">
      {dice.map((die, index) => (
        <select
          key={index}
          className={styles.die}
          aria-label={`Die ${index + 1}`}
          value={die}
          onChange={(event) =>
            setDie(index, Number(event.target.value) as DieValue)
          }
        >
          {FACES.map((face) => (
            <option key={face} value={face}>
              {face}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
