import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground({ theme }) {
  const particlesInit = async (main) => loadFull(main);
  const color = theme === "dark" ? "#f4efe6" : "#2c2a28";

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: "transparent" },
        particles: {
          color: { value: color },
          links: { enable: true, color, distance: 160, opacity: 0.18 },
          move: { enable: true, speed: 0.55 },
          number: { value: 12 },
          opacity: { value: 0.25 },
          size: { value: 2 },
        },
      }}
    />
  );
}