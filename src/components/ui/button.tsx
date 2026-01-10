import React from "react";

export const Button = ({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ${className}`} {...props} />
);
