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


import { FileSink } from "@xviz/io/node";
import { XVIZBinaryWriter, XVIZJSONWriter, XVIZProtobufWriter } from "@xviz/io";

import {WODConverter} from './converters';

import process from 'process';


module.exports = async function main(args){
    const {
        input_dir,
        output_dir,
        disabled_streams,
        fake_streams,
        image_max_width,
        image_max_height,
        message_limit,
        write_json,
        write_protobuf
    } = args;

    const converter = new WODConverter(input_dir, output_dir, {
        disabled_streams,
        fake_streams,
        image_max_width,
        image_max_height
    });

    console.log(`Converting unpacked KITTI data at ${input_dir}`);
    console.log(`Saving to ${output_dir}`);

    converter.initialize();

    const sink = new FileSink(output_dir);
    let xviz_writer = null;
    if (write_json){
        xviz_writer = new XVIZJSONWriter(sink);
    } else if (write_protobuf) {
        xviz_writer = new XVIZProtobufWriter(sink);
    } else {
        xviz_writer = new XVIZBinaryWriter(sink);
    }

    // Write metadata file
    const xviz_metadata = converter.getMetadata();
    xviz_writer.writeMetadata(xviz_metadata);

    // If we get interrupted make sure the index is written out
    signalWriteIndexOnInterrupt(xviz_writer);

    const start = Date.now();

    const limit = Math.min(message_limit, converter.messageCount());

    for (let i = 0; i < limit; i ++){
        const xviz_message = await converter.convertMessage(i);
        xviz_writer.writeMessage(i, xviz_message);
    }
    xviz_writer.close();

    const end = Date.now();
    console.log(`Generate ${limit} messages in ${end - start}s`);
};

function signalWriteIndexOnInterrupt(writer){
    process.on('SIGINT', () => {
        console.log('Aborting, witing index file.');
        writer.close();
        process.exit(0);
    });
}