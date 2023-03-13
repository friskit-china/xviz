# Copyright (c) 2019 Uber Technologies, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/../data/generated/waymo/segment-7670103006580549715_360_000_380_000_with_camera_labels"
echo DATA_DIR:
echo $DATA_DIR


# Terminate background pids
exit_script() {
  echo "Terminating XVIZ server & client!"
  trap - SIGINT SIGTERM
  for pid in ${pids[*]}; do
    echo "Terminating ${pid}"
    kill ${pid}
  done
}
trap exit_script SIGINT SIGTERM

export MapboxAccessToken=pk.eyJ1IjoibGl6aGk1MjEiLCJhIjoiY2w3c2RiOXdiMG8zczNxbnUxY2Z1
cd "${SCRIPT_DIR}/../modules/server" && ./bin/xvizserver -d "${DATA_DIR}" --port 8081 &
pids[1]=$!

echo "##"
echo "## XVIZ Server started."
echo "## Ctrl-c to terminate."
echo "##"

for pid in ${pids[*]}; do
    wait $pid
done
