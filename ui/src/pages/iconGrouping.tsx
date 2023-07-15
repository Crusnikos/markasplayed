import { LookupData } from "../api/lookup";

type GroupedData = {
  groupName: string;
  groupedPlatforms: string;
};

export default function IconGrouping(
  platforms: LookupData[],
  getShortNames: boolean = false
): GroupedData[] {
  const groups = [...Array.from(new Set(platforms.map((ao) => ao.groupName)))];
  const groupedData = new Array<GroupedData>();

  function trimPlatformText(text: string): string {
    const init = text.indexOf("(");
    const fin = text.indexOf(")");
    return text.substring(init + 1, fin);
  }

  function createPlatformsList(group: string): string {
    const text = platforms
      .filter((platform) => platform.groupName === group)
      .map((g) => trimPlatformText(g.name))
      .join(", ");

    return "(" + text + ")";
  }

  groups.forEach((group) => {
    group !== "A" &&
      groupedData.push({
        groupName: group,
        groupedPlatforms: getShortNames ? createPlatformsList(group) : "",
      });
  });

  return groupedData;
}
