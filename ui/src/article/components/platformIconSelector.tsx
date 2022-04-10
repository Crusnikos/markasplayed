import { LookupData } from "../api/apiLookup";

export function whiteIconSelector(playedOn: LookupData): string {
  switch (playedOn.id) {
    case 1:
      return `/platform/white/icons8-playstation-96.png`;
    case 2:
      return `/platform/white/icons8-nintendo-switch-96.png`;
    case 3:
      return `/platform/white/icons8-xbox-96.png`;
    case 4:
      return `/platform/white/icons8-windows-10-96.png`;
    default:
      return `/platform/white/icons8-question-mark-96.png`;
  }
}

export function colorIconSelector(playedOn: LookupData): string {
  switch (playedOn.id) {
    case 1:
      return `/platform/color/icons8-playstation-96.png`;
    case 2:
      return `/platform/color/icons8-nintendo-switch-96.png`;
    case 3:
      return `/platform/color/icons8-xbox-96.png`;
    case 4:
      return `/platform/color/icons8-windows-10-96.png`;
    default:
      return `/platform/color/icons8-question-mark-96.png`;
  }
}
