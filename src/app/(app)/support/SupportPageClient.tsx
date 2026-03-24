'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicButton } from '@/components/ui/PublicButton';

const faqs = [
  {
    question: 'What is Redefine Me?',
    answer:
      'Redefine Me is a discovery platform for university society events across the UK. We aggregate events from societies at universities nationwide so you can find what\'s happening near you — all in one place.',
  },
  {
    question: 'How do I register for an event?',
    answer:
      'We don\'t handle ticketing or registration directly. Each event links to the society\'s own registration page — whether that\'s Fixr, Eventbrite, a Google Form, or their own website. Just tap the event and follow the link.',
  },
  {
    question: 'Is Redefine Me free?',
    answer:
      'Yes, Redefine Me is completely free to use. Download the app or browse on the web at no cost.',
  },
  {
    question: 'Why can\'t I find my university?',
    answer:
      'We\'re still growing our network of universities. If your university isn\'t listed yet, email us at admin@redefine-me.com and we\'ll look into adding it.',
  },
  {
    question: 'How do I list my society\'s events?',
    answer:
      'Get in touch with us at admin@redefine-me.com with your society name, university, and social media or website links. We\'ll be in touch about getting your events on the platform.',
  },
  {
    question: 'The event details are wrong — what should I do?',
    answer:
      'Event details come directly from the society. If something looks wrong, use the contact form below or email admin@redefine-me.com and we\'ll get it corrected as quickly as possible.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'You can delete your account from within the app under Settings → Delete Account. If you need further help, contact us at admin@redefine-me.com.',
  },
];

const subjectOptions = [
  'General Enquiry',
  'Report an Issue',
  'Society / Event Listing',
  'Delete Account Request',
  'Other',
];

export default function SupportPageClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: subjectOptions[0],
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`;
    const mailto = `mailto:admin@redefine-me.com?subject=${encodeURIComponent(
      `[Support] ${form.subject}`
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <div className="py-12 px-[18px]">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/discover"
          className="inline-flex items-center text-sm text-subtle hover:text-brand mb-6 transition-colors"
        >
          ← Back to Discover
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text mb-2">Support</h1>
          <p className="text-subtle">
            Need help? Check the FAQs below or get in touch — we&apos;re happy to help.
          </p>
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text mb-4 pb-2 border-b border-border">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-text">{faq.question}</span>
                  <span className="text-subtle ml-4 flex-shrink-0 text-lg leading-none">
                    {openIndex === i ? '−' : '+'}
                  </span>
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5 text-subtle leading-relaxed border-t border-border pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-text mb-4 pb-2 border-b border-border">
            Contact Us
          </h2>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-border px-6 py-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-bg border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-subtle"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-subtle mb-1">Email us directly at</p>
              <a
                href="mailto:admin@redefine-me.com"
                className="text-brand hover:text-brand-hover font-medium transition-colors"
              >
                admin@redefine-me.com
              </a>
              <p className="text-sm text-subtle mt-1">
                We aim to respond within 1–2 business days.
              </p>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section>
          <h2 className="text-xl font-semibold text-text mb-4 pb-2 border-b border-border">
            Send a Message
          </h2>
          {submitted ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-border px-8 py-10 text-center">
              <p className="text-lg font-semibold text-text mb-2">Your email client should have opened.</p>
              <p className="text-subtle text-sm">
                If it didn&apos;t,{' '}
                <a
                  href="mailto:admin@redefine-me.com"
                  className="text-brand hover:text-brand-hover underline"
                >
                  click here to email us directly
                </a>
                .
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-subtle hover:text-text transition-colors underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-border px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5" htmlFor="subject">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                  >
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition resize-none"
                  />
                </div>

                <PublicButton type="submit" className="w-full sm:w-auto px-8">
                  Send Message
                </PublicButton>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
