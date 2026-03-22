---
name: Fix cAdvisor container metrics
overview: cAdvisor を v0.49.1 から v0.54.0 にアップグレードし、Docker 29.x の containerd-snapshotter に対応させることで、Container CPU / Memory メトリクスの No data 問題を修正する。
todos:
  - id: upgrade-cadvisor
    content: "docker-compose.yml の cAdvisor イメージを v0.49.1 -> v0.54.0 にアップグレードし、privileged: true を追加"
    status: completed
isProject: false
---

# cAdvisor コンテナメトリクス No data 修正

## 原因

- 別端末の Docker は **29.x 以降**で、`containerd-snapshotter` がデフォルトのイメージストレージバックエンドになっている
- メタデータの保存先が `/var/lib/docker/image/overlayfs/layerdb/` から `/var/lib/containerd/io.containerd.snapshotter.v1/` に変更された
- **cAdvisor v0.49.1** はこの新しいパスに対応しておらず、全コンテナの個別メトリクス取得に失敗している
- 参照: [google/cadvisor#3643](https://github.com/google/cadvisor/issues/3643), [PR #3709](https://github.com/google/cadvisor/pull/3709)

## 修正方針

**cAdvisor のイメージを v0.49.1 -> v0.54.0 にアップグレード**する。
v0.54.0 には containerd-snapshotter 対応の修正が含まれている。

また、v0.54.0 からコンテナイメージのレジストリが `gcr.io` から `ghcr.io` に移行されているため、イメージ参照先も更新する。

## 変更ファイル（1ファイルのみ）

### [docker-compose.yml](docker-compose.yml)

cadvisor サービスのイメージタグを変更:

```yaml
# Before
cadvisor:
  image: gcr.io/cadvisor/cadvisor:v0.49.1

# After
cadvisor:
  image: ghcr.io/google/cadvisor:v0.54.0
```

加えて、`privileged: true` の追加を検討する。cgroup v2 環境（別端末で確認済み: `cgroup2fs`）では、cAdvisor が `/sys/fs/cgroup` を正しく読むために privileged モードが推奨される。

```yaml
cadvisor:
  image: ghcr.io/google/cadvisor:v0.54.0
  container_name: kd1-cadvisor
  restart: "no"
  privileged: true
  volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:ro
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
  ports:
    - "8080:8080"
  networks:
    - kd1-network
```

## 動作確認手順（別端末で実施）

1. `docker compose down` で既存コンテナを停止
2. `docker compose up -d cadvisor` で新バージョンの cAdvisor を起動
3. 1-2分待ってから: `curl -s http://localhost:8080/metrics | grep 'container_cpu_usage_seconds_total.*kd1-yjs-server'`
4. Grafana (localhost:3001) で「Container CPU Usage」「Container Memory」にデータが表示されることを確認

## 影響範囲

- `docker-compose.yml` の cadvisor サービスのみ
- 既存の Prometheus / Grafana 設定は変更不要（メトリクス名は同じ）
- うまくいっている PC でも v0.54.0 は後方互換で動作する
