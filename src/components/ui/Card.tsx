import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <section className={`card ${className}`}>{children}</section>;
}

interface StatCardProps {
  value: string;
  label: string;
  detail: string;
  tone?: "honey" | "green" | "blue" | "red";
}

export function StatCard({ value, label, detail, tone = "honey" }: StatCardProps) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label.slice(0, 1)}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}
