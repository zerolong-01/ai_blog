# 블로그 복구·백업·모니터링

## 배포 준비

배포 전 `MIGRATION_DATABASE_URL`을 직접 연결 주소로 설정하고 `npm run migrate`를 실행합니다. `005_post_revisions.sql`부터 수정·삭제 직전 내용을 보관합니다. 이력 테이블이 없으면 수정·삭제는 실패하며 기존 글은 그대로 남습니다. 마이그레이션 전 변경·삭제된 글은 이력으로 복구할 수 없습니다.

관리자의 **수정 이력·삭제 복구**에서 원문을 확인하고 복원합니다. 복원 전 현재 글도 이력에 남습니다. 삭제 버전 복원은 같은 주소의 글이 이미 있으면 중단하고, 수정 버전 복원은 대상 글이 존재해야 합니다. 이력은 원문을 포함해 DB 용량을 사용하며 자동 삭제하지 않습니다. 보관 기간을 줄일 때는 먼저 백업과 복원 결과를 확인하세요.

일반 작성·수정·대화 게시의 **Markdown 미리보기**는 실제 게시와 동일한 정제 함수를 사용합니다. 본문을 바꾸면 미리보기를 새로고침해야 합니다.

## 공개 글 조회

목록과 검색은 12개씩 DB에서 조회합니다. 검색은 제목·요약·카테고리·기존 특징 정보를 대상으로 하며 본문 검색은 제공하지 않습니다. 공개 메타데이터와 페이지 결과는 5분 캐시하고 게시·수정·삭제·복원 직후 태그를 무효화합니다. 관리자 인증·이력·용량과 health API는 캐시하지 않습니다. DB 장애로 불러온 비상 콘텐츠는 공개 데이터 캐시에 저장하지 않습니다.

## GitHub 설정

저장소 Settings → Secrets and variables → Actions에 다음 값을 등록합니다. 현재 구현 시점에는 등록된 Secrets/Variables가 없어 운영 자동화는 실행 검증되지 않았습니다.

| 종류 | 이름 | 값 |
|---|---|---|
| Secret | `BACKUP_DATABASE_URL` | 백업용 Neon **직접 연결** URL. 풀러 주소 사용 불가. 백업할 모든 테이블에 읽기 권한 필요 |
| Secret | `BACKUP_ENCRYPTION_KEY` | 32바이트 난수를 base64로 인코딩한 키. `openssl rand -base64 32`로 생성 |
| Secret | `MONITOR_DATABASE_URL` | 공개 테이블의 조회·용량 확인이 가능한 점검용 연결 URL |
| Variable | `BLOG_URL` | 운영 HTTPS 주소, 예: `https://toolaiatlas.com` |
| Variable | `DATABASE_STORAGE_LIMIT_MB` | 실제 계정 한도를 확인해 설정한 현재 DB의 용량 예산(MiB 단위) |
| Variable | `STORAGE_WARNING_PERCENT` | 경고 비율. 생략 시 80 |

배포 환경에도 `DATABASE_STORAGE_LIMIT_MB`를 넣으면 관리자 화면에 사용률과 80% 이상 경고가 표시됩니다. Neon 무료 플랜 용량을 코드에 고정하지 않았습니다. SQL 수치는 현재 DB의 공개 테이블·인덱스 용량이며 Neon 콘솔의 모든 브랜치·프로젝트·서비스 과금 수치와 동일하지 않습니다. 계정 전체 사용량과 복구 보관 기간은 Neon 콘솔에서도 확인하세요.

## 정기 백업과 복원 검증

`blog-backup.yml`은 매일 오전 3시(KST)에 전체 DB를 custom-format `pg_dump`로 백업합니다. AES-256-GCM으로 암호화하고 **저장할 암호화 파일을 다시 복호화해 격리된 PostgreSQL DB에 복원**한 뒤 posts/post_revisions 조회를 확인합니다. 검증 실패 시 artifact를 업로드하지 않습니다. 평문 임시 파일은 성공·실패 모두 삭제합니다. 백업·복원 검증에는 PostgreSQL 18 도구를 사용하므로 향후 원본 서버가 더 높은 버전으로 올라가면 도구도 갱신해야 합니다.

암호화 파일은 GitHub Actions artifact로 14일 보관합니다. 키를 별도 안전한 장소에 보관하세요. 키가 없으면 복구할 수 없으며, 키 변경 전에 기존 파일 복호화를 확인해야 합니다. 더 긴 보관 기간이나 별도 저장소가 필요하면 암호화 artifact를 내려받아 보관합니다. 워크플로를 기본 브랜치에 반영하고 Secrets를 등록한 후 Actions에서 수동 실행해 최초 백업을 검증해야 합니다.

복호화 예시(현재 프로젝트 루트에서 실행):

```sh
node --input-type=module -e 'import { readFile, writeFile } from "node:fs/promises"; import { decryptBackup, encryptionKey } from "./scripts/backup.mjs"; await writeFile("/private/tmp/blog-recovery.dump", decryptBackup(await readFile("backups/blog.backup.enc"), encryptionKey(process.env.BACKUP_ENCRYPTION_KEY)), { mode: 0o600 });'
```

복구는 새 Neon 브랜치 또는 빈 별도 DB에 `pg_restore --no-owner --no-privileges --exit-on-error`로 먼저 진행하고, 글 개수·본문·이력과 로그인 상태를 확인한 뒤 운영 전환을 결정합니다. 백업에는 세션·관리자 감사 데이터도 포함되므로 원본 DB에 바로 덮어쓰지 마세요. 검증용 DB에 운영 사용자가 접근하지 않게 관리합니다. 복원 도구의 연결 비밀번호는 명령 인자에 적지 않고 `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE` 환경변수를 이용합니다. 복호화한 파일은 확인 후 삭제합니다.

## 장애·용량 알림

`blog-monitor.yml`은 약 30분 간격으로 `/api/health`와 별도 DB 읽기 연결을 확인합니다. DB 장애·설정 누락·한도 경고는 실행 실패로 표시합니다. 알림을 받으려면 GitHub 개인 Settings → Notifications → Actions에서 실패 알림과 이메일을 활성화하세요. 별도 이메일·Slack·문자 서비스는 연결하지 않았습니다. GitHub 예약 작업은 지연될 수 있으므로 초 단위 장애 대응을 제공하지 않습니다.

수동 점검: 설정을 환경변수로 로드하고 `npm run monitor`를 실행합니다. 모니터링 실패 로그에는 연결 문자열이나 비밀번호를 출력하지 않습니다.

## 참고 문서

- [Next.js 공개 데이터 캐시](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [PostgreSQL 원자적 CTE 변경](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL Ubuntu 도구 설치](https://www.postgresql.org/download/linux/ubuntu/)
