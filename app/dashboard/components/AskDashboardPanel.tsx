"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useState } from "react";
import { answerDashboardQuestion } from "../qa";
import type { DashboardResponse } from "../types";

type AskDashboardPanelProps = {
  dashboard: DashboardResponse;
};

type Message = {
  role: "user" | "assistant";
  text: string;
};

const quickQuestions = [
  "Will it rain this evening?",
  "Is it a good day for cycling?",
  "How windy will it be tomorrow?",
  "Weekend outlook",
];

export function AskDashboardPanel({ dashboard }: AskDashboardPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "assistant", text: answerDashboardQuestion(dashboard, trimmed) },
    ]);
    setInput("");
  }

  return (
    <section className="dashboard-card ask-panel" aria-label="Ask the dashboard">
      <div className="ask-heading">
        <img src="/dashboard-assets/icon-spark.png" alt="" />
        <h2>Ask the dashboard</h2>
      </div>
      {messages.length > 0 ? (
        <div className="qa-history">
          {messages.map((message, index) => (
            <article className={`qa-message ${message.role}`} key={`${message.role}-${index}-${message.text}`}>
              {message.role === "assistant" ? <strong>AI</strong> : null}
              <p>{message.text}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="quick-questions">
          {quickQuestions.map((question) => (
            <button key={question} type="button" onClick={() => submitQuestion(question)}>
              · {question}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitQuestion(input);
        }}
        className="ask-form"
      >
        <label className="sr-only" htmlFor="dashboard-question">
          Ask anything about the weather in {dashboard.city.name}
        </label>
        <input
          id="dashboard-question"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`Ask anything about the weather in ${dashboard.city.name}...`}
        />
        <button type="submit" aria-label="Send question">
          ↗
        </button>
      </form>
    </section>
  );
}
