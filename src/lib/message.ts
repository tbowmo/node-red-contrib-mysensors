import { mysensor_command } from "../lib/mysensors-types";
import { mysensor_data } from "../lib/mysensors-types";
import { mysensor_internal } from "../lib/mysensors-types";
import { mysensor_sensor } from "../lib/mysensors-types";
import { mysensor_stream } from "../lib/mysensors-types";

export interface FullMsg {
    topic?: string;
    payload: string;
    topicRoot?: string;
    nodeId?: number;
    childSensorId?: number;
    messageType?: mysensor_command;
    ack?: number;
    subType?: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
}
