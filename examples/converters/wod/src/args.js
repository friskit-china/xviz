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

const {ArgumentParser} = require('argparse');

const parser = new ArgumentParser({
    add_help: true,
    description: 'WOD to XVIZ Converter.'
});

parser.addArgument(['-d', '--data-directory'], {
    required: true,
    // defaultValue: '../../../../wod_unpacker/output',
    help: 'Path to unpacked WOD tfrecord file.'
});

parser.addArgument(['-o', '--output'], {
    required: true,
    // defaultValue: '../../../data/generated/waymo/segment-7670103006580549715_360_000_380_000_with_camera_labels',
    help: 'Path to generated data.'
});

parser.addArgument('--json', {
    action: 'storeTrue',
    help: 'Generate JSON XVIZ output instead of the GLB file format'
  });
  
  parser.addArgument('--protobuf', {
    action: 'storeTrue',
    help: 'Generate Protobuf XVIZ output instead of the GLB file file format'
  });

parser.addArgument(['--disable-streams'], {
    defaultValue: '',
    help: 'Comma separated stream names to disable'
  });

parser.addArgument(['--message-limit'], {
    defaultValue: Number.MAX_SAFE_INTEGER,
    help: 'Limit XVIZ message generation to this value. Useful for testing conversion quickly.'
});

parser.addArgument(['--image-max-width'], {
    defaultValue: 400,
    help: 'Image max width'
  });
  
  parser.addArgument(['--image-max-height'], {
    defaultValue: 300,
    help: 'Image max height'
  });

  parser.addArgument('--fake-streams', {
    action: 'storeTrue',
    help: 'Generate fake streams with random data for testing'
  });


  module.exports = function getArgs(){
    const args = parser.parseArgs();
    const input_dir = args.data_directory;
    const output_dir = args.output;

    console.log(input_dir, output_dir);
    const disabled_streams = args.disable_streams.split(',').filter(Boolean);
    return {
        input_dir,
        output_dir,
        disabled_streams,
        fake_streams: args.fake_streams,
        image_max_width: Number(args.image_max_width),
        image_max_height: Number(args.image_max_height),
        message_limit: Number(args.message_limit),
        write_json: Boolean(args.json),
        write_protobuf: Boolean(args.protobuf)
    };
  }