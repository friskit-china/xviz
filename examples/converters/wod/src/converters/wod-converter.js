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
// import path from 'path';
// import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';
// import * as fs from 'fs';



export class WODConverter {
    constructor(input_dir, output_dir, {disabled_streams, fake_streams, image_max_width, image_max_height}) {
        this.input_dir = input_dir;
        this.output_dir = output_dir;
        this.disabled_streams = disabled_streams;
        this.fake_streams = fake_streams;
        this.image_options = {
            maxWidth: image_max_width,
            maxHeight: image_max_height
        };

        this.num_messages = 0;
        this.metadata = null;
    }

    initialize() {
        const segment_meta_filepath = path.resolve(this.input_dir, 'segment_meta.json');
        const segment_meta= JSON.parse(fs.readFileSync(segment_meta_filepath, 'utf-8'));
    }
}