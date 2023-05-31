import { INodeMessage, IStrongMysensorsMsg, MsgOrigin, MysensorsCommand } from '../mysensors-msg';
import { IStorage } from '../storage-interface';
import { IDecoder } from './decoder-interface';
import { MysensorsDecoder } from './mysensors-decoder';

export class MysensorsSerial extends MysensorsDecoder implements IDecoder {

    constructor(enrich?: boolean, database?: IStorage, private addNewline = false) {
        super(enrich, database);
    }

    public async decode(msg: Readonly<INodeMessage>): Promise<IStrongMysensorsMsg<MysensorsCommand>| undefined> {
        let message = msg.payload.toString();
        message = message.replace(/(\r\n|\n|\r)/gm, '');
        const tokens = message.split(';');

        if (tokens.length === 6) {
            const msgOut: IStrongMysensorsMsg<MysensorsCommand> = {
                ...msg,
                nodeId: parseInt(tokens[0], 10),
                childSensorId: parseInt(tokens[1], 10),
                messageType: parseInt(tokens[2], 10),
                ack: tokens[3] === '1' ? 1 : 0,
                subType: parseInt(tokens[4], 10),
                payload: tokens[5],
                origin: MsgOrigin.serial
            };

            return this.enrich(msgOut);
        }
    }

    public encode(
        msg: Readonly<IStrongMysensorsMsg<MysensorsCommand>>
    ): IStrongMysensorsMsg<MysensorsCommand> {
        // eslint-disable-next-line max-len
        const payload = [
            msg.nodeId,
            msg.childSensorId,
            msg.messageType,
            msg.ack,
            msg.subType,
            msg.payload
        ].join(';');
        return {
            ...msg,
            payload: `${payload}${this.addNewline ? '\n' : ''}`
        };
    }
}
