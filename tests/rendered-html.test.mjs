import assert from "node:assert/strict";
import test from "node:test";

test("source contains the iWiki dashboard and no disposable starter preview", async () => {
  const [{ readFile }, { access }] = await Promise.all([
    import("node:fs/promises"),
    import("node:fs/promises"),
  ]);
  const root = new URL("../", import.meta.url);
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);

  assert.match(page, /Knowledge Dashboard/);
  assert.match(page, /Health metrics/);
  assert.match(page, /Thành viên & PIC/);
  assert.match(layout, /iWiki Knowledge Dashboard/);
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});
