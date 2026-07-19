# Q-Learning Treasure Hunt

An interactive reinforcement learning demo built with vanilla HTML, CSS, and JavaScript.

The agent moves through a 5 × 5 GridWorld, avoids traps, and tries to reach the treasure. You can control the agent manually or train it with tabular Q-learning.

## Live demo

After enabling GitHub Pages, place your link here:

```text
https://YOUR-USERNAME.github.io/q-learning-treasure-hunt/
```

## Features

- Manual gameplay with buttons or arrow keys
- Tabular Q-learning
- Epsilon-greedy exploration
- Live reward and step tracking
- Learned policy visualization
- No frameworks or build tools
- Works entirely in the browser

## MDP formulation

- **State:** the agent's grid position
- **Actions:** up, down, left, right
- **Transition:** deterministic movement with boundary constraints
- **Rewards:**
  - Treasure: `+10`
  - Trap: `-10`
  - Ordinary move: `-0.1`
- **Discount factor:** `γ = 0.95`

The Q-learning update is

```text
Q(s, a) ← Q(s, a) + α[r + γ max Q(s', a') − Q(s, a)]
```

with learning rate `α = 0.15`.

## Run locally

Download or clone the repository, then open `index.html` in a browser.

```bash
git clone https://github.com/YOUR-USERNAME/q-learning-treasure-hunt.git
cd q-learning-treasure-hunt
open index.html
```

On Windows, double-click `index.html`.

## Deploy with GitHub Pages

1. Create a new public GitHub repository.
2. Upload all files from this project.
3. Open the repository's **Settings**.
4. Select **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose the `main` branch and the `/root` folder.
7. Save.

GitHub will publish the project as a website.

## Project structure

```text
q-learning-treasure-hunt/
├── index.html
├── style.css
├── script.js
├── README.md
├── LICENSE
└── .gitignore
```

## Possible extensions

- Add stochastic transitions
- Add walls and randomly generated maps
- Display the full Q-table
- Plot episode rewards
- Compare Q-learning with SARSA
- Allow users to change α, γ, and ε
- Add value iteration for comparison

## License

MIT License.
