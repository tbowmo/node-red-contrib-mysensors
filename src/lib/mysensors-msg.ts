import {
    mysensor_command, mysensor_data, mysensor_internal, mysensor_sensor, mysensor_stream
} from './mysensors-types';

export interface INodeMessage {
    payload: string;
    topic?: string;
}

export interface  IMysensorsMsg extends INodeMessage {
    topicRoot?: string;
    nodeId?: number;
    childSensorId?: number;
    messageType?: mysensor_command;
    messageTypeStr?: string;
    ack?: 0|1;
    subType?: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
    subTypeStr?: string;
    sensorTypeStr?: string;
    origin?: MsgOrigin;
}

export enum MsgOrigin {
    decoded,
    serial,
    mqtt,
}
