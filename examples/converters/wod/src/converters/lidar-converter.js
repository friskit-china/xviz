// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {Parser as BinaryParser} from 'binary-parser';
const parser = new BinaryParser().floatle();

import uuid from 'uuid/v4';

import BaseConverter from './base-converter';

export default class LidarConverter extends BaseConverter {
    constructor(segmentMeta, rootDir, streamDir){
        super(segmentMeta, rootDir, streamDir);

        this.LIDAR_POINTS = '/lidar/points';
    }

    async convertMessage(messageNumber, xvizBuilder){
        const {data} = await this.loadMessage(messageNumber);
        const lidarData = loadLidarData(data);

        xvizBuilder
            .primitive(this.LIDAR_POINTS)
            .points(lidarData.positions)
            .colors(lidarData.colors)
            .id(uuid());
    }

    getMetadata(xvizMetaBuilder){
        const xb = xvizMetaBuilder;
        xb.stream(this.LIDAR_POINTS)
          .category('primitive')
          .type('point')
          .streamStyle({
            fill_color: '#00a',
            radius_pixels: 1
          })
          .coordinate('VEHICLE_RELATIVE')
          .pose({
            x: 0,
            y: 0,
            z: 0
          });
    }
}

function loadLidarData(data){
    const binary = readBinaryData(data);
    const float = new Float32Array(binary);
    const size = Math.round(binary.length / 4);

    // We could return interleaved buffers, no conversion!
    const positions = new Array(size);
    const colors = new Array(size);

    for (let i = 0; i < size; i++) {
        positions[i] = float.subarray(i * 4, i * 4 + 3);

        const reflectance = Math.min(float[i * 4 + 3], 3);
        colors[i] = [80 + reflectance * 80, reflectance * 80, reflectance * 60];
    }
    return {positions, colors};
}

function readBinaryData(binary) {
    const res = [];
    for (let i = 0; i < binary.length; i = i + 4) {
      if (i + 4 > binary.length) {
        break;
      }
      const parsed = parser.parse(binary.slice(i, i + 4));
      res.push(parsed);
    }
    return res;
  }