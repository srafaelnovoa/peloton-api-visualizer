import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="container flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
