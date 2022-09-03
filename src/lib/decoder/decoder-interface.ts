import { INodeMessage, IStrongMysensorsMsg, MysensorsCommand } from '../mysensors-msg';

export interface IDecoder {
    decode(msg: Readonly<INodeMessage>): Promise<IStrongMysensorsMsg<MysensorsCommand>| undefined>
    encode(msg: Readonly<IStrongMysensorsMsg<MysensorsCommand>>): IStrongMysensorsMsg<MysensorsCommand>
}
