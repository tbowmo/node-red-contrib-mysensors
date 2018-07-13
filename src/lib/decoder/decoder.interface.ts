import { IMysensorsMsg, INodeMessage } from '../mysensors-msg';

export interface IDecoder {
    decode(msg: INodeMessage): Promise<IMysensorsMsg| undefined>;
    encode(msg: IMysensorsMsg): INodeMessage| undefined;
}
