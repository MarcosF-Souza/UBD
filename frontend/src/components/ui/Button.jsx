import React from "react";

export default function Button({ style, title, onClick }) {
  return (
    <button className={`cursor-pointer ${style}`} onClick={onClick}>
      {title}
    </button>
  );
}
