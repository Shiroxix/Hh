import React from "react";
import clsx from "clsx";

export function Card({ children, className }) {
  return <div className={clsx("card", className)}>{children}</div>;
}

export function Button({ children, className, ...props }) {
  return <button className={clsx("btn", className)} {...props}>{children}</button>;
}

export function Input({ className, ...props }) {
  return <input className={clsx("input", className)} {...props} />;
}

export function Pill({ children, className }) {
  return <span className={clsx("pill", className)}>{children}</span>;
}

export function Skeleton({ className }) {
  return <div className={clsx("skel", className)} />;
}
