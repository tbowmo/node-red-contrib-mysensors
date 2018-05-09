import { IMysensorsMsg, INodeMessage } from '../mysensors-msg';

export interface IDecoder {
    decode(msg: INodeMessage): IMysensorsMsg| undefined;
    encode(msg: IMysensorsMsg): INodeMessage| undefined;
}
