type IconColor = "white" | "color";

export default function IconSelector(
  playedOn: string,
  color: IconColor
): string {
  switch (playedOn) {
    case "P":
      return `/platform/${color}/icons8-playstation-96.png`;
    case "S":
      return `/platform/${color}/icons8-nintendo-switch-96.png`;
    case "X":
      return `/platform/${color}/icons8-xbox-96.png`;
    case "C":
      return `/platform/${color}/icons8-windows-10-96.png`;
    case "N":
      return `/platform/${color}/icons8-nintendo-96.png`;
    case "U":
      return `/platform/${color}/icons8-nintendo-wii-u-96.png`;
    case "G":
      return `/platform/${color}/icons8-visual-game-boy-96.png`;
    case "W":
      return `/platform/${color}/icons8-wii-96.png`;
    default:
      return `/platform/${color}/icons8-question-mark-96.png`;
  }
}
