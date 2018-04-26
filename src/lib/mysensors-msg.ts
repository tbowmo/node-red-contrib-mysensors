import { mysensor_command } from './mysensors-types';
import { mysensor_data } from './mysensors-types';
import { mysensor_internal } from './mysensors-types';
import { mysensor_sensor } from './mysensors-types';
import { mysensor_stream } from './mysensors-types';

export interface INodeMessage {
    payload: string;
    topic?: string;
}

export interface IMysensorsMsg extends INodeMessage {
    topicRoot?: string;
    nodeId?: number;
    childSensorId?: number;
    messageType?: mysensor_command;
    ack?: 0|1;
    subType?: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
}
