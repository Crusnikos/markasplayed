export default function formatedDateDisplay(date: string): string {
  const articleDate = new Date(date);

  return articleDate.toLocaleDateString();
}
