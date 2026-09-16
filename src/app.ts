import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import httpStatus from "http-status";
import config from "./config";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", config.cors_url],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);


app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sushi Restaurant API</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          color: #f3f4f6;
        }
        .card {
          background: #161616;
          padding: 45px 35px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          text-align: center;
          max-width: 440px;
          width: 90%;
          border: 1px solid rgba(225, 29, 72, 0.2);
          position: relative;
          overflow: hidden;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #e11d48, #fb7185, #e11d48);
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }
        .icon-container {
          position: relative;
          width: 90px;
          height: 90px;
          margin: 0 auto 25px auto;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(225, 29, 72, 0.08);
          border-radius: 50%;
          border: 1px solid rgba(225, 29, 72, 0.2);
        }
        .sushi-icon {
          font-size: 42px;
          z-index: 2;
          animation: float 3s ease-in-out infinite;
        }
        h1 {
          font-family: 'Playfair Display', serif;
          color: #ffffff;
          font-size: 26px;
          font-weight: 600;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        p {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 6px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 13px;
          margin-top: 20px;
          gap: 8px;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background-color: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
          animation: pulse-dot 2s infinite;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon-container">
          <div class="sushi-icon">🍣</div>
        </div>
        <h1>Sushi Omakase API</h1>
        <p>Fresh rolls, seamless orders, and backend systems served fresh.</p>
        <div class="status-badge">
          <span class="status-dot"></span>
          Kitchen & Server Online
        </div>
      </div>
    </body>
    </html>
  `);
});

app.use(globalErrorHandler);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
