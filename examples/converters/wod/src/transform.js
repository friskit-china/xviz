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


module.exports = async function main(args) {
    const {
        inputDir,
        outputDir,
        disabledStreams,
        fakeStreams,
        imageMaxWidth,
        imageMaxHeight,
        messageLimit,
        writeJson,
        writeProtobuf
    } = args;

    const converter = new WODConverter(inputDir, outputDir, {
        disabledStreams,
        fakeStreams,
        imageMaxWidth,
        imageMaxHeight
    });

    console.log(`Converting unpacked WOD data at ${inputDir}`);
    console.log(`Saving to ${outputDir}`);

    converter.initialize();

    const sink = new FileSink(outputDir);
    let xvizWriter = null;
    if (writeJson){
        xvizWriter = new XVIZJSONWriter(sink);
    } else if (writeProtobuf) {
        xvizWriter = new XVIZProtobufWriter(sink);
    } else {
        xvizWriter = new XVIZBinaryWriter(sink);
    }

    // Write metadata file
    const xvizMetadata = converter.getMetadata();
    xvizWriter.writeMetadata(xvizMetadata);

    // If we get interrupted make sure the index is written out
    // signalWriteIndexOnInterrupt(xvizWriter);

    const start = Date.now();

    const limit = Math.min(messageLimit, converter.messageCount());

    for (let i = 0; i < limit; i ++){
        // process.stdout.write(`processing message ${i}/${limit}\r`); // eslint-disable-line
        const xvizMessage = await converter.convertMessage(i);
        xvizWriter.writeMessage(i, xvizMessage);
    }
    xvizWriter.close();

    const end = Date.now();
    console.log(`Generate ${limit} messages in ${end - start}s`); // eslint-disable-line
};

function signalWriteIndexOnInterrupt(writer) {
    process.on('SIGINT', () => {
        console.log('Aborting, writing index file.'); 
        writer.close();
        process.exit(0); 
    });
}