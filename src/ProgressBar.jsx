// ProgressBar.jsx
import React from "react";
import "./Progressbar.css"; // importe o CSS específico aqui

export default function ProgressBar({ percentage, meta }) {
  const faltando = Math.max(0, meta - percentage);

  return (
    <div className="progressbar-container">
      <div className="progressbar-labels">
        <span>Meta: {meta}%</span>
        <span>Faltam: {faltando.toFixed(2)}%</span>
      </div>

      <div className="progressbar">
        <div
          className="progressbar-fill"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>

      <div className="progressbar-percentage">{percentage.toFixed(2)}%</div>
    </div>
  );
}
// ajuste forçado para redeploy final
