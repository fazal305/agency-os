import { test } from "node:test";
import assert from "node:assert/strict";
import { validateUploadedFile } from "../src/lib/file-validation.js";

function fakeFile({ name, size, type = "application/octet-stream" }) {
  return { name, size, type };
}

test("rejects empty selection", () => {
  assert.match(validateUploadedFile(null), /choose a file/i);
  assert.match(validateUploadedFile(fakeFile({ name: "a.png", size: 0 })), /choose a file/i);
});

test("rejects files over the size limit", () => {
  const tooBig = fakeFile({ name: "big.pdf", size: 26 * 1024 * 1024 });
  assert.match(validateUploadedFile(tooBig), /25MB/);
});

test("rejects executable extensions", () => {
  for (const name of ["installer.exe", "script.sh", "payload.js", "app.apk"]) {
    const file = fakeFile({ name, size: 1000 });
    assert.match(validateUploadedFile(file), /allowed/i, `${name} should be rejected`);
  }
});

test("accepts a normal document within the size limit", () => {
  const file = fakeFile({ name: "brand-guidelines.pdf", size: 1024 * 1024 });
  assert.equal(validateUploadedFile(file), null);
});
