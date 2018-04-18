import { mysensor_command } from "./mysensors-types";
import { mysensor_data } from "./mysensors-types";
import { mysensor_internal } from "./mysensors-types";
import { mysensor_sensor } from "./mysensors-types";
import { mysensor_stream } from "./mysensors-types";

export interface MysensorsMsg {
    topic?: string;
    payload: string;
    topicRoot?: string;
    nodeId?: number;
    childSensorId?: number;
    messageType?: mysensor_command;
    ack?: number;
    subType?: mysensor_data| mysensor_internal| mysensor_sensor| mysensor_stream;
}
