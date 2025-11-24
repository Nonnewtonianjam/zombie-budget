---
inclusion:
  fileMatch:
    - "**/*game*"
    - "**/*zombie*"
    - "**/*visual*"
---
# Isometric Rendering Guidelines

## Sprite Specifications
- Zombie sprites: 128x256 pixels
- Pixels per unit: 128
- Pivot point: x=0.5, y=0.19
- Format: PNG with alpha channel
- Animation frames: Multiple sprites for walk cycles

## Isometric Grid
- 30-degree angle projection
- Tile-based movement for zombies
- Z-index layering for depth perception
- Base should appear behind zombies when appropriate

## Performance Considerations
- Use sprite batching to reduce draw calls
- Implement object pooling for zombies
- Cull off-screen objects
- Use requestAnimationFrame for smooth 60fps
- Optimize for mobile devices

## Asset Organization