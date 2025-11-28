import React from "react";

export default function CustomInput({ hint, className, fontSize = "text-base", ...props }) {
  return (
    <input
      placeholder={hint}
      className={`border-b border-gray-400 text-gray-900 p-2 outline-none ${fontSize} ${className}`}
      {...props}
    />
  );
}