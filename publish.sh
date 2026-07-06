#!/bin/bash
# サイトを編集したあと、これ1発で公開反映（数十秒でCDNに乗る）
cd "$(dirname "$0")"
git add -A
git -c user.name="ruka" -c user.email="rukatubasass@gmail.com" commit -m "update: $(date '+%Y-%m-%d %H:%M')" || exit 0
git push origin main
echo "✅ 公開反映キュー完了 → https://rukatubasass-boop.github.io/ruka-site/（1〜2分で反映）"
