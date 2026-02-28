export async function delay(milliseconds = 650) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
