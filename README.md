# FluxFlow

FluxFlow is an interactive social-conversation analysis dashboard built with React and D3. It connects topic similarity, conversation structure, activity over time, geography, and audience metrics through one shared topic selection.

The project began as coursework for CSE 578 — Data Visualization and was inspired by [Visual Analysis of Topic Competition on Social Media](https://ieeexplore.ieee.org/document/6876013). The current interface and demo dataset have been redesigned for clearer exploration and comparison.

## Demo dataset

The repository includes deterministic synthetic data intended for visualization and interaction testing—not research conclusions or production analytics.

- 10,023 unique posts
- 150 curated topics
- 8 topic categories
- January–December 2022 coverage
- 18 geographic locations
- Varied topic volume, sentiment, anomaly, audience, engagement, and posting patterns

The generator guarantees year-round coverage for every topic while adding distinct activity bursts, so the timeline contains both sustained conversation and realistic peaks.

## Linked views

### Topic Space

An overview of topic similarity. Nearby points use similar language.

- Horizontal position: people-led to systems-led conversation
- Vertical position: practical to speculative conversation
- Point size: post volume
- Point center: sentiment
- Outer ring: anomaly score

Selecting a point updates every dependent view and automatically opens its category in Cluster Map.

### Cluster Map

A performant SVG constellation that organizes all topics into eight broad categories. The overview shows the category structure; opening one category reveals its 18–19 topics without rendering the entire hierarchy at once.

- Node size: post volume
- Node center: sentiment
- Outer color: anomaly
- Curved links: category membership

Topic Space and Cluster Map share the same selection state.

### Conversation Timeline

A row-based beeswarm of selected posts across the full year.

- Horizontal position: post date
- Row: selected topic
- Bubble size: follower count
- Bubble color: sentiment
- Hover/focus: post details

Use **Replay** in the panel header to rebuild the beeswarm animation without changing the current selection or layout.

### Geography

An interactive globe and ranked location list show where posts in the current selection originated. Selecting a place smoothly centers the globe and opens its posts in pages of ten.

### Topic Profiles

A compact comparison of selected topics using per-post averages for audience, engagement, mentions, post length, sentiment, and anomaly.

## Interaction model

1. Select a topic in Topic Space or Cluster Map.
2. Add more topics to compare them.
3. Hover data points for details.
4. Inspect timing, locations, and topic profiles using the same shared selection.
5. Click an active topic again to remove it.

The interface supports keyboard focus, reduced-motion preferences, responsive layouts, and accessible labels for chart controls.

## Run locally

Requirements:

- A current Node.js LTS release
- npm

```bash
cd fluxflow-frontend-main
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) if it does not open automatically.

## Production build

```bash
cd fluxflow-frontend-main
npm run build
```

The optimized static output is written to `fluxflow-frontend-main/build`.

## Deploy to Cloudflare Workers

This repository is a monorepo, so configure the connected Cloudflare Worker to run from the frontend directory:

| Cloudflare setting | Value |
| --- | --- |
| Root directory | `fluxflow-frontend-main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`wrangler.jsonc` publishes the generated `build` directory as static assets, enables SPA fallback, and maps the Worker to `fluxflow.tinkerdock.dev` as a Custom Domain.

You can also deploy from an authenticated local environment:

```bash
cd fluxflow-frontend-main
npm run deploy
```

The `tinkerdock.dev` zone must be active in the same Cloudflare account used by the build. A Custom Domain lets Cloudflare create the required DNS record and TLS certificate; do not create a competing DNS record for `fluxflow.tinkerdock.dev`.

## Regenerate demo data

The checked-in JSON files are ready to use. To regenerate them deterministically:

```bash
cd fluxflow-frontend-main
node scripts/generate-demo-data.mjs
```

Generated files:

- `public/data/mds/mds_view_data.json`
- `public/data/cluster/cluster_view_data.json`
- `public/data/beeswarm/full_tweets_data.json`

## Technology

- React 18
- D3 7
- Redux Toolkit
- TopoJSON
- Create React App

## Project structure

```text
fluxflow/
├── fluxflow-frontend-main/
│   ├── public/data/           # visualization-ready JSON
│   ├── scripts/               # deterministic demo-data generator
│   └── src/                   # React views, D3 charts, Redux state, and styles
├── fluxflow-django-simple-scaper/
└── sample_data/
```

## Data notice

The bundled posts, engagement values, locations, sentiment values, and topic relationships are simulated. They are designed to demonstrate the interface and should not be presented as observed social-media behavior.
