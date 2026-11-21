# Stormfall

An original, Fortnite-inspired browser battle arena built with Three.js. All models are created procedurally: the island, village, watchtower, trees, characters, weapons, and buildable cover. No external game assets or services are required.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev -- --port 3000
```

Open the development server in a desktop browser with WebGL, a keyboard, and a mouse. Click **Play now** and allow mouse capture. `npm run build` creates a production bundle in `dist`; `npm run preview` serves that bundle.

## Play

Outlast eight bot rivals in a free for all: four rookies, three regulars, and one veteran. Rookies react slowly, miss more shots, move more slowly, and pause longer between shots; veterans are more capable. Difficulty applies equally when fighting the player or other bots. Rivals select nearby visible opponents, fight each other, and retaliate against whoever shoots them. Bot eliminations update the alive count and kill feed without giving the player kill credit. Stay inside the purple storm circle, collect glowing supplies, and use buildings or placed walls for cover. The storm starts closing after 40 seconds. Eliminate or outlast every rival to win.

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Mouse | Look and aim |
| Left click / hold | Fire equipped weapon |
| Right mouse button / hold | Aim with reduced spread and a closer camera |
| 1 / 2 / 3 | Equip M4A1 / AK-47 / pump shotgun |
| Shift | Sprint |
| Space | Jump |
| R | Reload |
| Q | Place a wooden wall (8 per match) |
| H | Heal with a medkit (2.4 seconds; damage interrupts) |
| Esc | Pause and release the mouse |

Walk over pickups to collect ammo, shields, and medkits. Sound is optional and starts muted. The pause and result screens let you restart a match.

The three original weapon models have distinct stocks, grips, magazines, barrels and sights. The M4A1 is a fast, accurate carbine; the AK-47 trades accuracy and fire rate for damage; the pump shotgun fires eight pellets with strong range falloff. Each weapon has its own magazine and reserve ammo. Switching cancels reloading and healing. Recoil, muzzle flashes, reload motion and pump action animate during combat. Bots use the same raycast damage and cover rules as the player.

## Scope

This is a single-player prototype with local bots, one island, three weapons, and basic cover building. Multiplayer, matchmaking, interiors, mobile controls, and saved progression are not implemented.

## Publish with GitHub Pages

In the GitHub repository, open **Settings → Pages**, then select **GitHub Actions** as the build source. The **Publish Stormfall** workflow builds and publishes the game after each push to `main`; it can also be run manually from the Actions tab. No paid hosting or additional application secrets are required for a public repository. GitHub Pages availability for private repositories depends on the account plan.

Vite uses relative asset URLs so the game also works under the repository's `/fortnight/` subpath.

## Validation

Run `npm test` for target-selection and weapon-spread regression tests. `npm run build` verifies the production bundle. Chromium/WebGL checks also exercise switching weapons, separate magazines, reload cancellation, aiming, bot-versus-bot shooting and eliminations, cover, kill credit, healing, and match outcomes. Browser checks use software WebGL; performance depends on the device GPU.
