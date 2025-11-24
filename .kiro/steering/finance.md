---
inclusion:
  fileMatch:
    - "**/*transaction*"
    - "**/*budget*"
    - "**/*finance*"
---
# Finance Logic Rules

## Transaction Categorization
Bad spending habits (spawn zombies):
- Fast food & dining out
- Unnecessary subscriptions
- Impulse purchases
- Luxury items beyond budget

Good spending habits (strengthen blockades):
- Savings deposits
- Debt payments
- Budgeted purchases
- Emergency fund contributions

## Zombie Generation Rules
- Each bad transaction spawns 1 zombie
- Zombie type determined by transaction category
- Zombie strength = transaction amount / 10
- Zombies target specific blockades based on category

## Blockade System
Each blockade has:
- Health points (based on budget allocation)
- Defense category (Entertainment, Food, Shopping, Subscriptions)
- Visual degradation as health decreases
- Regeneration from good spending in category

## Monthly Playback Calculation
- Chronologically order all transactions
- Calculate time intervals between transactions
- Scale to 30-45 second total duration
- Generate zombie movements and attacks
- Show blockade damage/healing