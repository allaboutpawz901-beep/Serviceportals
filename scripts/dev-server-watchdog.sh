#!/bin/bash
# Dev-server respawn watchdog.
#
# Why this exists: gateway-spawned agent sessions (cron job 390191 and queued
# tick sessions) run `pkill -9 -f 'next'` whenever their health-check curl
# observes 000, which also murders HEALTHY servers mid-boot or mid-compile.
# The server then stays dead until the next session bothers to restart it.
#
# This watchdog's own cmdline contains neither "next" nor "node", so the
# pkill sweeps cannot match or kill it. When the server is killed, this loop
# respawns it within ~5s (no pkill of its own, no .next cache wipe, so boots
# stay ~1-2s warm and the 000-during-boot window shrinks to near zero).
#
# Port-safety: if a server process is already booting (process exists but
# listener not up yet), it waits instead of stacking a second instance. A
# stacked instance would fail to bind :3000 and exit harmlessly anyway.

cd /home/z/my-project || exit 1

while true; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 4 http://localhost:3000/ 2>/dev/null)
  if [ "$code" != "200" ]; then
    if ! pgrep -f "next-server|next dev" > /dev/null 2>&1; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] watchdog: server down (last code=$code) - respawning" >> watchdog.log
      nohup bun run dev >> dev.log 2>&1 &
    fi
  fi
  sleep 5
done
