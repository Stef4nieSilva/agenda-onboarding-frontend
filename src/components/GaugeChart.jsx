// GaugeChart.jsx
import "./GaugeChart.css";

export default function GaugeChart({ status, valor, cor }) {
  const angulo = (valor / 100) * 180;

  return (
    <div className="gauge-card">
      <div className="gauge-semi">
        <div
          className="gauge-fill"
          style={{
            transform: `rotate(${angulo}deg)`,
            backgroundColor: cor,
          }}
        ></div>
        <div className="gauge-cover"></div>
      </div>
      <div className="gauge-porcentagem">{valor}%</div>
      <div className="gauge-titulo">{status}</div>
    </div>
  );
}
