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

import { XVIZUIBuilder } from "@xviz/builder";

export function getDeclarativeUI() {
    const builder = new XVIZUIBuilder({});

    builder.child(getMetricsPanel(builder));
    builder.child(getVideoPanel(builder));
    // builder.child(getVideoPanelHorizontal(builder));
    return builder;
}

function getMetricsPanel(builder){
    const panel = builder.panel({
        name: 'Metrics'
    });

    const container = builder.container({
        name: 'Metrics Panel',
        layout: 'vertical'
    });

    const metricVelocity = builder.metric({
        title: 'Velocity',
        streams: ['/vehicle/velocity'],
        description: 'The velocity of the vehicle'
    });

    container.child(metricVelocity);
    panel.child(container);

    return panel;
}

function getVideoPanel(builder){
    const panel = builder.panel({
        name: 'Camera'
    });

    const video = builder.video({
        cameras: ['/camera/FRONT', '/camera/FRONT_LEFT', '/camera/FRONT_RIGHT', '/camera/SIDE_LEFT', '/camera/SIDE_RIGHT']
    });

    panel.child(video);

    return panel;
}

function getVideoPanelHorizontal(builder){
    const panel = builder.panel({
        name: 'Camera', // 'Camera' is defined in app.js
        layout: 'horizontal'
    });

    const video_front = builder.video({ cameras: ['/camera/FRONT'] });
    const video_front_left = builder.video({ cameras: ['/camera/FRONT_LEFT'] });
    const video_front_right = builder.video({ cameras: ['/camera/FRONT_RIGHT'] });
    // const video_side_left = builder.video({ cameras: ['/camera/SIDE_LEFT'] });
    // const video_side_right = builder.video({ cameras: ['/camera/SIDE_RIGHT'] });
    panel.child(video_front);
    panel.child(video_front_left);
    panel.child(video_front_right);

    return panel;
}