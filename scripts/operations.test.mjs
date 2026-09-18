import { mkdtemp, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { encryptBackup, decryptBackup, encryptionKey, validateRestoreTarget, createVerifiedBackup } from "./backup.mjs";
import { evaluateStorage, monitor } from "./monitor.mjs";

test("encrypted backup round-trips and rejects tampering or wrong keys", () => {
  const key = randomBytes(32), original = Buffer.from("PGDMP confidential blog content");
  const encrypted = encryptBackup(original, key);
  assert.deepEqual(decryptBackup(encrypted, key), original);
  assert(!encrypted.includes(original));
  assert.throws(() => decryptBackup(encrypted, randomBytes(32)));
  encrypted[encrypted.length - 1] ^= 1;
  assert.throws(() => decryptBackup(encrypted, key));
  assert.throws(() => encryptionKey("short"));
});
test("restore verification cannot target a remote or non-test database", () => {
  assert.throws(() => validateRestoreTarget("postgresql://user:pass@production.example/blog_restore_check"));
  assert.throws(() => validateRestoreTarget("postgresql://user:pass@localhost/production"));
  assert.equal(validateRestoreTarget("postgresql://user:pass@127.0.0.1/blog_restore_check"), "postgresql://user:pass@127.0.0.1/blog_restore_check");
});
test("storage alert includes indexes and handles threshold boundaries", () => {
  assert.equal(evaluateStorage(80 * 1024 * 1024, 100).warning, true);
  assert.equal(evaluateStorage(79 * 1024 * 1024, 100).warning, false);
  assert.throws(() => evaluateStorage(1, 0));
  assert.throws(() => evaluateStorage(1, 100, 101));
});
test("monitor detects unhealthy API and unreachable database", async () => {
  const sql = async () => [{ bytes: String(10 * 1024 * 1024) }];
  const health = async () => ({ ok: true, json: async () => ({ status: "ok", storage: "database" }) });
  assert.equal((await monitor({ sql, fetchHealth: health, limitMb: 100 })).warning, false);
  await assert.rejects(() => monitor({ sql, fetchHealth: async () => ({ ok: false }), limitMb: 100 }));
  await assert.rejects(() => monitor({ sql: async () => { throw new Error("offline"); }, fetchHealth: health, limitMb: 100 }));
});

test("backup publishes only an encrypted verified artifact and removes plaintext", async () => {
  const { writeFileSync, readFileSync } = await import("node:fs");
  const directory = await mkdtemp(path.join(tmpdir(), "blog-backup-test-"));
  const output = path.join(directory, "result.enc"), key = randomBytes(32), original = Buffer.from("PGDMP sample");
  let plaintext;
  const commands = [];
  try {
    await createVerifiedBackup({
      source: "postgresql://read:password@source.example/blog?sslmode=require",
      restoreTarget: "postgresql://test:password@localhost/blog_restore_check?sslmode=disable", key, output,
      runCommand(command, args, env) {
        commands.push(command);
        if (command === "pg_dump") { plaintext = args.at(-1); writeFileSync(plaintext, original); }
        else if (command === "pg_restore") {
          assert.equal(env.PGDATABASE, "blog_restore_check");
          assert.deepEqual(readFileSync(args.at(-1)), original);
        }
      }
    });
    assert.deepEqual(commands, ["pg_dump", "pg_restore", "psql"]);
    assert.deepEqual(decryptBackup(await readFile(output), key), original);
    await assert.rejects(() => access(path.dirname(plaintext)));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("failed restore leaves no backup artifact or temporary plaintext", async () => {
  const { writeFileSync } = await import("node:fs");
  const directory = await mkdtemp(path.join(tmpdir(), "blog-backup-fail-test-"));
  const output = path.join(directory, "result.enc");
  let plaintext;
  try {
    await assert.rejects(() => createVerifiedBackup({
      source: "postgresql://read:password@source.example/blog?sslmode=require",
      restoreTarget: "postgresql://test:password@localhost/blog_restore_check?sslmode=disable", key: randomBytes(32), output,
      runCommand(command, args) {
        if (command === "pg_dump") { plaintext = args.at(-1); writeFileSync(plaintext, "PGDMP sample"); }
        else throw new Error("restore failed");
      }
    }), /restore failed/);
    await assert.rejects(() => access(output));
    await assert.rejects(() => access(path.dirname(plaintext)));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
