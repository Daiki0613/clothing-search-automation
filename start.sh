#!/bin/bash
Xvfb :99 -screen 0 1024x768x24 -ac &
echo $! > /tmp/xvfb.pid
export DISPLAY=:99