"use client";

import React, { useState } from "react";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-28">
      <div className="w-full max-w-xl bg-card border border-border p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center uppercase">
          Share Your Feedback
        </h1>
        {submitted && (
          <div className="mb-6 p-4 rounded-xl border-4 border-green-500 
          bg-green-500/10 text-green-600 dark:text-green-400 
          font-bold text-center uppercase animate-fade-in">
            Thank You! Your Feedback Has Been Submitted.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Your Name (Optional)"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email (Optional)"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            className="w-full py-5 text-xl font-black uppercase tracking-wide
            rounded-2xl border-4 border-primary 
            bg-primary text-primary-foreground
            hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)]
            active:translate-y-0 active:shadow-none
            transition-all duration-300"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
