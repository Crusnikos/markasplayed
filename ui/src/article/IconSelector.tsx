enum PlatformsList {
  Playstation = 1,
  NintendoSwitch = 2,
  Xbox = 3,
  Windows = 4,
  QuestionMark = 5,
}

type IconColor = "white" | "color";

export default function IconSelector(
  playedOn: PlatformsList,
  color: IconColor
): string {
  switch (playedOn) {
    case 1:
      return `/platform/${color}/icons8-playstation-96.png`;
    case 2:
      return `/platform/${color}/icons8-nintendo-switch-96.png`;
    case 3:
      return `/platform/${color}/icons8-xbox-96.png`;
    case 4:
      return `/platform/${color}/icons8-windows-10-96.png`;
    default:
      return `/platform/${color}/icons8-question-mark-96.png`;
  }
}
