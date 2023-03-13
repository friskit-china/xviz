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

import fs from 'fs';
import path from 'path';
import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';

import GPSConverter from './gps-converter.js';
import LidarConverter from './lidar-converter.js';
import MultiCameraConverter from './camera-converter.js';

import {getDeclarativeUI} from './declarative-ui.js';


export class WODConverter {
    constructor(inputDir, outputDir, {disabledStreams, fakeStreams, imageMaxWidth, imageMaxHeight}) {
        this.inputDir = inputDir;
        this.outputDir = outputDir;
        this.disabledStreams = disabledStreams;
        this.fakeStreams = fakeStreams;
        this.imageOptions = {
            maxWidth: imageMaxWidth,
            maxHeight: imageMaxHeight
        };

        this.numMessages = 0;
        this.metadata = null;
    }

    initialize() {
        // console.log();
        const segmentMetaFilepath = path.resolve(this.inputDir, 'segment_meta.json');
        this.segmentMeta = JSON.parse(fs.readFileSync(segmentMetaFilepath, 'utf-8'));
        this.timestamps = this.segmentMeta['timestamp_list'];
        this.numMessages = this.segmentMeta['timestamp_list'].length;

        this.converters = [
            new GPSConverter(this.segmentMeta),
            new LidarConverter(this.segmentMeta, this.inputDir, 'LiDAR'),
            new MultiCameraConverter(this.segmentMeta, this.inputDir, 'Cameras', this.imageOptions)
        ];

        this.converters.forEach(converter => converter.load());
        // this.metadata = this.getMetadata();

        console.log();
    }

    async convertMessage(messageNumber){
        const xvizBuilder = new XVIZBuilder({
            metadata: this.metadata,
            disabledStreams: this.disabledStreams
          });

        for (let i = 0; i < this.converters.length; i++){
            await this.converters[i].convertMessage(messageNumber, xvizBuilder)
        }

        return xvizBuilder.getMessage();
    }

    messageCount(){
        return this.numMessages;
    }

    getMetadata(){
        const xb = new XVIZMetadataBuilder();
        xb.startTime(this.timestamps[0]).endTime(this.timestamps[this.timestamps.length - 1]);

        this.converters.forEach(converter => converter.getMetadata(xb));
        xb.ui(getDeclarativeUI());

        xb.logInfo({
            description: 'Conversion of WOD data set into XVIZ',
            license: 'CC BY-NC-SA 3.0',
            'license link': '<a href="http://creativecommons.org/licenses/by-nc-sa/3.0/">http://creativecommons.org/licenses/by-nc-sa/3.0/</a>',
            uri: '<a href="https://xx.com">https://xx.com</a>',
            source: {
                title: 'Waymo Open Dataset',
                author: 'xxx',
                link: '<a href="http://xx.com">http://xx.com</a>',
                copyright: 'XX'
            }
        });

        return xb.getMetadata();
    }
}