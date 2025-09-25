# Apex Trader

A brutalist-inspired stock trading simulation game for learning and competition.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/browser-vm/apex-trader)

## 📈 About The Project

Apex Trader is a visually striking stock trading simulator designed with a raw, brutalist aesthetic. It provides a high-fidelity experience by using real-world stock data, allowing users to practice trading strategies without financial risk.

The core of the application is a single-page dashboard featuring a stock search, interactive charts, an order execution panel, and a live portfolio tracker. The design emphasizes clarity and immediate feedback, using bold typography, a high-contrast color scheme, and snappy animations to make complex financial data engaging and accessible.

## ✨ Key Features

-   **Brutalist UI:** A raw, high-contrast, and visually striking user interface.
-   **Trading Dashboard:** A single-page interface for all trading activities.
-   **Stock Search:** Find and select real-world stocks to trade.
-   **Interactive Charting:** Visualize stock performance with clean, responsive charts.
-   **Market Orders:** Execute buy and sell orders at the current market price.
-   **Live Portfolio:** Track your virtual capital, holdings, and performance in real-time.

## 🛠️ Technology Stack

This project is built with a modern, edge-native stack:

-   **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Recharts](https://recharts.org/), [Framer Motion](https://www.framer.com/motion/), [Zustand](https://zustand-demo.pmnd.rs/)
-   **Backend:** [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)
-   **Storage:** [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/apex_trader.git
    cd apex_trader
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

## 💻 Development

To start the local development server, which runs both the Vite frontend and the Wrangler dev server for the Worker backend, run:

```sh
bun run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

## ☁️ Deployment

This project is designed for seamless deployment to the Cloudflare network.

1.  **Log in to Wrangler:**
    Authenticate with your Cloudflare account.
    ```sh
    npx wrangler login
    ```

2.  **Deploy the application:**
    This command will build the frontend application and deploy it along with the Hono worker to Cloudflare.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/browser-vm/apex-trader)

## 📂 Project Structure

-   `src/`: Contains the frontend React application, including pages, components, and state management.
-   `worker/`: Contains the Hono backend API, entities, and routes running on Cloudflare Workers.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend.
-   `public/`: Static assets for the frontend.
-   `wrangler.jsonc`: Configuration file for Cloudflare Workers.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.