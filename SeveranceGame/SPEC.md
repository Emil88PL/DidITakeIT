# Severance-Inspired Number Game

## Project Overview
- **Type**: Browser-based interactive game
- **Core functionality**: Numbers appear on screen, shaking numbers must be clicked and are collected in a box
- **Target users**: Fans of the Severance TV show

## UI/UX Specification

### Layout Structure
- Full viewport dark workspace aesthetic
- Main area: 6x4 grid of numbered cells
- Side panel: "Box" showing collected numbers
- Score display at top

### Visual Design
- **Color palette**:
  - Background: #0a0a0a (near black)
  - Cell background: #1a1a1a
  - Cell border: #2a2a2a
  - Text/numbers: #e0e0e0
  - Shaking number: #ff6b35 (warm orange glow)
  - Box highlight: #00ff88 (severance green)
  - Score text: #888888
- **Typography**:
  - Font: "Courier New", monospace (terminal aesthetic)
  - Number size: 28px
- **Effects**:
  - Shaking animation: rapid random translation (2-3px)
  - Click success: brief green flash
  - Wrong click: brief red flash
  - Box fill animation: numbers slide in

### Components
- NumberCell: displays single digit (0-9)
  - States: idle, shaking (highlighted), clicked
- Box Panel: stores clicked numbers in a row
- Score counter: tracks successful captures
- Timer: optional round timer

## Functionality Specification

### Core Features
1. **Random number generation**: 24 cells with random single digits (0-9)
2. **Shaking mechanic**: 3-5 random numbers shake at any given time
3. **Click detection**: 
   - Clicking shaking number = success → number moves to box
   - Clicking non-shaking number = failure → brief error feedback
4. **Box storage**: Clicked numbers accumulate in the box panel
5. **New round**: After all shaking numbers collected, generate new set
6. **Score tracking**: +10 per correct capture, -5 per miss

### User Interactions
- Hover: cell slightly brightens
- Click shaking: success animation, number added to box
- Click non-shaking: error shake, score penalty

### Edge Cases
- Prevent double-clicking same shaking number
- Handle rapid clicks gracefully

## Acceptance Criteria
- [ ] 24 numbers displayed in grid
- [ ] 3-5 numbers visibly shake at all times
- [ ] Clicking shaking number adds to box with animation
- [ ] Clicking non-shaking shows error feedback
- [ ] Score updates correctly
- [ ] New numbers generate when round completes
- [ ] Dark, terminal-like aesthetic maintained