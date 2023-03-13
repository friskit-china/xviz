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
import sharp from 'sharp';
import path from 'path';


import BaseConverter from "./base-converter.js";


export default class MultiCameraConverter{
    constructor(segmentMeta, rootDir, streamDir, imageOptions){
        this.segmentMeta = segmentMeta
        this.rootDir = rootDir
        this.streamDir = streamDir
        this.imageOptions = imageOptions;
        this.cameraSources = ['FRONT', 'FRONT_LEFT', 'FRONT_RIGHT', 'SIDE_LEFT', 'SIDE_RIGHT'];
        this.imageConverters = [];
    }

    load() {
        this.cameraSources.forEach(cameraSource => {
            this.imageConverters.push(new ImageConverter(this.segmentMeta, this.rootDir, this.streamDir, cameraSource, this.imageOptions));
        });

        this.imageConverters.forEach(imageConverter => imageConverter.load());
    }

    async convertMessage(messageNumber, xvizBuilder){
        const promises = this.imageConverters.map(imageConverter => imageConverter.convertMessage(messageNumber, xvizBuilder));
        await Promise.all(promises);
    }

    getMetadata(xvizMetaBuilder) {
        this.imageConverters.forEach(imageConverter => imageConverter.getMetadata(xvizMetaBuilder));
    }
}

class ImageConverter extends BaseConverter{
    constructor(segmentMeta, rootDir, streamDir, cameraSource, options) {
        super(segmentMeta, rootDir, streamDir);
        this.streamDir = path.join(this.streamDir, cameraSource);
        this.options = options;
        this.streamName = `/camera/${cameraSource}`;
    }

    async loadMessage(messageNumber) {
        const fileName = this.fileNames[messageNumber];
        const {maxWidth, maxHeight} = this.options;
        const srcFilePath = path.join(this.streamDir, fileName);
        const {data, width, height} = await resizeImage(srcFilePath, maxWidth, maxHeight);

        const timestamp = this.timestamps[messageNumber];
        return {data, timestamp, width, height};
    }

    async convertMessage(messageNumber, xvizBuilder) {
        const {data, width, height} = await this.loadMessage(messageNumber);

        xvizBuilder
            .primitive(this.streamName)
            .image(nodeBufferToTypedArray(data), 'jpg')
            .dimensions(width, height);
    }

    getMetadata(xvizMetaBuilder) {
        const xb = xvizMetaBuilder;
        xb.stream(this.streamName)
          .category('primitive')
          .type('image');
    }
}

function nodeBufferToTypedArray(buffer) {
    // TODO - per docs we should just be able to call buffer.buffer, but there are issues
    const typedArray = new Uint8Array(buffer);
    return typedArray;
  }

function getResizeDimension(width, height, maxWidth, maxHeight) {
    const ratio = width / height;
  
    let resizeWidth = null;
    let resizeHeight = null;
  
    if (maxHeight > 0 && maxWidth > 0) {
      resizeWidth = Math.min(maxWidth, maxHeight * ratio);
      resizeHeight = Math.min(maxHeight, maxWidth / ratio);
    } else if (maxHeight > 0) {
      resizeWidth = maxHeight * ratio;
      resizeHeight = maxHeight;
    } else if (maxWidth > 0) {
      resizeWidth = maxWidth;
      resizeHeight = maxWidth / ratio;
    } else {
      resizeWidth = width;
      resizeHeight = height;
    }
  
    return {
      resizeWidth: Math.floor(resizeWidth),
      resizeHeight: Math.floor(resizeHeight)
    };
  }
  
  // preserve aspect ratio
  export async function resizeImage(filePath, maxWidth, maxHeight) {
    const metadata = await getImageMetadata(filePath);
    const {width, height} = metadata;
  
    let imageData = null;
    const {resizeWidth, resizeHeight} = getResizeDimension(width, height, maxWidth, maxHeight);
  
    if (resizeWidth === width && resizeHeight === height) {
      imageData = fs.readFileSync(filePath);
    } else {
      imageData = await sharp(filePath)
        .resize(resizeWidth, resizeHeight)
        .toBuffer()
        .then(data => data);
    }
  
    return {
      width: resizeWidth,
      height: resizeHeight,
      data: imageData
    };
  }
  
  export async function getImageMetadata(filePath) {
    return await sharp(filePath).metadata();
  }
  