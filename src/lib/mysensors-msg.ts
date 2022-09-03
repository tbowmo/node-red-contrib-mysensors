import { NodeMessageInFlow } from 'node-red';
import {
    mysensor_command,
    mysensor_data,
    mysensor_internal,
    mysensor_sensor,
    mysensor_stream,
} from './mysensors-types';

export interface INodeMessage extends NodeMessageInFlow {
    payload: string
    topic?: string
}

interface InternalMsg<
    SubType extends ( mysensor_data | mysensor_internal | mysensor_sensor | mysensor_stream),
    Command extends mysensor_command
> extends NodeMessageInFlow {
    topicRoot?: string
    nodeId: number
    childSensorId: number
    messageType: Command
    messageTypeStr?: string
    ack: 0 | 1
    subType: SubType
    subTypeStr?: string
    sensorTypeStr?: string
    origin?: MsgOrigin
}
export type IStrongMysensorsMsg<Command extends mysensor_command> =
    Command extends mysensor_command.C_INTERNAL ? InternalMsg<mysensor_internal, Command> :
    Command extends mysensor_command.C_PRESENTATION ? InternalMsg<mysensor_sensor, Command> :
    Command extends mysensor_command.C_REQ ? InternalMsg<mysensor_data, Command> :
    Command extends mysensor_command.C_SET ? InternalMsg<mysensor_data, Command> :
    InternalMsg<mysensor_stream, Command>

export type MysensorsCommand = mysensor_command

export interface IMysensorsMsg extends NodeMessageInFlow  {
    topicRoot?: string
    nodeId?: number
    childSensorId?: number
    messageType?: mysensor_command
    messageTypeStr?: string
    ack?: 0 | 1
    subType?: mysensor_data | mysensor_internal | mysensor_sensor | mysensor_stream
    subTypeStr?: string
    sensorTypeStr?: string
    origin?: MsgOrigin
}

export interface IWeakMysensorsMsg extends NodeMessageInFlow {
    nodeId?: number
}

export enum MsgOrigin {
    decoded,
    serial,
    mqtt,
}

export function validateStrongMysensorsMsg(
    input: IMysensorsMsg | IStrongMysensorsMsg<MysensorsCommand>
): input is IStrongMysensorsMsg<MysensorsCommand> {
    return input.nodeId !== undefined
        && input.childSensorId !== undefined
        && input.messageType !== undefined
        && input.subType !== undefined;
}
