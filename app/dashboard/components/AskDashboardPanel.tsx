"use client";

import React from "react";
import { useState } from "react";
import { answerDashboardQuestion } from "../qa";
import type { DashboardResponse } from "../types";

type AskDashboardPanelProps = {
  dashboard: DashboardResponse;
};

type Message = {
  question: string;
  answer: string;
};

const quickQuestions = [
  "Will it rain this evening?",
  "Is it a good day for cycling?",
  "How windy is it today?",
  "What should I know?",
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
      { question: trimmed, answer: answerDashboardQuestion(dashboard, trimmed) },
    ]);
    setInput("");
  }

  return (
    <section className="dashboard-card ask-panel" aria-label="Ask the dashboard">
      <h2>Ask the dashboard</h2>
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
          →
        </button>
      </form>
      <div className="quick-questions">
        {quickQuestions.map((question) => (
          <button key={question} type="button" onClick={() => submitQuestion(question)}>
            {question}
          </button>
        ))}
      </div>
      {messages.length > 0 ? (
        <div className="qa-history">
          {messages.map((message) => (
            <article key={`${message.question}-${message.answer}`}>
              <strong>{message.question}</strong>
              <p>{message.answer}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
