export function addCookie(props: { name: string; value: string }): void {
  document.cookie = `${props.name}=${props.value}`;
}

export function getCookieValue(props: { name: string }): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(props.name))
    ?.split("=")[1];
}

export function deleteCookie(props: { name: string }): void {
  document.cookie = `${props.name}= ; max-age = 0}`;
}
