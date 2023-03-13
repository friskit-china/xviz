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
import path from 'path';
import fs from 'fs';



export default class BaseConverter {
    constructor(segmentMeta, rootDir, streamDir) {
        this.segmentMeta = segmentMeta;
        this.rootDir = rootDir;
        this.streamDir = path.join(this.rootDir, streamDir);
    }

    load() {
        this.fileNames = fs.readdirSync(this.streamDir).sort();
        this.timestamps = this.segmentMeta['timestamp_list'];
    }

    async loadMessage(messageNumber){
        const fileName = this.fileNames[messageNumber];
        const srcFilePath = path.join(this.streamDir, fileName);
        const data = fs.readFileSync(srcFilePath);

        const timestamp = this.segmentMeta['timestamp_list'][messageNumber];

        return {data, timestamp};
    }
}