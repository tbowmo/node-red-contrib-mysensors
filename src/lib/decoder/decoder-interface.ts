import { IMysensorsMsg, INodeMessage } from '../mysensors-msg';

export interface IDecoder {
    decode(msg: Readonly<INodeMessage>): Promise<IMysensorsMsg| undefined>
    encode(msg: Readonly<IMysensorsMsg>): IMysensorsMsg| undefined
}
