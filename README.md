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

Outlast eight bot rivals. Stay inside the purple storm circle, collect glowing supplies, and use buildings or placed walls for cover. The storm starts closing after 40 seconds. Eliminate or outlast every rival to win.

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Mouse | Look and aim |
| Left click / hold | Fire rifle |
| Shift | Sprint |
| Space | Jump |
| R | Reload |
| Q | Place a wooden wall (8 per match) |
| 2 | Heal with a medkit (2.4 seconds; damage interrupts) |
| Esc | Pause and release the mouse |

Walk over pickups to collect ammo, shields, and medkits. Sound is optional and starts muted. The pause and result screens let you restart a match.

## Scope

This is a single-player prototype with local bots, one island, one rifle, and basic cover building. Multiplayer, matchmaking, interiors, mobile controls, and saved progression are not implemented.

## Publish with GitHub Pages

In the GitHub repository, open **Settings → Pages**, then select **GitHub Actions** as the build source. The **Publish Stormfall** workflow builds and publishes the game after each push to `main`; it can also be run manually from the Actions tab. No paid hosting or additional application secrets are required for a public repository. GitHub Pages availability for private repositories depends on the account plan.

Vite uses relative asset URLs so the game also works under the repository's `/fortnight/` subpath.

## Validation

Production build and Chromium/WebGL smoke checks cover game startup, pointer lock, ammo consumption, reload, wall placement, pause, and match restart. Combat checks exercise raycast hits, supplies, storm damage, and win/loss screens. Browser checks use software WebGL; performance depends on the device GPU.
