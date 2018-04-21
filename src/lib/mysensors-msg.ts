import { mysensor_command } from "./mysensors-types";
import { mysensor_data } from "./mysensors-types";
import { mysensor_internal } from "./mysensors-types";
import { mysensor_sensor } from "./mysensors-types";
import { mysensor_stream } from "./mysensors-types";

export type MysensorsMsgNull = {
    topic?: string;
    payload: string;
    topicRoot?: string;
    nodeId?: number;
    childSensorId?: number;
    messageType?: mysensor_command;
    ack?: 0|1;
    subType?: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
} | null;

export type MysensorsMsg = {
    topic?: string;
    payload: string;
    topicRoot?: string;
    nodeId?: number;
    childSensorId?: number;
    messageType?: mysensor_command;
    ack?: 0|1;
    subType?: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
}

export type MysensorsMsgDefined = {
    payload: string;
    nodeId: number;
    childSensorId: number;
    messageType: mysensor_command;
    ack: 0|1;
    subType: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
}