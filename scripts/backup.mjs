import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export function encryptionKey(value) {
  const key = Buffer.from(value || "", "base64");
  if (key.length !== 32) throw new Error("BACKUP_ENCRYPTION_KEY에는 base64로 인코딩한 32바이트 키가 필요합니다.");
  return key;
}
export function encryptBackup(data, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([Buffer.from("AIB1"), iv, cipher.getAuthTag(), encrypted]);
}
export function decryptBackup(data, key) {
  if (data.length < 32 || data.subarray(0, 4).toString() !== "AIB1") throw new Error("백업 파일 형식이 올바르지 않습니다.");
  const cipher = createDecipheriv("aes-256-gcm", key, data.subarray(4, 16));
  cipher.setAuthTag(data.subarray(16, 32));
  return Buffer.concat([cipher.update(data.subarray(32)), cipher.final()]);
}
function connectionEnvironment(value) {
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error("PostgreSQL 연결 주소가 필요합니다.");
  return { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: url.searchParams.get('sslmode') || 'require', PGCONNECT_TIMEOUT: '20' };
}
export function validateRestoreTarget(value) {
  const url = new URL(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || decodeURIComponent(url.pathname.slice(1)) !== "blog_restore_check") {
    throw new Error("복원 검증은 로컬 blog_restore_check 데이터베이스에서만 허용합니다.");
  }
  return value;
}
function run(command, args, env) {
  const result = spawnSync(command, args, { env, stdio: ["ignore", "pipe", "pipe"], timeout: 300000 });
  if (result.error || result.status !== 0) throw new Error(`${command} 실행 실패. 연결 설정과 PostgreSQL 도구 버전을 확인해 주세요.`);
}
export async function createVerifiedBackup({ source, restoreTarget, key, output, runCommand = run }) {
  const target = validateRestoreTarget(restoreTarget);
  const sourceUrl = new URL(source);
  if (sourceUrl.hostname.includes("-pooler")) throw new Error("백업에는 Neon의 직접 연결 주소를 사용해 주세요.");
  const directory = await mkdtemp(path.join(tmpdir(), "ai-blog-backup-"));
  try {
    const dump = path.join(directory, "blog.dump");
    runCommand("pg_dump", ["--format=custom", "--no-owner", "--no-privileges", "--file", dump], connectionEnvironment(source));
    const encrypted = encryptBackup(await readFile(dump), key);
    // Verify the exact encrypted artifact, not just the original plaintext dump.
    const verified = path.join(directory, "verified.dump");
    await writeFile(verified, decryptBackup(encrypted, key), { mode: 0o600 });
    const environment = connectionEnvironment(target);
    runCommand("pg_restore", ["--dbname", environment.PGDATABASE, "--no-owner", "--no-privileges", "--exit-on-error", verified], environment);
    runCommand("psql", ["--no-psqlrc", "--set", "ON_ERROR_STOP=1", "--command", "SELECT COUNT(*) FROM posts; SELECT COUNT(*) FROM post_revisions;"], environment);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, encrypted, { mode: 0o600 });
    return output;
  } finally { await rm(directory, { recursive: true, force: true }); }
}
if (import.meta.url === new URL(process.argv[1], "file:").href) {
  try {
    const output = path.resolve(process.env.BACKUP_OUTPUT || "backups/blog.backup.enc");
    await createVerifiedBackup({ source: process.env.BACKUP_DATABASE_URL, restoreTarget: process.env.RESTORE_TEST_DATABASE_URL, key: encryptionKey(process.env.BACKUP_ENCRYPTION_KEY), output });
    console.log("암호화 백업 생성 및 격리 DB 복원 검증 완료");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "백업 실패");
    process.exitCode = 1;
  }
}
