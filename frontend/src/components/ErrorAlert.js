import React from "react";

export default function ErrorAlert({ message }) {
  return (
    <div className="alert alert-danger" role="alert">
      {message}
    </div>
  );
}
