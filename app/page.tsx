import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export default async function Home() {
  const html = await readFile(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

  return (
    <iframe
      title="Dutch Weather Intelligence"
      srcDoc={html}
      style={{
        display: "block",
        width: "100%",
        minHeight: "100vh",
        border: 0,
      }}
    />
  );
}
