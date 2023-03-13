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
import BaseConverter from './base-converter';
import process from 'process';

export default class GPSConverter{
    constructor(segment_meta) {
        this.segment_meta = segment_meta;

        this.VEHICLE_VELOCITY = '/vehicle/velocity';
    }

    load() {
        this.poses = this.segment_meta['frame_meta_list'];
    }

    async convertMessage(messageNumber, xvizBuilder) {
        const entry = this.poses[messageNumber];
        process.stdout.write(`processing message ${messageNumber}/${this.segment_meta['timestamp_list'].length}\r`); // eslint-disable-line


        xvizBuilder
            .pose('/vehicle_pose')
            .timestamp(entry['timestamp'])
            .mapOrigin(-122.44766137081166, 37.78129473178359, 0)
            .orientation(entry['roll'], entry['pitch'], entry['yaw'])
            .position(entry['x'], entry['y'], entry['z']);

        xvizBuilder
            .timeSeries(this.VEHICLE_VELOCITY)
            .timestamp(entry['timestamp'])
            .value(entry['velocity_forward']);
    }

    getMetadata(xvizMetaBuilder){
        const xb = xvizMetaBuilder;
        xb
        .stream('/vehicle_pose').category('pose')
        .stream(this.VEHICLE_VELOCITY).category('time_series').type('float').unit('m/s')
        .streamStyle({
            stroke_color: '#47B27588',
            stroke_width: 1.4,
            stroke_width_min_pixels: 1
          });
    }
}